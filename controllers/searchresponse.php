<?php

function searchresponse_get(){
    global $search_response;
    
    return $search_response->get($_POST["search_id"]);
}