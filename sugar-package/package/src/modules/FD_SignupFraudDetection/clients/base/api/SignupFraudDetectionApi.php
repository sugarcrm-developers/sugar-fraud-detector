<?php

use Aws\FraudDetector\FraudDetectorClient;

class SignupFraudDetectionApi extends ModuleApi
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
            'signup' => [
                'reqType' => 'POST',
                'path' => ['FraudDetection', 'EComm', 'signup'],
                'pathVars' => [],
                'method' => 'fraudDetectionSignup',
                'shortHelp' => 'Fraud Detection Scoring for Ecomm Signups'
            ]
        ];
    }

    /**
     * Fraud detection for signups follow these rules:
     * 1- Check in the database (for this email) when was last checked (ttl for last check)
     *  1.1 - we dont wanna trigger AWS every single click of the user, will most likely have same results
     * 2 - Trigger AWS Fraud Detection system and get the score
     * 3 - Evaluate outcome and allow transaction to go through
     * 4 - Store results and trigger BPM
     * @return string
     */
    public function fraudDetectionSignup($api, $args)
    {
        try {
            $signupBean = BeanFactory::newBean('FD_SignupFraudDetection');
            $sugarQuery = new SugarQuery();
            $sugarQuery->select(array('status', 'ttl_fraud_check'));
            $sugarQuery->from($signupBean);
            $sugarQuery->where()
                ->equals('ecomm_email', $args['ecomm_email'])
                ->equals('ip_address', $args['ip_address']);

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
                    'detectorId' => 'account_detector_logic', // REQUIRED
                    'detectorVersionId' => '1',
                    'entities' => [ // REQUIRED
                        [
                            'entityId' => $args['ecomm_email'], // REQUIRED
                            'entityType' => 'account', // REQUIRED
                        ],
                    ],
                    'eventId' => preg_replace('/[^A-Za-z0-9\-]/', '', 'signup' . date('YmdH', time()) . $args['ecomm_email'] . $args['ip_address']), // REQUIRED (unique ID that represents signup+email+ip+today+hour)
                    'eventTimestamp' => date('Y-m-d\TH:i:s.Z\Z', time()), // REQUIRED
                    'eventTypeName' => 'account_signup', // REQUIRED
                    'eventVariables' => [
                        'email_address' => $args['ecomm_email'],
                        'ip_address' => $args['ip_address']
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