<?php

function tools_getstockcounter(){
    global $tools;
    return $tools->getStockCounter();
}

function tools_getcollectors(){
    global $tools;
    return $tools->getAgencyCollectors();
}

function tools_checkusercountry(){
    global $tools;
    return $tools->checkUserCountry();
}

function tools_getofficeinfo(){
    global $tools;
    return $tools->getOfficeInfo();
}

function tools_saveofficeinfoparameter(){
    global $tools;
    return $tools->setOfficeInfoParameter($_POST["parameter"], $_POST["value"]);
}

function tools_saveofficeinfoagentname(){
    global $tools;
    return $tools->setOfficeInfoAgentName($_POST["agent_id"], $_POST["agent_name"]);
}

function tools_getagencysearches(){
    global $tools;
    return $tools->getAgencySearches();
}

function tools_savetrynowemail(){
    global $tools;
    return $tools->saveTryNowEmail($_POST["email"], $_POST["locale"]);
}

function tools_checktrynowcode(){
    global $tools;
    return $tools->checkTryNowCode($_POST["email"], $_POST["code"]);
}

function tools_savetrynowenteremail(){
    global $tools;
    return $tools->saveTryNowEnterEmail($_POST["email"], $_POST["name"], $_POST["phone"], $_POST["city"], $_POST["locale"]);
}

function tools_checktrynowentercode(){
    global $tools;
    return $tools->checkTryNowEnterCode($_POST["email"], $_POST["code"]);
}

function tools_guestcount(){
    global $tools;
    return $tools->checkGuestPropertiesCount($_POST["email"]);
}