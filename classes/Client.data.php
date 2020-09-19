<?php

define('PROJECT_HOME', dirname( __FILE__ ) ); 

$client_data = array();
$client_form_data = array();

$client_form_data["ascription"] = array( // дефолтные опции формы поиска
    "sale", 
    "rent"
);
$client_form_data["property_type"] = array(
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
    "root_apartment",
    "store",
    "studio", 
    "villa",
    "warehouse",
    "two_family_house"
);
$client_form_data["dimension"] = array(    
    "s_m",
    "s_f"
);
$client_form_data["advopts"] = array(    
    "no_ground_floor_noregister_span",
    "no_last_floor_noregister_span",
    "parking_noregister_span",
    "facade_noregister_span",
    "air_cond_noregister_span",
    "elevator_noregister_span"
);
$client_form_data["status"] = array( 
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
$client_form_data["comparison_action"] = array( 
    "brokering",
    "appointment",
    "property_inspection",
    "sms",
    "email",
    "phone_call"
);
$client_form_data["comparison_condition"] = array( 
    "available",
    "interesting",
    "not_interesting",
    "problem",
    "offered",
    "signed",
    "dilled"
);
/*$property_form_data["history_type"] = array(    
    "Last updated",
    "In call",
    "Out call"
);*/