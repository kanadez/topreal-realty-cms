<?php

function synonim_addgoogle(){
    global $synonim;
    return $synonim->addGoogle($_POST["short_name"], $_POST["long_name"], $_POST["lat"], $_POST["lng"], $_POST["placeid"]);
}

function synonim_search(){
    global $synonim;
    return $synonim->search($_POST["q"], $_POST["pc"], $_POST["pct"]);
}

function synonim_get(){
    global $synonim;
    return $synonim->get($_POST["id"], $_POST["type"]);
}