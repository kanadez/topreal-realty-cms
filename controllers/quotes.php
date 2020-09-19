<?php

function quotes_get(){
    global $quotes;
    
    return $quotes->get();
}

function quotes_add(){
    global $quotes;
    
    return $quotes->add($_POST["cell"], $_POST["data"]);
}

function quotes_save(){
    global $quotes;
    
    return $quotes->set($_POST["id"], $_POST["data"]);
}