<?php

function user_test(){
    global $user;
    
    return $user->test();
}

function user_isauth(){
    global $user;
    
    return $user->isAuth();
}

function user_changemypasswd(){
    global $user;
    return $user->changeMyPassword($_POST["old"], $_POST["new"]);
}

function user_lockagent(){
    global $user;
    return $user->lockAgent();
}

function user_setseen(){
    global $user;
    return $user->setSeen();
}

function user_showsession(){
    global $user;
    return $user->showSession();
}

function user_getmyofficeinfo(){
    global $user;
    return $user->getMyOfficeInfo();
}

function user_getmytype(){
    global $user;
    return $user->getMyType();
}

function user_getmyid(){
    global $user;
    return $user->getMyId();
}

function user_getmyname(){
    global $user;
    return $user->getMyName();
}

function user_getcontactemail(){
    global $user;
    return $user->getContactEmail();
}

?>
