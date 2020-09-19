<?php

function stock_checkpayed(){
    global $stock;
    
    return $stock->checkPayed();
}

function stock_getphotos(){
    global $stock;
    
    return $stock->getPhotos($_POST["iPropertyId"]);
}

function stock_getdocs(){
    global $stock;
    
    return $stock->getDocs($_POST["iPropertyId"]);
}