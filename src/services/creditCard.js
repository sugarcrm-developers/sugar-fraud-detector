const BaseService = require('./base')

/** Credit Card Transaction service class that extends base overriding/implementing required methods */
module.exports = class CreditCardService extends BaseService {
    constructor(config, iamRoleARN) {
        super(config, iamRoleARN);
    }

    getFraudDetectorType() {
        return this.config.fraudDetector.transactions;
    }

    getS3FilePath() {
        return `${this.config.s3.training.uri}/${this.config.fraudDetector.transactions.csvFileName}`;
    }

    async uploadCsvTrainingData(sugarS3) {
        return sugarS3.uploadFile(this.config.fraudDetector.transactions.csvFileName);
    }

    async teardownDataset(sugarS3) {
        return sugarS3.deleteObject(this.config.fraudDetector.transactions.csvFileName);
    }
}