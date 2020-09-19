<?php

function property_updatefromexternal(){
    global $property;
    
    return $property->updateFromExternal($_POST["property"], $_POST["external_property"]);
}

function property_getexternal(){
    global $property;
    
    return $property->getExternal($_POST["id"]);
}

function property_gethistoryajax(){
    global $property;
    
    return $property->getHistoryAjax($_POST["id"]);
}

function property_getpropositions(){
    global $property;
    
    return $property->getPropositions($_POST["id"]);
}

function property_delete(){
    global $property;
    
    return $property->delete($_POST["properties"]);
}

function property_deletestock(){
    global $property;
    
    return $property->deleteStock($_POST["properties"], $_POST["remove_mode"]);
}

function property_checkagreement(){
    global $property;
    
    return $property->checkAgreement($_POST["agreement"]);
}

function property_getlistbyclient(){
    global $property;
    
    return $property->getListByClient($_POST["client_id"], $_POST["mode"], $_POST["from"]);
}

function property_createnew(){
    global $property;
    
    return $property->createNew($_POST["id"], $_POST["data"]);
}

function property_createtemporary(){
    global $property;
    
    return $property->createTemporary();
}

function property_savecontactremark(){
    global $property;
    
    return $property->saveContactRemark($_POST["property_id"], $_POST["parameter"], $_POST["value"]);
}

function property_getpl(){
    global $property;
    
    return $property->getPhotoList();
}

function property_copy(){
    global $property;
    
    return $property->copy($_POST["iPropertyId"], $_POST["ascription"]);
}

function property_unlock(){
    global $property;
    
    return $property->unlock($_POST["iPropertyId"]);
}

function property_tryedit(){
    global $property;
    
    return $property->tryEdit($_POST["iPropertyId"]);
}

function property_propose(){
    global $property;
    
    return $property->propose($_POST["property_id"], $_POST["agreement_num"]);
}

function property_removedoc(){
    global $property;
    
    return $property->removeDoc($_POST["id"]);
}

function property_restoredoc(){
    global $property;
    
    return $property->restoreDoc($_POST["id"]);
}

function property_getdocs(){
    global $property;
    
    return $property->getDocs($_POST["iPropertyId"]);
}

function property_removephoto(){
    global $property;
    
    return $property->removePhoto($_POST["id"]);
}

function property_restorephoto(){
    global $property;
    
    return $property->restorePhoto($_POST["id"]);
}

function property_getphotos(){
    global $property;
    
    return $property->getPhotos($_POST["iPropertyId"]);
}

function property_sethistory(){
    global $property;
    
    return $property->setHistory($_POST["id"], $_POST["data"]);
}

function property_set(){
    global $property;
    
    return $property->set($_POST["id"], $_POST["data"], $_POST["collected"]);
}

function property_get(){
    global $property;
    
    return $property->get($_POST["iPropertyId"], $_POST["mode"]);
}

function property_search(){
    global $property;
    
    return $property->search($_POST["iSearchId"]);
}

function property_getformoptions(){
    global $property;
    
    return $property->getFormOptions();
}

function property_getcomparisoncount(){
    global $property;
    
    return $property->getComparisonCount($_POST["client_id"]);
}

?>
