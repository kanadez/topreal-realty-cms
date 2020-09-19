<?php

define('PROJECT_HOME', dirname( __FILE__ ) );

global $currency_data; // данные о валютах

$currency_data = array();

$currency_data = [
    0 => ["iCurrencyId" => 0, "sCurrencySymbolCode" => "USD", "sCurrencyName" => "U.S. Dollar", "iCurrencyCoef" => 1],
    1 => ["iCurrencyId" => 1, "sCurrencySymbolCode" => "ILS", "sCurrencyName" => "Israeli Shekel", "iCurrencyCoef" => 0.2524],
    2 => ["iCurrencyId" => 2, "sCurrencySymbolCode" => "RUB", "sCurrencyName" => "Russian Ruble", "iCurrencyCoef" => 0.0133],
    3 => ["iCurrencyId" => 3, "sCurrencySymbolCode" => "EUR", "sCurrencyName" => "ES Euro", "iCurrencyCoef" => 1.0833]
];