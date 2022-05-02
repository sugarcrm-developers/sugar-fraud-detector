const debug = require('debug')('sugar:frauddetector:service')
const SugarFraudDetector = require('../api/sugarFraudDetector')

/** Base service class that orchestrates resources */
module.exports = class BaseService {
    constructor(config, iamRoleARN) {
      this.config = config;
      this.sugarFraudDetector = new SugarFraudDetector(config, this.getFraudDetectorType());
      this.iamRoleARN = iamRoleARN;
    }

    /**
     * Basic Fraud Detector setup.
     * It creates resources in order of usage and dependency.
     * Awaits resources to become available when necessary
     * If there's a failure (we assume resource is already in place)
     */
    async setupFraudDetector() {      
        debug('=========> Start Setting Up FraudDetector <=========')
        // //Step 2: Create variables, entity type, and labels
        await this.sugarFraudDetector.createEntityType();
        await this.sugarFraudDetector.createVariables();
        await this.sugarFraudDetector.createLabels();
      
        // //Step 3: Create event type
        await this.sugarFraudDetector.createEventType();
      
        // //Step 4: Create and train a model
        await this.sugarFraudDetector.createModel().catch(e => debug('Assuming Model already exists, skipping'));
        
        await this.sugarFraudDetector.trainModel(
          this.iamRoleARN,
          this.getS3FilePath()
        );
      
        const latestModelVersion = await this.sugarFraudDetector.getLatestModelVersion();
        await this.sugarFraudDetector.awaitTrainingModelAndDeploy(latestModelVersion);
      
        //Step 5: Create a detector, outcome, rules, and detector version
        await this.sugarFraudDetector.createOutcomes();
        await this.sugarFraudDetector.createDetector(latestModelVersion);
        await this.sugarFraudDetector.createRules();
        await this.sugarFraudDetector.createDetectorVersion(latestModelVersion);
        await this.sugarFraudDetector.deployDetector();
        debug('=========> DONE Setting Up FraudDetector <=========')
    }

    /**
     * Basic Fraud Detector teardown.
     * It tears down (clean up) resources in order of usage and dependency.
     * Awaits resources to become inactive when necessary
     * If there's a failure (we assume resource is already deleted)
     */
    async teardownFraudDetector() {
        debug('=========> Start tearingdown FraudDetector <=========')

        await this.sugarFraudDetector.teardownDetectorVersion().catch((e) => console.error('teardownDetectorVersion failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownDetector().catch((e) => console.error('teardownDetector failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownModelVersion().catch((e) => console.error('teardownModelVersion failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownModel().catch((e) => console.error('teardownModel failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownEventsByEventType().catch((e) => console.error('teardownEventsByEventType failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownEventTypes().catch((e) => console.error('teardownEvents failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownEntityTypes().catch((e) => console.error('teardownEntityTypes failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownOutcomes().catch((e) => console.error('teardownOutcomes failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownLabels().catch((e) => console.error('teardownLabels failed, will continue.\n', e));
        await this.sugarFraudDetector.teardownVariables().catch((e) => console.error('teardownVariables failed, will continue.\n', e));
        
        debug('=========> DONE tearingdown FraudDetector <=========')
    }

    getFraudDetectorType() {
        throw new Error('Inherited class should implement this.')
    }

    getS3FilePath() {
        throw new Error('Inherited class should implement this.')
    }

    async uploadCsvTrainingData(sugarS3) {
        throw new Error('Inherited class should implement this.')
    }

    async teardownDataset(sugarS3) {
        throw new Error('Inherited class should implement this.')
    }
}