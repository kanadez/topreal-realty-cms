<?php

function fcm_settokenweb(){
    global $fcm;
    $token = filter_input(INPUT_POST, 'token'); 
    
    return $fcm->setTokenWeb($token);
}

function fcm_sendmsgweb(){
    global $fcm;
    $user = filter_input(INPUT_POST, 'user');
    $action = filter_input(INPUT_POST, 'title'); 
    $data = filter_input(INPUT_POST, 'msg'); 
    
    return $fcm->sendWeb($user, $action, $data);
}

function fcm_settoken(){
    global $fcm;
    
    return $fcm->setToken($_POST["user"], $_POST["token"]);
}

function fcm_sendmsg(){
    global $fcm;
    
    return $fcm->send($_POST["action"], $_POST["data"]);
}