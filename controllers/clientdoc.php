<?php

function clientdoc_preparecomparisonforprint(){
    global $client_doc;
    
    return $client_doc->prepareComparisonPdfForPrint($_POST["items"], $_POST["client"]);
}

function clientdoc_savecomparison(){
    global $client_doc;
    
    return $client_doc->createComparisonPdf($_POST["agreement_id"], $_POST["agreement_name"], $_POST["items"], $_POST["client"]);
}

function clientdoc_settitle(){
    global $client_doc;
    
    return $client_doc->setTitle($_POST["id"], $_POST["title"]);
}

?>
