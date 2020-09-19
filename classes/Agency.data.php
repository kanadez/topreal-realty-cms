<?php

define('PROJECT_HOME', dirname( __FILE__ ) );

$agency_data["agency"] = array(
    0 => ["iAgencyId" => 0, "sAgencyName" => "Agency 0"]
);
$agency_data["agent"] = array(
    0 => ["iAgencyId" => 0, "iAgentId" => 0, "sAgentName" => "Agent 0"], 
    1 => ["iAgencyId" => 0, "iAgentId" => 1, "sAgentName" => "Agent 1"], 
    2 => ["iAgencyId" => 0, "iAgentId" => 2, "sAgentName" => "Agent 2"]);

$project_data = [
    0 => ["iProjectId" => 0, "sProjectName" => "Project 0"],
    1 => ["iProjectId" => 1, "sProjectName" => "Project 1"]
];