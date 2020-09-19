<?php

function subscription_checkcancelled(){
    global $subscription;
    
    return $subscription->checkCancelled();
}

function subscription_cancelpayments(){
    global $subscription;
    
    return $subscription->cancelPayments();
}

function subscription_get(){
    global $subscription;
    
    return $subscription->get();
}

function subscription_getmonthly(){
    global $subscription;
    
    return $subscription->getMonthly();
}

function subscription_update(){
    global $subscription;
    
    return $subscription->update($_POST["agency"]);
}

function subscription_checkremaining(){
    global $subscription;
    
    return $subscription->checkRemaining();
}

function subscription_checkremainingnoalert(){
    global $subscription;
    
    return $subscription->checkRemainingNoAlert();
}

?>
