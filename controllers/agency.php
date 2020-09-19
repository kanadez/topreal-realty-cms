<?php

function agency_getexternalstatus(){
    global $agency;
    return $agency->getExternalStatus();
}

function agency_addagents(){
    global $agency;
    return $agency->addAgents($_POST["count"]);
}

function agency_getagentscount(){
    global $agency;
    return $agency->getAgentsCount();
}

function agency_removeagent(){
    global $agency;
    return $agency->removeAgent($_POST["id"]);
}

function agency_getagentstoedit(){
    global $agency;
    return $agency->getAgentsToEdit();
}

function agency_getagencysearches(){
    global $agency;
    return $agency->getAgencySearches();
}

function agency_setagentparameter(){
    global $agency;
    return $agency->setAgentParameter($_POST["parameter"], $_POST["value"], $_POST["agent"]);
}

function agency_getagentsworktime(){
    global $agency;
    return $agency->getAgentsWorkTime();
}

function agency_getagentslist(){
    global $agency;
    return $agency->getAgentsList();
}

function agency_getid(){
    global $agency;
    return $agency->getId();
}

function agency_getagent(){
    global $agency;
    return $agency->getAgent($_POST["iAgentId"]);
}

function agency_getprojectslist(){
    global $agency;
    return $agency->getProjectsList();
}

function agency_getproject(){
    global $agency;
    return $agency->getProject($_POST["project_id"]);
}

function agency_getprojectname(){
    global $agency;
    return $agency->getProjectName($_POST["project_id"]);
}

function agency_test(){
    global $agency;
    return $agency->updateAgentsCount();
}

?>
