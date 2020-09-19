<?php

function clientcomplist_getlastdate(){
    global $clientcomplist;
    return $clientcomplist->getLastDate($_POST["client"]);
}

function clientcomplist_getlastcount(){
    global $clientcomplist;
    return $clientcomplist->getLastCount($_POST["client"]);
}

function clientcomplist_getproperties(){
    global $clientcomplist;
    return $clientcomplist->getProperties($_POST["client"]);
}