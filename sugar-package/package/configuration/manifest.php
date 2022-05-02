<?php
/*
 * Your installation or use of this SugarCRM file is subject to the applicable
 * terms available at
 * http://support.sugarcrm.com/Resources/Master_Subscription_Agreements/.
 * If you do not agree to all of the applicable terms or do not have the
 * authority to bind the entity as an authorized representative, then do not
 * install or use this SugarCRM file.
 *
 * Copyright (C) SugarCRM Inc. All rights reserved.
 */

$manifest['id'] = 'ecomm_fraud_detection_sugar';
$manifest['built_in_version'] = '11.2.0';
$manifest['name'] = 'AWS powered fraud detection to Sugar Sell';
$manifest['description'] = 'AWS powered fraud detection to Sugar Sell';
$manifest['author'] = 'SugarCRM Inc.';
$manifest['acceptable_sugar_versions']['regex_matches'] = [
    '^11\.[3-9]\.[\d]$',
    '^12\.[\d]\.[\d]$',
    '^13\.[\d]\.[\d]$',
];
$manifest['readme'] = '';
$manifest['key'] = '';
$manifest['remove_tables'] = 'false';
$manifest['is_uninstallable'] = 'true';
$manifest['uninstall_before_upgrade'] = false;
