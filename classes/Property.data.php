<?php

define('PROJECT_HOME', dirname( __FILE__ ) );

//global $property_data;

$property_data = array();
$property_form_data = array();

$property_form_data["ascription"] = array( // дефолтные опции формы поиска
    "sale", 
    "rent"
);
$property_form_data["property_type"] = array(
    "apartment",
    "bauhaus",
    "camp",
    "commercial",
    "cottage",
    "duplex",
    "duplex_plus",
    "farm",
    "garden_apartment",
    "hotel",
    "building",
    "land",
    "penthouse",
    "office",
    "other",
    "part_of_apartment",
    "roof_apartment",
    "store",
    "studio", 
    "villa",
    "warehouse",
    "two_family_house"
);
$property_form_data["status"] = array( 
    "actual",
    "not_actual",
    "rented",
    "sold",
    "frozen",
    "shared",
    "tested",
    "brokeraged",
    "canceled",
    "auctioned"
);
/*$property_form_data["history_type"] = array(    
    "Last updated",
    "In call",
    "Out call"
);*/
$property_form_data["view"] = array(    
    "facade",
    "rear",
    "side",
    "sea",
    "mounts",
    "park"
);
$property_form_data["dimension"] = array(    
    "acre",
    "are",
    "hectare",
    "sq_ft",
    "sq_km",
    "sq_m",
    "sq_mi",
    "sq_yd",
    "dunam"
);
$property_form_data["direction"] = array(    
    "south",
    "west",
    "north",
    "east"
);
$property_form_data["comparison_action"] = array( 
    "brokering",
    "appointment",
    "property_inspection",
    "sms",
    "email",
    "phone_call"
);
$property_form_data["comparison_condition"] = array( 
    "available",
    "interesting",
    "not_interesting",
    "problem",
    "offered",
    "signed",
    "dilled"
);