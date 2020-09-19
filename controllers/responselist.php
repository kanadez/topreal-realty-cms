<?php

function responselist_refresh(){
    global $responselist;
    
    return $responselist->refresh($_POST["properties"], $_POST["clients"]);
}

function responselist_createnew(){
    global $responselist;
    
    return $responselist->createNew($_POST["title"], $_POST["data"], $_POST["type"]);
}

function responselist_rewrite(){
    global $responselist;
    
    return $responselist->rewrite($_POST["id"], $_POST["data"], $_POST["type"]);
}

function responselist_get(){
    global $responselist;
    
    return $responselist->get($_POST["id"]);
}

function responselist_getall(){
    global $responselist;
    
    return $responselist->getAll();
}

function responselist_delete(){
    global $responselist;
    
    return $responselist->delete($_POST["id"]);
}

function responselist_restore(){
    global $responselist;
    
    return $responselist->restore($_POST["id"]);
}

?>
