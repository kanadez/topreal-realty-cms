<?php

function permission_is(){
    global $permission;
    
    return $permission->is($_POST["action"]);
}

function permission_set(){
    global $permission;
    
    return $permission->set($_POST["parameter"], $_POST["value"], $_POST["agent"]);
}

function permission_getforallagents(){
    global $permission;
    
    return $permission->getForAllAgents();
}

?>
