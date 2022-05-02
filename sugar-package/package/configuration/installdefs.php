<?php
$installdefs['post_execute'] = ['<basepath>/scripts/post_execute.php'];
$installdefs['post_uninstall'] = ['<basepath>/scripts/post_uninstall.php'];

$installdefs['custom_fields'] = [];

$installdefs['beans'] = [
    [
        'module' => 'FD_SignupFraudDetection',
        'class' => 'FD_SignupFraudDetection',
        'path' => 'modules/FD_SignupFraudDetection/FD_SignupFraudDetection.php',
        'tab' => true,
    ],
    [
        'module' => 'FD_TransactionFraudDetect',
        'class' => 'FD_TransactionFraudDetect',
        'path' => 'modules/FD_TransactionFraudDetect/FD_TransactionFraudDetect.php',
        'tab' => true,
    ]
    ];
