<?php
$module_name = 'FD_SignupFraudDetection';
$viewdefs[$module_name] = 
array (
  'base' => 
  array (
    'view' => 
    array (
      'list' => 
      array (
        'panels' => 
        array (
          0 => 
          array (
            'label' => 'LBL_PANEL_DEFAULT',
            'fields' => 
            array (
              0 => 
              array (
                'name' => 'score',
                'label' => 'LBL_SCORE',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              1 => 
              array (
                'name' => 'outcome',
                'label' => 'LBL_OUTCOME',
                  'type' => 'fraud-outcome',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              2 => 
              array (
                'name' => 'status',
                'label' => 'LBL_STATUS',
                  'type' => 'fraud-status',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              3 => 
              array (
                'name' => 'ecomm_email',
                'label' => 'LBL_ECOMM_EMAIL',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              4 => 
              array (
                'name' => 'ip_address',
                'label' => 'LBL_IP_ADDRESS',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              5 => 
              array (
                'name' => 'first_name',
                'label' => 'LBL_FIRST_NAME',
                'enabled' => true,
                'default' => true,
              ),
              6 => 
              array (
                'name' => 'last_name',
                'label' => 'LBL_LAST_NAME',
                'enabled' => true,
                'default' => true,
              ),
              7 => 
              array (
                'name' => 'ttl_fraud_check',
                'label' => 'LBL_TTL_FRAUD_CHECK',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              8 => 
              array (
                'name' => 'primary_address_street',
                'label' => 'LBL_PRIMARY_ADDRESS_STREET',
                'default' => true,
                'enabled' => true,
              ),
              9 => 
              array (
                'name' => 'primary_address_city',
                'label' => 'LBL_PRIMARY_ADDRESS_CITY',
                'default' => true,
                'enabled' => true,
              ),
              10 => 
              array (
                'name' => 'primary_address_state',
                'label' => 'LBL_PRIMARY_ADDRESS_STATE',
                'default' => true,
                'enabled' => true,
              ),
              11 => 
              array (
                'name' => 'primary_address_postalcode',
                'label' => 'LBL_PRIMARY_ADDRESS_POSTALCODE',
                'default' => false,
                'enabled' => true,
              ),
              12 => 
              array (
                'name' => 'primary_address_country',
                'label' => 'LBL_PRIMARY_ADDRESS_COUNTRY',
                'enabled' => true,
                'default' => false,
              ),
              13 => 
              array (
                'name' => 'phone_home',
                'label' => 'LBL_HOME_PHONE',
                'default' => false,
                'enabled' => true,
              ),
              14 => 
              array (
                'name' => 'phone_mobile',
                'label' => 'LBL_MOBILE_PHONE',
                'default' => false,
                'enabled' => true,
              ),
              15 => 
              array (
                'name' => 'phone_other',
                'label' => 'LBL_WORK_PHONE',
                'default' => false,
                'enabled' => true,
              ),
              16 => 
              array (
                'name' => 'tag',
                'label' => 'LBL_TAGS',
                'enabled' => true,
                'default' => false,
              ),
              17 => 
              array (
                'name' => 'phone_fax',
                'label' => 'LBL_FAX_PHONE',
                'default' => false,
                'enabled' => true,
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);
