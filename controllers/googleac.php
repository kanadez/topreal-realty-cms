<?php

function googleac_add(){
    global $googleac;
    return $googleac->add($_POST["short_name"], $_POST["long_name"], $_POST["lat"], $_POST["lng"], $_POST["placeid"]);
}

function googleac_ajaxaddbackend(){
    global $googleac;
    return $googleac->ajaxAddBackend($_POST["placeids"]);
}

function googleac_ajaxaddlatlngbackend(){
    global $googleac;
    return $googleac->ajaxAddLatLngBackend($_POST["placeid"]);
}

function googleac_ajaxaddshort(){
    global $googleac;
    return $googleac->ajaxAddShort($_POST["placeid"]);
}

function googleac_ajaxadd(){
    global $googleac;
    return $googleac->ajaxAdd($_POST["short_name"], $_POST["long_name"], $_POST["placeid"], $_POST["old_placeid"]);
}

function googleac_ajaxaddlatlng(){
    global $googleac;
    return $googleac->ajaxAddLatLng($_POST["lat"], $_POST["lng"], $_POST["placeid"], $_POST["old_placeid"]);
}

function googleac_getshortname(){
    global $googleac;
    return $googleac->getShortName($_POST["placeid"]);
}

function googleac_getshortnameforadmin(){
    global $googleac;
    return $googleac->getShortNameForAdmin($_POST["placeid"]);
}