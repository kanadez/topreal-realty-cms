<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PropertyEvent
 *
 * @author x
 */

use Database\TinyMVCDatabase as DB;

class PropertyEvent extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property_event';
    
    public function createNew($property, $event, $title, $start, $end, $notification, $email){
        global $agency;
        
        $user_id = $_SESSION["user"];
        $agency_id = $agency->getId();
                
        $new_event = $this->create([
            "agency" => $agency_id,
            "author" => $user_id,
            "property" => $property,
            "event" => $event,
            "title" => $title,	
            "start" => $start,	
            "end" => $end,
            "notification" => $notification != 0 ? $notification : null,
            "email" => $email,
            "timestamp" => time()
        ]);
        $result = $new_event->save();
        
        return ["event" => $event, "start" => $start];
    }
    
    public function getAll($property){
        $query = DB::createQuery()->select('*')->where('property = ?')->order("timestamp ASC"); 
        $response = $this->getList($query, [$property]);
        
        return $response;
    }
    
    public function getForTime(){
        $now = time();
        $in_minute = $now+60;
        
        $query = DB::createQuery()->select('*')->where('start - notification >= ? && start - notification <= ?'); 
        $response = $this->getList($query, [$now, $in_minute]);
        
        return $response;
    }
}
