<?php

function currency_update(){
    global $currency;
    $currency->update();
}

function currency_list(){
    global $currency;
    $response["aCurrencyList"] = $currency->getList();
}

?>
