<?php

function translate_checklang(){
    global $translate;
    
    return $translate->checkLanguage($_POST["q"]);
}