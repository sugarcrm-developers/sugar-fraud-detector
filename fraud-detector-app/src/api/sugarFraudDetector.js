const debug = require('debug')('sugar:frauddetector:api')
const { FraudDetector } = require("@aws-sdk/client-frauddetector");
const { get, map, last, replace, pick } = require('lodash');
const sleep = require('../utils/sleep')

/** 
 * Wrapper class for FraudDetector API integration 
 * It does have logic to ensure dependencies are respected while
 * creating or tearing down resources.
*/
module.exports = class SugarFraudDetector {
  constructor(config, fraudDetectorType) {
    this.config = config;
    this.fraudDetector = new FraudDetector({ region: this.config.region });
    this.fraudDetectorType = fraudDetectorType;
  }

  /**
   * Create variable resources in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
  async createVariables() {
    const { variables } = this.fraudDetectorType;
    const params = {
      variableEntries: variables,
      tags: this.config.fraudDetector.tags
    }

    debug('Creating Variables with ', params);
    return this.fraudDetector.batchCreateVariable(params);
  }

  /**
   * Create EntityType resources in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
   async createEntityType() {
    const { entityType } = this.fraudDetectorType;
    const params = {
      ...entityType,
      tags: this.config.fraudDetector.tags
    };

    debug('Creating Entity Type with ', params);
    return this.fraudDetector.putEntityType(params);
  }

  /**
   * Create Labes resources in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
   async createLabels() {
    const { labels } = this.fraudDetectorType;
    const all = labels.map((label) => {
      const params = {
        name: label.name,
        description: label.description,
        tags: this.config.fraudDetector.tags
      };

      debug('Creating Label with ', params);
      return this.fraudDetector.putLabel(params);
    })
    return Promise.all(all);
  }

  /**
   * Create Outcomes resources in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
   async createOutcomes() {
    const { rules } = this.fraudDetectorType.detector;
    //outcomes are defined inside rules, just loop and create them
    const all = rules.map((rule) => {
      const params = {
        name: get(rule, 'outcomes[0]'),
        description: rule.description,
        tags: this.config.fraudDetector.tags
      };

      debug('Creating outcomes with ', params);
      return this.fraudDetector.putOutcome(params);
    })
    debug('Awaiting outcomes to be created...')
    return Promise.all(all);
  }

  /**
   * Create EventType resources in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
   async createEventType() {
    const { eventType, entityType, variables, labels } = this.fraudDetectorType;
    const params = {
      name: eventType.name,
      description: eventType.name,
      entityTypes: [entityType.name],
      eventVariables: map(variables, 'name'),
      labels: map(labels, 'name'),
      tags: this.config.fraudDetector.tags
    };

    debug('Creating Event Type with ', params);
    return this.fraudDetector.putEventType(params);
  }

  /**
   * Creates a Model in the FraudDetector service
   * It reads from the config file.
   * 
   * @returns 
   */
   async createModel() {
    const { eventType, model } = this.fraudDetectorType;
    const params = {
      eventTypeName: eventType.name,
      modelId: model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS',
      description: model.description,
      tags: this.config.fraudDetector.tags
    };

    debug('Creating model with ', params);
    return this.fraudDetector.createModel(params);
  }

  /**
   * Creates a new Model Version and start the training process.
   * 
   * @param {iamRoleName} iamRoleName with access to the S3 file location
   * @param {dataLocation} dataLocation S3 location of your training data
   * @returns 
   */
   async trainModel(iamRoleName, dataLocation) {
    const type = this.fraudDetectorType;
    const params = {
      modelId: type.model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS',
      trainingDataSchema: {
        labelSchema: {
          labelMapper: type.model.labelMapper
        },
        modelVariables: map(type.variables, 'name')
      },
      trainingDataSource: 'EXTERNAL_EVENTS',
      externalEventsDetail: {
        dataAccessRoleArn: iamRoleName,
        dataLocation
      },
      tags: this.config.fraudDetector.tags
    };

    debug('Training model with ', params);
    return this.fraudDetector.createModelVersion(params);
  }

  /**
   * Get the latest model version associated to our config model
   * 
   * @returns 
   */
  async getLatestModelVersion() {
    const params = {
      modelId: this.fraudDetectorType.model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS'
    };
    const version = await this.fraudDetector.describeModelVersions(params);
    return get(last(version.modelVersionDetails), 'modelVersionNumber');
  }

  /**
   * Awaits a model to be trained for 100 minutes (50 x 2min).
   * When the model version is ready, it changes its status to complete
   * Training Complete has to be updated to Active to be used in detectors.
   * 
   * @param {modelVersionNumber} modelVersionNumber latest model to wait for
   * @returns 
   */
  async awaitTrainingModelAndDeploy(modelVersionNumber) {
    debug('Awaiting model training.')
    const params = {
      modelId: this.fraudDetectorType.model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS',
      modelVersionNumber
    };

    for (let i = 0; i < 50; i++) { //wait for about 100min to train and deploy
      const version = await this.fraudDetector.getModelVersion(params);
      debug(`\tModel is [${version.status}]`);
      if (version.status === 'TRAINING_COMPLETE') {
        debug('Model training completed! Now Deploying...')
        params.status = 'ACTIVE'
        await this.fraudDetector.updateModelVersionStatus(params);
      } else if (version.status === 'ACTIVE') {
        return true;
      }
      await sleep(2 * 60 * 1000);
      debug('\tModel is not ready yet, waiting...');
    }
    throw new Error('Model needs more time to train, manually wait and retrigger.')
  }

  /**
   * Creates a new detector based on the config file
   * @returns 
   */
  async createDetector() {
    const type = this.fraudDetectorType;
    const params = {
      detectorId: type.detector.id,
      eventTypeName: type.eventType.name,
      description: type.detector.description,
      tags: this.config.fraudDetector.tags
    };

    return this.fraudDetector.putDetector(params);
  }

  /**
   * Create Rules resources in the FraudDetector service
   * Expression: it does use the model name along with [_insightscore]
   * that score is a variable field provided by the model after scoring.
   * We just replace the MODELNAME with the real name.
   * You could prefix the name in the config too, both works
   * 
   * @returns 
   */
  async createRules() {
    const { detector, model } = this.fraudDetectorType;
    const all = detector.rules.map((rule) => {
      const params = {
        detectorId: detector.id,
        expression: replace(rule.expression, /\|MODELNAME\|/g, model.id),
        language: 'DETECTORPL',
        outcomes: rule.outcomes,
        ruleId: rule.id,
        description: rule.description,
        tags: this.config.fraudDetector.tags
      };

      debug('Creating rules with ', params);
      return this.fraudDetector.createRule(params);
    })
    return Promise.all(all);
  }

  /**
   * Create a new Model Version (hard codes 1 as the version for all rules)
   * @param {*} modelVersionNumber 
   * @returns 
   */
  async createDetectorVersion(modelVersionNumber) {
    const { detector, model } = this.fraudDetectorType;
    const rules = map(detector.rules, (rule) => {
      return {
        detectorId: detector.id,
        ruleId: rule.id,
        ruleVersion: '1' //let's assume version 1, if you have more versions, you gotta retrieve and place it here
      };
    });
    const params = {
      detectorId: detector.id,
      description: detector.description,
      rules,
      modelVersions: [
        {
          modelId: model.id,
          modelType: 'ONLINE_FRAUD_INSIGHTS',
          modelVersionNumber
        },
      ],
      ruleExecutionMode: 'FIRST_MATCHED',
      tags: this.config.fraudDetector.tags
    };

    debug('Creating detector version with ', params);
    return this.fraudDetector.createDetectorVersion(params);
  }

  /**
   * Deploys a new detector version (hard codes 1 as the version)
   * @returns 
   */
  async deployDetector() {
    const { detector } = this.fraudDetectorType;
    const params = {
      detectorId: detector.id,
      detectorVersionId: '1', //let's assume version 1, if you have more versions, you gotta retrieve and place it here
      status: 'ACTIVE'
    };

    debug('Deploying detector version with ', params);
    return this.fraudDetector.updateDetectorVersionStatus(params);
  }

  /**
   * Tears down a detector version (hard coded version '1').
   * Sets it to INACTIVE and deletes when it's done
   * @returns 
   */
  async teardownDetectorVersion() {
    const { detector } = this.fraudDetectorType;
    const params = {
      detectorId: detector.id,
      detectorVersionId: '1', //let's assume version 1, if you have more versions, you gotta retrieve and place it here
      status: 'INACTIVE'
    };

    debug('Deleting detector version with ', params);
    return this.fraudDetector.updateDetectorVersionStatus(params).then(() => this.fraudDetector.deleteDetectorVersion(params))
  }

  /**
   * Tears down a detector along with its dependent rules.
   * Will only teardown rules defined in the config.js
   * @returns 
   */
  async teardownDetector() {
    const { detector } = this.fraudDetectorType;
    const params = {
      detectorId: detector.id
    };

    const rules = map(detector.rules, (mapRule) => {
      const rule = {
        detectorId: detector.id,
        ruleId: mapRule.id,
        ruleVersion: '1' //let's assume version 1, if you have more versions, you gotta retrieve and place it here
      };
      debug('Deleting rules with ', { rule });
      return this.fraudDetector.deleteRule({ rule });
    });

    debug('Deleting detector with ', params);
    return Promise.all(rules).then(() => this.fraudDetector.deleteDetector(params))
  }

  /**
   * Tears down all related versions from the model.
   * It sets them as INACTIVE (undeploying them).
   * Can only teardown after it's undeployed
   */
  async teardownModelVersion() {
    const params = {
      modelId: this.fraudDetectorType.model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS'
    };
    const { modelVersionDetails } = await this.fraudDetector.describeModelVersions(params);
    const updateVersions = modelVersionDetails.map((version) => {
      const versionParams = pick(version, ['modelId', 'modelType', 'modelVersionNumber', 'status']);
      versionParams.status = 'INACTIVE';
      debug('Undeploying model version with ', versionParams);
      return this.fraudDetector.updateModelVersionStatus(versionParams);
    });

    debug('Undeploy detector version with ', params);
    return Promise.all(updateVersions);
  }

  /**
   * Await all model versions to be undeployed.
   * When model versions are done undeploying, delete them all.
   * When no more model versions, delete the model itself
   * @returns 
   */
  async teardownModel() {
    debug('Awaiting undeploying model version.')
    const params = {
      modelId: this.fraudDetectorType.model.id,
      modelType: 'ONLINE_FRAUD_INSIGHTS'
    };

    const { modelVersionDetails } = await this.fraudDetector.describeModelVersions(params);
    const undeploying = modelVersionDetails.map((version) => {
      const versionParams = pick(version, ['modelId', 'modelType', 'modelVersionNumber', 'status']);
      versionParams.status = 'INACTIVE';
      debug('Undeploying model version with ', versionParams);
      return this.awaitUndeployModelVersion(versionParams);
    });

    return Promise.all(undeploying)
      // .then(() => undeploying.map((version) => this.fraudDetector.deleteModelVersion(version) ))
      .then((versions) => versions.map((version) => this.fraudDetector.deleteModelVersion(version)))
      .then(() => this.fraudDetector.deleteModel(params))
      ;
  }

  /**
   * Awaits a specific model version to finalize undeploying.
   * It might be "READY TO DEPLOY" which is also ready to be deleted.
   * @param {*} params 
   * @returns 
   */
  async awaitUndeployModelVersion(params) {
    for (let i = 0; i < 50; i++) { //wait for about 100min to train and deploy
      const version = await this.fraudDetector.getModelVersion(params);
      debug(`\tModel is [${version.status}]`);
      if (version.status === 'INACTIVE' || version.status === 'TRAINING_COMPLETE') {
        return params;
      }
      await sleep(2 * 60 * 1000);
      debug('\tModel is not ready INACTIVE, waiting...');
    }
    throw new Error('Model needs more time to undeploy.')
  }


  /**
   * Tears down event type resources
   * @returns 
   */
   async teardownEventsByEventType() {
    const { eventType, entityType } = this.fraudDetectorType;
    const params = {
      eventTypeName: eventType.name
    };

    debug('Deleting Events by EventType with ', params);
    
    await this.fraudDetector.deleteEventsByEventType(params);

    for (let i = 0; i < 50; i++) { //wait for about 100min to train and deploy
      const version = await this.fraudDetector.getDeleteEventsByEventTypeStatus(params);
      debug(`\tDeleting Events by EventType is [${version.eventsDeletionStatus}]`);
      if (version.eventsDeletionStatus === 'COMPLETE') {
        return params;
      }
      await sleep(2 * 60 * 1000);
      debug('\tDeleting Events by EventType is not ready COMPLETE, waiting...');
    }
    throw new Error('Model needs more time to undeploy.')
  }
  
  /**
   * Tears down event type resources
   * @returns 
   */
  async teardownEventTypes() {
    const { eventType, entityType } = this.fraudDetectorType;
    const params = {
      name: eventType.name
    };

    debug('Deleting Event Type with ', params);
    return this.fraudDetector.deleteEventType(params);
  }

  /**
   * Tears down eventityent type resources
   * @returns 
   */
   async teardownEntityTypes() {
    const { entityType } = this.fraudDetectorType;
    const params = {
      name: entityType.name
    };

    debug('Deleting EntityType with ', params);
    return this.fraudDetector.deleteEntityType(params);
  }

  /**
   * Tears down outcomes resources
   * @returns 
   */
   async teardownOutcomes() {
    const { rules } = this.fraudDetectorType.detector;
    //outcomes are defined inside rules, just loop and remove them
    const all = rules.map((rule) => {
      const params = {
        name: get(rule, 'outcomes[0]')
      };

      debug('Removing outcomes with ', params);
      return this.fraudDetector.deleteOutcome(params);
    })
    debug('Awaiting outcomes to be deleted...')
    return Promise.all(all);
  }

  /**
   * Tears down labels resources
   * @returns 
   */
   async teardownLabels() {
    const { labels } = this.fraudDetectorType;
    const all = labels.map((label) => {
      const params = {
        name: label.name
      };

      debug('Deleting Label with ', params);
      return this.fraudDetector.deleteLabel(params);
    })
    return Promise.all(all);
  }

  /**
   * Tears down variables resources
   * @returns 
   */
   async teardownVariables() {
    const { variables } = this.fraudDetectorType;
    const all = variables.map((variable) => {
      const params = {
        name: variable.name
      };

      debug('Deleting Variable with ', params);
      return this.fraudDetector.deleteVariable(params);
    })
    return Promise.all(all);
  }
}
