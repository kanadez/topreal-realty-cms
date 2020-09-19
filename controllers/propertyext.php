<?php

function propertyext_deletelist(){
    global $property_external;
    
    return $property_external->deleteList($_POST["properties"]);
}