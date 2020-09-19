<?php

define('PROJECT_HOME', dirname( __FILE__ ) );

$query_form_data["ascription"] = array( // дефолтные опции формы поиска
    "sale", 
    "rent", 
    "sale_client", 
    "rent_client"
);
$query_form_data["property_type"] = array(
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
$query_form_data["status"] = array( 
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
$query_form_data["history_type"] = array(    
    "last_update", 
    "free_from",  
    /*"in_out_call", 
    "email_in_out",
    "sms_in_out",*/
    "interesting",
    "not_interesting",
    "problem",
    "offered",
    "signed",
    "dilled",
    "proposed"
    //"agreement_option_label"
    //"agreement"
);
$query_form_data["dimension"] = array(    
    "s_m",
    "s_f"
);
$query_form_data["view"] = array(    
    "facade",
    "rear",
    "side",
    "sea",
    "mounts",
    "park"
);
$query_form_data["direction"] = array(    
    "south",
    "west",
    "north",
    "east"
);