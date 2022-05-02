module.exports = {
    region: process.env.AWS_API_REGION || 'us-east-1',
    fraudDetector: {
        iamRoleName: 'AWSFraudDetector-DataAccessRole',
        accounts: {
            csvFileName: 'registration_data_20K_minimum.csv',
            eventType: {
                name: 'account_signup',
                description: 'Indicates an activity that is evaluated for fraud risk'
            },
            entityType: {
                name: 'account',
                description: 'End user sends account related data'
            },
            detector: {
                id: 'account_detector_logic',
                description: 'This detector uses model scores and rules to predict fradulent account signups',
                rules: [
                    {
                        id: 'high_risk_fraud',
                        description: 'This rule/outcome is for a high risk fraud',
                        expression: '$|MODELNAME|_insightscore > 900',
                        outcomes: ['fraud']
                    },
                    {
                        id: 'review_fraud',
                        description: 'This rule/outcome outcome inconclusive fraud',
                        expression: '$|MODELNAME|_insightscore <= 900 and $|MODELNAME|_insightscore > 700',
                        outcomes: ['review']
                    },
                    {
                        id: 'legit_approved',
                        description: 'This rule/outcome approves legit events',
                        expression: '$|MODELNAME|_insightscore <= 700',
                        outcomes: ['approved']
                    },
                ]
            },
            model: {
                id: 'fraud_detection_account',
                description: 'Model for detecting fraudulent signup events',
                labelMapper: {
                    'FRAUD': ['fraud'],
                    'LEGIT': ['legit']
                }
            },
            variables: [
                {
                    name: 'email_address',
                    variableType: 'EMAIL_ADDRESS',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'Email address collected during the event',
                },
                {
                    name: 'ip_address',
                    variableType: 'IP_ADDRESS',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'IP address collected during the event',
                },
            ],
            labels: [
                {
                    name: 'fraud',
                    description: 'Indicates a fraudlent event in our dataset',
                },
                {
                    name: 'legit',
                    description: 'Indicates a legit event in our dataset',
                },
            ]
        },
        transactions: {
            csvFileName: 'fraudTrain_2020.csv',
            eventType: {
                name: 'credit_card_transactions',
                description: 'Indicates an activity that is evaluated for fraud risk'
            },
            entityType: {
                name: 'transaction',
                description: 'End user sends credit card transaction related data'
            },
            detector: {
                id: 'transaction_detector_logic',
                description: 'This detector uses model scores and rules to predict fradulent credit card transactions',
                rules: [
                    {
                        id: 'high_risk_fraud',
                        description: 'This rule/outcome is for a high risk fraud',
                        expression: '$|MODELNAME|_insightscore > 900',
                        outcomes: ['fraud']
                    },
                    {
                        id: 'review_fraud',
                        description: 'This rule/outcome outcome inconclusive fraud',
                        expression: '$|MODELNAME|_insightscore <= 900 and $|MODELNAME|_insightscore > 700',
                        outcomes: ['review']
                    },
                    {
                        id: 'legit_approved',
                        description: 'This rule/outcome approves legit events',
                        expression: '$|MODELNAME|_insightscore <= 700',
                        outcomes: ['approved']
                    },
                ]
            },
            model: {
                id: 'fraud_detection_transaction',
                description: 'Model for detecting fraudulent credit card transactions events',
                labelMapper: {
                    'FRAUD': ['fraud'],
                    'LEGIT': ['legit']
                }
            },
            variables: [
                {
                    name: 'cc_num',
                    variableType: 'CARD_BIN',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'Payment Card BIN number collected during the event',
                },
                {
                    name: 'zip',
                    variableType: 'BILLING_ZIP',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'Billing address postal code collected during the event',
                },
                {
                    name: 'category',
                    variableType: 'PRODUCT_CATEGORY',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'Category collected during the event',
                },
                {
                    name: 'amt',
                    variableType: 'PRICE',
                    dataSource: 'EVENT',
                    dataType: 'FLOAT',
                    defaultValue: '0.0',
                    description: 'Total transaction amount collected during the event',
                },
                {
                    name: 'trans_num',
                    variableType: 'AUTH_CODE',
                    dataSource: 'EVENT',
                    dataType: 'STRING',
                    defaultValue: '<unknown>',
                    description: 'Transaction authorization code collected during the event',
                },
            ],
            labels: [
                {
                    name: 'fraud',
                    description: 'Indicates a fraudlent event in our dataset',
                },
                {
                    name: 'legit',
                    description: 'Indicates a legit event in our dataset',
                },
            ]
        },
        tags: [
            { key: 'CostCenter', value: 'SomeCostCenter' },
            { key: 'Project', value: 'SugarCRMFraudDetectorWithAWS' },
        ]
    },
    s3: {
        training: {
            bucketName: 'sugar-fraud-training-rafa',
            datasetFolder: '/Users/rafael.fernandes/Documents/SugarCRM/sample/SugarFraudDetector/src/dataset/',
            uri: 's3://sugar-fraud-training-rafa'
        },
        tags: [
            { Key: 'CostCenter', Value: 'SomeCostCenter' },
            { Key: 'Project', Value: 'SugarCRMFraudDetectorWithAWS' },
        ]
    }
}
