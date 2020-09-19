<?php

function forgot_getcode(){
    global $forgot;
    
    return $forgot->getCode($_POST["email"], $_POST["locale"]);
}

function forgot_trycode(){
    global $forgot;
    
    return $forgot->tryCode($_POST["email"], $_POST["code"]);
}

function forgot_resetpass(){
    global $forgot;
    
    return $forgot->resetPassword($_POST["email"], $_POST["code"], $_POST["password"]);
}