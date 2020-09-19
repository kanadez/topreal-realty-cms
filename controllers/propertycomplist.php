<?php

function propertycomplist_getlastdate(){
    global $propertycomplist;
    return $propertycomplist->getLastDate($_POST["property"]);
}

function propertycomplist_getlastcount(){
    global $propertycomplist;
    return $propertycomplist->getLastCount($_POST["property"]);
}

function propertycomplist_getproperties(){
    global $propertycomplist;
    return $propertycomplist->getProperties($_POST["property"]);
}