<?php 

function client_gethistoryajax(){
    global $client;
    
    return $client->getHistory($_POST["id"]);
}

function client_savecontactremark(){
    global $client;
    
    return $client->saveContactRemark($_POST["client_id"], $_POST["parameter"], $_POST["value"]);
}

function client_unlock(){
    global $client;
    
    return $client->unlock($_POST["id"]);
}

function client_removedoc(){
    global $client;
    
    return $client->removeDoc($_POST["id"]);
}

function client_restoredoc(){
    global $client;
    
    return $client->restoreDoc($_POST["id"]);
}

function client_checkagreement(){
    global $client;
    
    return $client->checkAgreement($_POST["agreement"]);
}

function client_propose(){
    global $client;
    
    return $client->propose($_POST["client_id"], $_POST["agreement_num"]);
}

function client_getpropositions(){
    global $client;
    
    return $client->getPropositions($_POST["id"]);
}

function client_delete(){
    global $client;
    
    return $client->delete($_POST["clients"]);
}

function client_getdocs(){
    global $client;
    
    return $client->getDocs($_POST["client_id"]);
}

function client_sethistory(){ 
    global $client;
    
    return $client->setHistory($_POST["id"], $_POST["data"]);
}

function client_set(){
    global $client;
    
    return $client->set($_POST["id"], $_POST["data"]); 
}

function client_createnew(){
    global $client;
    
    return $client->createNew($_POST["id"], $_POST["data"]);
}

function client_createtemporary(){
    global $client;
    
    return $client->createTemporary();
}

function client_get(){
    global $client;
    
    return $client->get($_POST["id"]);
}

function client_tryedit(){
    global $client;
    
    return $client->tryEdit($_POST["id"]);
}

function client_getformoptions(){
    global $client;
    
    return $client->getFormOptions();
}

function client_getlistbyproperty(){
    global $client;
    
    return $client->getListByProperty($_POST["property_id"], $_POST["mode"], $_POST["from"]);
}

?>
