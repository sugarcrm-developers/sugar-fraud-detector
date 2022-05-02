require('dotenv').config()
const debug = require('debug')('sugar:frauddetector:teardown')

const config = require('./config')
const SugarIAM = require('./api/sugarIAM')
const SugarS3 = require('./api/sugarS3')
const CreditCardService = require('./services/creditCard')
const AccountService = require('./services/account')

async function start() {
  const sugarIAM = new SugarIAM(config);
  const sugarS3 = new SugarS3(config);
  const { iamRoleName } = config.fraudDetector;

  const iamRoleARN = await sugarIAM.getRoleArn(iamRoleName);
  const accountService = new AccountService(config, iamRoleARN);
  const creditCardService = new CreditCardService(config, iamRoleARN);

  await Promise.all([
    accountService.teardownFraudDetector(),
    accountService.teardownDataset(sugarS3).catch((e) => console.error('teardownDataset failed', e)),
    creditCardService.teardownFraudDetector(),
    creditCardService.teardownDataset(sugarS3).catch((e) => console.error('teardownDataset failed', e))
  ]);
  await sugarS3.teardownBucket().catch((e) => console.error('teardownBucket failed', e));
  await sugarIAM.teardownRoleAndPolicy().catch((e) => console.error('teardownRoleAndPolicy failed', e));
}

start();