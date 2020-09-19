<?php

function clientcomp_addevent(){
    global $clientcomp;
    return $clientcomp->addEvent($_POST["client"], $_POST["property"], $_POST["event"]);
}

function clientcomp_apply(){
    global $clientcomp;
    return $clientcomp->apply($_POST["client"]);
}

function clientcomp_massdelete(){
    global $clientcomp;
    return $clientcomp->massDelete($_POST["client"], $_POST["properties"]);
}

function clientcomp_propose(){
    global $clientcomp;
    return $clientcomp->setProposed($_POST["client"]);
}

function clientcomp_getlastcomp(){
    global $clientcomp;
    return $clientcomp->getLastComparison($_POST["client"]);
}

function clientcomp_removedeleted(){
    global $clientcomp;
    return $clientcomp->removeDeleted($_POST["client"]);
}

function clientcomp_masshide(){
    global $clientcomp;
    return $clientcomp->massHide($_POST["client"], $_POST["properties"]);
}

function clientcomp_massunhide(){
    global $clientcomp;
    return $clientcomp->massUnhide($_POST["client"]);
}

function clientcomp_gethided(){
    global $clientcomp;
    return $clientcomp->getHided($_POST["client"]);
}

function clientcomp_geteventsforproperty(){
    global $clientcomp;
    return $clientcomp->getEventsForProperty($_POST["property"]);
}