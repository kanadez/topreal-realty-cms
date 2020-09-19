<?php

function propertydoc_preparecomparisonforprint(){
    global $property_doc;
    
    return $property_doc->prepareComparisonPdfForPrint($_POST["items"], $_POST["property"]);
}

function propertydoc_savecomparison(){
    global $property_doc;
    
    return $property_doc->createComparisonPdf($_POST["agreement_id"], $_POST["agreement_name"], $_POST["items"], $_POST["property"]);
}

function propertydoc_settitle(){
    global $property_doc;
    
    return $property_doc->setTitle($_POST["id"], $_POST["title"]);
}

?>
