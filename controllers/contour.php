<?php

function contour_copy(){
    global $contour;
    
    return $contour->copyPreinstalled($_POST["id"], $_POST["search"]);
}

function contour_prelist(){
    global $contour;
    
    return $contour->getPreContoursList($_POST["city"]);
}

function contour_savepolygon(){
    global $contour;
    
    return $contour->savePolygon($_POST["contour_id"], $_POST["polygon_data"]);
}

function contour_restore(){
    global $contour;
    
    return $contour->restore($_POST["id"]);
}

function contour_delete(){
    global $contour;
    
    return $contour->delete($_POST["id"]);
}

function contour_savetitle(){
    global $contour;
    
    return $contour->updateTitle($_POST["id"], $_POST["title"]);
}

function contour_update(){
    global $contour;
    
    return $contour->update($_POST["id"], $_POST["data"]);
}

function contour_set(){
    global $contour;
    
    return $contour->set($_POST["contour_id"], $_POST["search_id"], $_POST["contour_data"], $_POST["city"]);
}

function contour_createnewtmp(){
    global $contour;
    
    return $contour->createNewTemporary($_POST["search_id"], $_POST["contour_data"], $_POST["city"]);
}

function contour_createnew(){
    global $contour;
    
    return $contour->createNew($_POST["search_id"], $_POST["contour_title"], $_POST["contour_data"], $_POST["city"]);
}

function contour_createtemporary(){
    global $contour;
    
    return $contour->createTemporary();
}

function contour_getshort(){
    global $contour;
    
    return $contour->getIDsOnly($_POST["contour_id"]);
}

function contour_query(){
    global $contour;
    
    return $contour->query($_POST["contour_id"]);
}

function contour_getqueryformoptions(){
    global $contour;
    
    return $contour->getQueryFormOptions();
}

function contour_getranges(){
    global $contour;
    
    return $contour->getRanges($_POST["iCurrencyId"]);
}

function contour_list(){
    global $contour;
    
    return $contour->getContoursList($_POST["search"]);
}

function contour_getbyid(){
    global $contour;
    
    return $contour->getByID($_POST["id"]);
}

function contour_get(){
    global $contour;
    
    return $contour->get($_POST["search_id"]);
}

function contour_getforlist(){
    global $contour;
    
    return $contour->getForList($_POST["id"]);
}

?>
