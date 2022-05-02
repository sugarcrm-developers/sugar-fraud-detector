const BaseService = require('./base')

/** Account service class that extends base overriding/implementing required methods */
module.exports = class AccountService extends BaseService {
    constructor(config, iamRoleARN) {
        super(config, iamRoleARN);
    }

    getFraudDetectorType() {
        return this.config.fraudDetector.accounts;
    }

    getS3FilePath() {
        return `${this.config.s3.training.uri}/${this.config.fraudDetector.accounts.csvFileName}`;
    }

    async uploadCsvTrainingData(sugarS3) {
        return sugarS3.uploadFile(this.config.fraudDetector.accounts.csvFileName);
    }

    async teardownDataset(sugarS3) {
        return sugarS3.deleteObject(this.config.fraudDetector.accounts.csvFileName);
    }
}