<?php

function acsynonim_addgoogle(){
    global $ac_synonim;
    return $ac_synonim->addGoogle($_POST["short_name"], $_POST["long_name"], $_POST["lat"], $_POST["lng"], $_POST["placeid"]);
}

function acsynonim_search(){
    global $ac_synonim;
    return $ac_synonim->search($_POST["query"], $_POST["place_id"], $_POST["place_text"]);
}

function acsynonim_get(){
    global $ac_synonim;
    return $ac_synonim->get($_POST["id"], $_POST["type"]);
}

function acsynonim_add(){
    global $ac_synonim;
    return $ac_synonim->add($_POST["text"], $_POST["place_id"], $_POST["place_text"], $_POST["place_fulltext"], $_POST["place_city"], $_POST["place_city_text"]);
}

function acsynonim_edit(){
    global $ac_synonim;
    return $ac_synonim->edit($_POST["synonim_id"], $_POST["text"]);
}

function acsynonim_getbyplaceid(){
    return AutocompleteSynonim::getByPlaceID($_POST["place_id"]);
}