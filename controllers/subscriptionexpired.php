<?php

function subscriptionexpired_test(){
    global $subscription_expired;
    
    return $subscription_expired->tryTo(302); 
}

function subscriptionexpired_checkexisting(){
    global $subscription_expired;
    
    return $subscription_expired->checkExisting(); 
}