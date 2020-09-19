<?php

function owl_unsettemp(){
    global $owl;
    
    return $owl->unsetTemporary($_POST["event"]);
}

function owl_check(){
    global $owl;
    
    return $owl->createCheckByPhone($_POST["phone"], $_POST["object_id"], $_POST["object_type"]);
}

function owl_sendapplink(){
    global $localization;
    
    $locale = $localization->getDefaultLocale();
    return sendAppLinkMail($_POST["email"], $locale["locale_value"]);
}

function owl_initcard(){
    global $owl;
    
    return $owl->initCardButtons();
}

function owl_setnosmart(){
    global $owl;
    
    return $owl->setNoSmart();
}

function owl_createsession(){
    global $owl;
    
    return $owl->createSession(
            $_POST["event_type"],
            $_POST["subject_type"],
            $_POST["card"],
            $_POST["subject_name"],
            $_POST["subject_contact"],
            $_POST["sms_text"]
            //$_POST["subject_remark"],
            //$_POST["duration"],
            //$_POST["timestamp"]
    );
}

function owl_savesession(){
    global $owl;
    
    return $owl->saveSession(
            $_POST["event_type"],
            $_POST["subject_type"],
            $_POST["card"],
            $_POST["subject_name"],
            $_POST["subject_contact"],
            $_POST["subject_remark"],
            $_POST["duration"],
            $_POST["timestamp"]
    );
}

function owl_getsessionsforall(){
    global $owl;
    
    return $owl->getSessionsForAll();
}

function owl_getsessions(){
    global $owl;
    
    return $owl->getSessions();
}

function owl_setappcallinevent(){
    global $owl;
    
    return $owl->setAppCallInEvent($_POST["event"], $_POST["data"]);
}

function owl_setappcalloutevent(){
    global $owl;
    
    return $owl->setAppCallOutEvent($_POST["event"], $_POST["data"]);
}

function owl_setappsmsinevent(){
    global $owl;
    
    return $owl->setAppSmsInEvent($_POST["event"], $_POST["data"]);
}

function owl_setappsmsoutevent(){
    global $owl;
    
    return $owl->setAppSmsOutEvent($_POST["event"], $_POST["data"]);
}