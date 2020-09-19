<?php

function search_getempty(){
    global $search;
    
    return $search->getEmpty();
}

function search_tryimportcontours(){
    global $search;
    
    return $search->tryImportContours($_POST["password"]);
}

function search_tryexportcontours(){
    global $search;
    
    return $search->tryExportContours($_POST["password"], $_POST["contours"]);
}

function search_clearing(){
    global $search;
    
    return $search->clearing();
}

function search_getresultscount(){
    global $search;
    
    return $search->getResultsCount($_POST["search"]);
}

function search_addsort(){
    global $search;
    
    return $search->addSort($_POST["search"], $_POST["by"]);
}

function search_getselectedonmap(){
    global $search;
    
    return $search->getSelectedOnMap($_POST["id"]);
}

function search_saveselectedonmap(){
    global $search;
    
    return $search->saveSelectedOnMap($_POST["data"], $_POST["reduced"]);
}

function search_check(){
    global $search;
    
    return $search->createCheckByPhone($_POST["object_type"], $_POST["object_id"]);
}

function search_exporttocsv(){
    global $search;
    
    return $search->exportToCSV($_POST["properties"], $_POST["clients"]);
}

function search_getdefaults(){
    global $defaults;
    
    return $defaults->get();
}

function search_savepolygon(){
    global $search;
    
    return $search->savePolygon($_POST["search_id"], $_POST["polygon_data"]);
}

function search_restore(){
    global $search;
    
    return $search->restore($_POST["id"]);
}

function search_delete(){
    global $search;
    
    return $search->delete($_POST["id"]);
}

function search_savetitle(){
    global $search;
    
    return $search->updateTitle($_POST["id"], $_POST["title"]);
}

function search_update(){
    global $search;
    
    return $search->update($_POST["id"], $_POST["data"]);
}

function search_set(){
    global $search;
    
    return $search->set($_POST["id"], $_POST["data"]);
}

function search_createnew(){
    global $search;
    
    return $search->createNew($_POST["id"], $_POST["data"]);
}

function search_createtemporary(){
    global $search;
    
    return $search->createTemporary();
}

function search_getshortempty(){
    global $search;
    
    return $search->getShortEmpty();
}

function search_getshort(){
    global $search;
    
    return $search->getIDsOnly($_POST["search_id"]);
}

function search_queryempty(){
    global $search;
    
    return $search->queryEmpty();
}

function search_query(){
    global $search;
    
    return $search->query($_POST["search_id"]);
}

function search_getqueryformoptions(){
    global $search;
    
    return $search->getQueryFormOptions();
}

function search_getranges(){
    global $search;
    
    return $search->getRanges($_POST["iCurrencyId"]);
}

function search_list(){
    global $search;
    
    return $search->getSearchesList();
}

function search_get(){
    global $search;
    
    return $search->get($_POST["search_id"]);
}

function search_togglestock(){
    global $search;
    
    return $search->toggleStock($_POST["value"]);
}