<?php

function geo_getforlocales(){
    return Geo::getAddressForAllLocales($_POST["place_id"]);
}

function geo_getaddressbylatlng(){
    return Geo::getAddressByLatLng($_POST["lat"], $_POST["lng"], $_POST["locale"]);
}

function geo_getacadd(){
    return Geo::getForGoogleAC("EnDQktC70LDQtNC40LzQuNGA0YHQu40YbQsCwg0J_QtdGC0YDQvtC30LDQstC-0LTRgdC6LCDQoNC10YHQv9GD0LHQu9C40LrQsCDQmtCw0YDQtdC70LjRjywg0KDQvtGB0YHQuNGP", "ru");
}

function geo_getplaceidbyaddress(){
    global $geo;

    return $geo->getPlaceIdByAddress($_POST["address"]);
}

function geo_getlatlngbyaddress(){
    return Geo::getLatLngByAddress($_POST["address"]);
}