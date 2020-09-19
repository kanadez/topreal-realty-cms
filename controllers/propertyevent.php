<?php

function propertyevent_create(){
    global $property_event;
    
    $property = filter_input(INPUT_POST, 'property'); 
    $event = filter_input(INPUT_POST, 'event'); 
    $title = filter_input(INPUT_POST, 'title'); 
    $start = filter_input(INPUT_POST, 'start'); 
    $end = filter_input(INPUT_POST, 'end'); 
    $notification = filter_input(INPUT_POST, 'notification'); 
    $email = filter_input(INPUT_POST, 'email');
            
    return $property_event->createNew($property, $event, $title, $start, $end, $notification, $email);
}

?>
