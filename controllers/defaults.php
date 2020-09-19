<?php

function defaults_setuser(){ // set to user
    global $defaults;
    
    return $defaults->setUser($_POST["parameter"], $_POST["value"], $_POST["user"]);
}

function defaults_getstock(){
    global $defaults;
    
    return $defaults->getStock();
}

function defaults_getlocale(){
    global $defaults;
    
    return $defaults->getLocale();
}

function defaults_getsac(){ // get synonim alert closed flag
    global $defaults;
    
    return $defaults->getSac();
}

function defaults_getsearch(){
    global $defaults;
    
    return $defaults->getSearch();
}

function defaults_get(){
    global $defaults;
    
    return $defaults->get();
}

function defaults_getallsearches(){
    global $defaults;
    
    return $defaults->getAllSearches();
}

function defaults_set(){ // set to myself
    global $defaults;
    
    return $defaults->set($_POST["parameter"], $_POST["value"]);
}

?>
