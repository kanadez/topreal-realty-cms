<?php

function dimensions_list(){
    global $dimensions;
    $response["dimensions"] = $dimensions->getList();
}

?>
