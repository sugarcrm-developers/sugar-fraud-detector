<?php
$module_name = 'FD_TransactionFraudDetect';
$_module_name = 'fd_transactionfrauddetect';
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
                'name' => 'amount',
                'label' => 'LBL_LIST_AMOUNT',
                'align' => 'right',
                'default' => true,
                'enabled' => true,
                'related_fields' => 
                array (
                  0 => 'currency_id',
                  1 => 'base_rate',
                ),
              ),
              3 => 
              array (
                'name' => 'fd_transactionfrauddetect_type',
                'label' => 'LBL_TYPE',
                'type' => 'card-type',
                'default' => true,
                'enabled' => true,
              ),
              4 => 
              array (
                'name' => 'cc_last_6',
                'label' => 'LBL_CC_LAST_6',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              5 => 
              array (
                'name' => 'cc_month_year',
                'label' => 'LBL_CC_MONTH_YEAR',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              6 => 
              array (
                'name' => 'txn_num',
                'label' => 'LBL_TXN_NUM',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              7 => 
              array (
                'name' => 'ecomm_email',
                'label' => 'LBL_ECOMM_EMAIL',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              8 => 
              array (
                'name' => 'ttl_fraud_check',
                'label' => 'LBL_TTL_FRAUD_CHECK',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              9 => 
              array (
                'name' => 'name',
                'label' => 'LBL_LIST_SALE_NAME',
                'link' => true,
                'default' => true,
                'enabled' => true,
              ),
              10 => 
              array (
                'name' => 'postal_code',
                'label' => 'LBL_POSTAL_CODE',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              11 => 
              array (
                'name' => 'status',
                'label' => 'LBL_STATUS',
                'type' => 'fraud-status',
                'enabled' => true,
                'readonly' => false,
                'default' => true,
              ),
              12 => 
              array (
                'name' => 'lead_source',
                'label' => 'LBL_LEAD_SOURCE',
                'default' => false,
                'enabled' => true,
              ),
              13 => 
              array (
                'name' => 'next_step',
                'label' => 'LBL_NEXT_STEP',
                'default' => false,
                'enabled' => true,
              ),
              14 => 
              array (
                'name' => 'probability',
                'label' => 'LBL_PROBABILITY',
                'default' => false,
                'enabled' => true,
              ),
              15 => 
              array (
                'name' => 'date_entered',
                'readonly' => true,
                'default' => false,
                'enabled' => true,
              ),
              16 => 
              array (
                'name' => 'created_by_name',
                'label' => 'LBL_CREATED',
                'readonly' => true,
                'default' => false,
                'enabled' => true,
              ),
              17 => 
              array (
                'name' => 'modified_by_name',
                'label' => 'LBL_MODIFIED',
                'readonly' => true,
                'default' => false,
                'enabled' => true,
              ),
              18 => 
              array (
                'name' => 'state',
                'label' => 'LBL_STATE',
                'enabled' => true,
                'readonly' => false,
                'default' => false,
              ),
              19 => 
              array (
                'name' => 'city',
                'label' => 'LBL_CITY',
                'enabled' => true,
                'readonly' => false,
                'default' => false,
              ),
              20 => 
              array (
                'name' => 'street',
                'label' => 'LBL_STREET',
                'enabled' => true,
                'readonly' => false,
                'default' => false,
              ),
              21 => 
              array (
                'name' => 'last_name',
                'label' => 'LBL_LAST_NAME',
                'enabled' => true,
                'readonly' => false,
                'default' => false,
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);
