<?php

function autocomplete_addgoogle(){
    global $autocomplete;
    return $autocomplete->addGoogle($_POST["short_name"], $_POST["long_name"], $_POST["lat"], $_POST["lng"], $_POST["placeid"]);
}

function autocomplete_search(){
    global $autocomplete;
    return $autocomplete->search($_POST["q"], $_POST["ll"], $_POST["t"], $_POST["l"], $_POST["pc"], $_POST["pct"]);
}

function autocomplete_get(){
    global $autocomplete;
    return $autocomplete->get($_POST["id"], $_POST["type"]);
}