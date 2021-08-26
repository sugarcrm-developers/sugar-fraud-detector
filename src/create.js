require('dotenv').config()

const debug = require('debug')('sugar:frauddetector:create')
const config = require('./config')
const SugarIAM = require('./api/sugarIAM')
const SugarS3 = require('./api/sugarS3')
const CreditCardService = require('./services/creditCard')
const AccountService = require('./services/account')

async function start() {
  const sugarIAM = new SugarIAM(config);
  const sugarS3 = new SugarS3(config);
  const { iamRoleName } = config.fraudDetector;
  await sugarS3.createBucketIfNotExists();
  //if you'd like to upload the folder with all files within just uncomment this and comment the individual uploads
  // await sugarS3.uploadFolder(config.fraudDetector.training.datasetFolder);

  await sugarIAM.ensureRoleAndPolicy();
  const iamRoleARN = await sugarIAM.getRoleArn(iamRoleName);
  const creditCardService = new CreditCardService(config, iamRoleARN);
  await creditCardService.uploadCsvTrainingData(sugarS3);

  const accountService = new AccountService(config, iamRoleARN);
  await accountService.uploadCsvTrainingData(sugarS3);

  await Promise.all([
    accountService.setupFraudDetector(),
    creditCardService.setupFraudDetector()
  ])
}

start();