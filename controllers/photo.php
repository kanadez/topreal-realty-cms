<?php

function photo_settitle(){
    global $photo;
    
    return $photo->setTitle($_POST["property"], $_POST["file"], $_POST["title"]);
}
