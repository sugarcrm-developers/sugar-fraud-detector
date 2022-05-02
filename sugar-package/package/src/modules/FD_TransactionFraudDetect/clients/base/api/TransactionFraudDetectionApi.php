<?php

use Aws\FraudDetector\FraudDetectorClient;

class TransactionFraudDetectionApi extends ModuleApi
{
    private $fraudDetectorClient;

    public function __construct()
    {
        parent::__construct();
        $admin = BeanFactory::getBean('Administration');
        $fraud = $admin->retrieveSettings('fraud', true)->settings;
        $credentials = new Aws\Credentials\Credentials($fraud["fraud_key"], $fraud["fraud_secret"]);

        $this->fraudDetectorClient = new FraudDetectorClient([
            'version' => 'latest',
            'region' => 'us-east-1',
            'credentials' => $credentials
        ]);
    }

    public function registerApiRest()
    {
        return [
            'transaction' => [
                'reqType' => 'POST',
                'path' => ['FraudDetection', 'EComm', 'transaction'],
                'pathVars' => [],
                'method' => 'fraudDetectionTransaction',
                'shortHelp' => 'Fraud Detection Scoring for Ecomm Transactions'
            ],
        ];
    }

    /**
     * Fraud detection for transactions follow these rules:
     * @return string
     */
    public function fraudDetectionTransaction($api, $args)
    {
        try {
            $signupBean = BeanFactory::newBean('FD_TransactionFraudDetect');
            $sugarQuery = new SugarQuery();
            $sugarQuery->select(array('status', 'ttl_fraud_check'));
            $sugarQuery->from($signupBean);
            $sugarQuery->where()
                ->equals('txn_num', $args['txn_num'])
                ->equals('cc_last_6', $args['cc_last_6']);

            $result = $sugarQuery->execute();
            $checkAws = true;
            if (count($result) > 0) {
                $args['outcome'] = $result[0]['status'];
                $checkAws = false;
                // you may want to always check for fraud regardless of the results?!
//                if($result[0]['ttl_fraud_check'] > today?!) {
//                }
            }
            if ($checkAws) {
                //we can recheck at aws hourly due to the uniqueness of the enventID, if more frequent, add minutes to it
                $awsResult = $this->fraudDetectorClient->getEventPrediction([
                    'detectorId' => 'transaction_detector_logic', // REQUIRED
                    'detectorVersionId' => '1',
                    'entities' => [ // REQUIRED
                        [
                            'entityId' => $args['cc_last_6'], // REQUIRED
                            'entityType' => 'transaction', // REQUIRED
                        ],
                    ],
                    'eventId' => $args['txn_num'], // REQUIRED (unique ID that represents signup+email+ip+today+hour)
                    'eventTimestamp' => date('Y-m-d\TH:i:s.Z\Z', time()), // REQUIRED
                    'eventTypeName' => 'credit_card_transactions', // REQUIRED
                    'eventVariables' => [
                        'trans_num' => $args['txn_num'],
                        'amt' => strval($args['amount']),
                        'cc_num' => $args['cc_last_6'],
                        'category' => 'shopping_net',
                        'zip' => $args['postcode']
                    ]
                ]);
                $ruleResults = $awsResult['ruleResults'];
                $outcome = $ruleResults[0]['outcomes'][0];
                $score = array_values($awsResult['modelScores'][0]['scores'])[0];

                $timedate = new TimeDate();
                $date = new DateTime();
                $date->add(new DateInterval('PT1H')); //add 1h as TTL

                $signupBean->populateFromRow($args);
                $signupBean->ttl_fraud_check = $timedate->asDb($date, null);
                $signupBean->score = $score;
                $signupBean->outcome = $outcome;
                $signupBean->status = 'new';
                $id = $signupBean->save();

                $args['outcome'] = $outcome;

                return $args;
            }
            return $args;
        } catch (Exception $e) {
            throw new SugarApiExceptionNotFound($e->getMessage(), null, null, 0, $e);
        }
    }
}