<?php

function propertycomp_addevent(){
    global $propertycomp;
    return $propertycomp->addEvent($_POST["property"], $_POST["client"], $_POST["event"]);
}

function propertycomp_apply(){
    global $propertycomp;
    return $propertycomp->apply($_POST["property"]);
}

function propertycomp_massdelete(){
    global $propertycomp;
    return $propertycomp->massDelete($_POST["property"], $_POST["clients"]);
}

function propertycomp_propose(){
    global $propertycomp;
    return $propertycomp->setProposed($_POST["property"]);
}

function propertycomp_getlastcomp(){
    global $propertycomp;
    return $propertycomp->getLastComparison($_POST["property"]);
}

function propertycomp_removedeleted(){
    global $propertycomp;
    return $propertycomp->removeDeleted($_POST["property"]);
}

function propertycomp_masshide(){
    global $propertycomp;
    return $propertycomp->massHide($_POST["property"], $_POST["clients"]);
}

function propertycomp_massunhide(){
    global $propertycomp;
    return $propertycomp->massUnhide($_POST["property"]);
}

function propertycomp_gethided(){
    global $propertycomp;
    return $propertycomp->getHided($_POST["property"]);
}

function propertycomp_geteventsforproperty(){
    global $propertycomp;
    return $propertycomp->getEventsForProperty($_POST["client"]);
}