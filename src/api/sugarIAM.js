const debug = require('debug')('sugar:frauddetector:api')
const { IAM } = require("@aws-sdk/client-iam");
const get = require('lodash/get')

/** Wrapper class for IAM API integration */
module.exports = class SugarIAM {
  constructor(config) {
    this.config = config;
    this.iamClient = new IAM({ region: this.config.region });
  }

  /**
   * Gets the ARN associated with the RoleName if exists
   * @param {RoleName} RoleName 
   * @returns 
   */
  async getRoleArn(RoleName) {
    let awsRole = await this.iamClient.getRole({ RoleName })
      .catch(e => debug('Role not found, creating'))
    return get(awsRole, 'Role.Arn');
  }

  /**
   * Ensure this service has the proper role and policy.
   * Gives access to frauddetector to our specific bucket
   * @returns 
   */
  async ensureRoleAndPolicy() {
    const assumeRole = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": [
              "frauddetector.amazonaws.com"
            ]
          },
          "Action": [
            "sts:AssumeRole"
          ]
        }
      ]
    }
    const { iamRoleName } = this.config.fraudDetector;

    let awsRole = await this.getRoleArn(iamRoleName);

    if (!awsRole) {
      const params = {
        AssumeRolePolicyDocument: JSON.stringify(assumeRole),
        RoleName: iamRoleName,
        MaxSessionDuration: '3600',
        Path: '/service-role/',
        Tags: this.config.s3.tags
      };

      awsRole = await this.iamClient.createRole(params)
    }

    const policy = await this.createBucketPolicy().catch(e => console.error('No need for policy, skipping', e))
    if (!policy) return;

    const attach = {
      PolicyArn: policy.Policy.Arn,
      RoleName: iamRoleName
    };
    return this.iamClient.attachRolePolicy(attach)
  }

  /**
   * Creates a policy documents specific to our S3 bucekt
   * @returns 
   */
  async createBucketPolicy() {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "s3:ListBucket",
            "s3:GetBucketLocation"
          ],
          Effect: "Allow",
          Resource: [
            `arn:aws:s3:::${this.config.s3.training.bucketName}`
          ]
        },
        {
          Action: [
            "s3:GetObject"
          ],
          Effect: "Allow",
          Resource: [
            `arn:aws:s3:::${this.config.s3.training.bucketName}/*`
          ]
        }
      ]
    };

    const params = {
      PolicyDocument: JSON.stringify(policy),
      PolicyName: this.getPolicyName(),
      Tags: this.config.s3.tags
    };
    return this.iamClient.createPolicy(params);
  }

  /**
   * Returns the policy name from our configuration file
   * @returns 
   */
  getPolicyName() {
    return `${this.config.fraudDetector.iamRoleName}-${this.config.s3.training.bucketName}`;
  }

  /**
   * Tearsdown Role and Policies from IAM created by this service
   * @returns
  */
  async teardownRoleAndPolicy() {
    const { iamRoleName } = this.config.fraudDetector;
    const params = {
      RoleName: iamRoleName
    };
    const { AttachedPolicies } = await this.iamClient.listAttachedRolePolicies(params);
    const policies = AttachedPolicies.map((policy) => {
      const policyParam = {
        PolicyArn: policy.PolicyArn,
        PolicyName: policy.PolicyName,
        RoleName: iamRoleName
      };
      debug('Deleting RolePolicy with ', policyParam);
      return this.iamClient.detachRolePolicy(policyParam).then(() => this.iamClient.deletePolicy(policyParam));
    })

    debug('Deleting Role with ', params);
    return Promise.all(policies).then(() => this.iamClient.deleteRole(params))
  }
}
