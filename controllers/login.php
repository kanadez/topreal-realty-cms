<?php

function login_appgetkey(){
    global $login;
    
    return $login->authorizeApp($_POST["email"], $_POST["password"]);
}

function login_getkey(){
    global $login;
    
    return $login->authorize($_POST["email"], $_POST["password"]);
}

function login_test(){
    global $login;
    
    return $login->test($_POST["email"], $_POST["password"]);
}

function login_getuserid(){
    return $_SESSION["user"];
}

function login_logout(){
    global $login;
    
    return $login->logout();
}

?>
