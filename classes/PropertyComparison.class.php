<?php

use Database\TinyMVCDatabase as DB;

class PropertyComparison extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property_comparison_event';
    
    public function addEvent($property, $client, $event){
        global $agency;
        $event_parsed = json_decode(strval($event), true);
        $time = time();
        
        if ($event_parsed["action_new"] != null){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($property),
                "event" => "action_change",
                "current_state" => $event_parsed["action_new"],
                "previous_state" => $event_parsed["action_old"],
                "timestamp" => $time
            ]);

            $new_event->save();
        }
        
        if ($event_parsed["condition_new"] != null){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($property),
                "event" => "condition_change",
                "current_state" => $event_parsed["condition_new"],
                "previous_state" => $event_parsed["condition_old"],
                "timestamp" => $time
            ]);

            $new_event->save();
        }
        
        if ($event_parsed["remarks_new"] !== null){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($property),
                "event" => "remarks_change",
                "current_state" => $event_parsed["remarks_new"],
                "previous_state" => $event_parsed["remarks_old"],
                "timestamp" => $time
            ]);

            $new_event->save();
        }
        
        if ($event_parsed["delete"] != null){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($property),
                "event" => $event_parsed["delete"],
                "timestamp" => $time
            ]);

            $new_event->save();
        }
        
        return intval($property);
    }
    
    public function apply($property){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('property = ? AND deleted = 0 AND agency = ?')->order("timestamp ASC"); 
	$events = $this->getList($query, [intval($property), $agency->getId()]);
        
        return $events;
    }
    
    public function getHided($property){
        global $agency;
        
        $query = DB::createQuery()->select('client')->where('property = ? AND deleted = 0 AND event = "hide" AND agency = ?')->order("timestamp ASC"); 
	$events = $this->getList($query, [intval($property), $agency->getId()]);
        
        return $events;
    }
    
    public function massDelete($property, $clients){
        $clients_decoded = json_decode($clients);
        global $agency;
        
        for ($i = 0; $i < count($clients_decoded); $i++){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "property" => intval($property), 
                "client" => intval($clients_decoded[$i]),
                "event" => "delete",
                "timestamp" => time()
            ]);

            $new_event->save();
        }
        
        return $property;
    }
    
    public function massHide($property, $clients){
        $clients_decoded = json_decode($clients);
        global $agency;
        
        for ($i = 0; $i < count($clients_decoded); $i++){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "property" => intval($property), 
                "client" => intval($clients_decoded[$i]),
                "event" => "hide",
                "timestamp" => time()
            ]);

            $new_event->save();
        }
        
        return $property;
    }
    
    public function massUnhide($property){
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('property = ? AND event = "hide" AND agency = ?'); 
	$deleted_list = $this->getList($query, [intval($property), $agency->getId()]);
        
        for ($i = 0; $i < count($deleted_list); $i++){
            $deleted_item = $this->load($deleted_list[$i]->id);
            $deleted_item->deleted = 1;
            $deleted_item->save();
        }
    }
    
    public function setProposed($client){
        global $agency;
        
        $new_propose = ClientPropose::create([
            "client" => intval($client),
            "user" => $_SESSION["user"],
            "agency" => $agency->getId(), 
            "timestamp" => time()
        ]);

        return $new_propose->save();
    }
    
    public function getLastComparison($client){
        global $agency;
        
        $query = DB::createQuery()->select('timestamp')->where('client = ? AND agency = ?')->order("timestamp DESC"); 
	$proposes = ClientPropose::getList($query, [intval($client), $agency->getId()]);

        return $proposes[0]->timestamp;
    }
    
    public function removeDeleted($property){
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('property = ? AND event = "delete" AND agency = ?'); 
	$deleted_list = $this->getList($query, [intval($property), $agency->getId()]);
        
        for ($i = 0; $i < count($deleted_list); $i++){
            $deleted_item = $this->load($deleted_list[$i]->id);
            $deleted_item->deleted = 1;
            $deleted_item->save();
        }
    }
    
    public function getEventsForProperty($client){
        global $agency, $utils;
        
        $query = DB::createQuery()->select('property, current_state, author, timestamp')->where('client = ? AND event = "condition_change" AND deleted = 0 AND agency = ?')->order("timestamp DESC"); 
	$events = $this->getList($query, [intval($client), $agency->getId()]);
        $events_parsed = [];
        
        for ($i = 0; $i < count($events); $i++){
            $property = Property::load($events[$i]->property);
            $exist = false;
            
            for ($z = 0; $z < count($events_parsed); $z++){
                if ($events_parsed[$z]["id"] == $property->id){
                    $exist = true;
                }
            }
            
            if ($exist){
                continue;
            }
            
            $event = [
                "id" => $property->id,
                "types" => $property->types,
                "price" => $property->price,
                "currency_id" => $property->currency_id,
                "current_state" => $events[$i]->current_state,
                "agent_id" => $events[$i]->author,
                "timestamp" => $events[$i]->timestamp
            ];
            array_push($events_parsed, $event);
        }
        
        return $events_parsed;
    }
}
