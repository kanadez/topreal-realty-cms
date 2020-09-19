<?php

use Database\TinyMVCDatabase as DB;

class ClientComparison extends Database\TinyMVCDatabaseObject{
    const tablename  = 'client_comparison_event';
    
    public function addEvent($client, $property, $event){
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
    
    public function apply($client){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('client = ? AND deleted = 0 AND agency = ?')->order("timestamp ASC"); 
	$events = $this->getList($query, [intval($client), $agency->getId()]);
        
        return $events;
    }
    
    public function getHided($client){
        global $agency;
        
        $query = DB::createQuery()->select('property')->where('client = ? AND deleted = 0 AND event = "hide" AND agency = ?')->order("timestamp ASC"); 
	$events = $this->getList($query, [intval($client), $agency->getId()]);
        
        return $events;
    }
    
    public function massDelete($client, $properties){
        $properties_decoded = json_decode($properties);
        global $agency;
        
        for ($i = 0; $i < count($properties_decoded); $i++){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($properties_decoded[$i]),
                "event" => "delete",
                "timestamp" => time()
            ]);

            $new_event->save();
        }
        
        return $client;
    }
    
    public function massHide($client, $properties){
        $properties_decoded = json_decode($properties);
        global $agency;
        
        for ($i = 0; $i < count($properties_decoded); $i++){
            $new_event = $this->create([
                "agency" => $agency->getId(),
                "author" => $_SESSION["user"],
                "client" => intval($client), 
                "property" => intval($properties_decoded[$i]),
                "event" => "hide",
                "timestamp" => time()
            ]);

            $new_event->save();
        }
        
        return $client;
    }
    
    public function massUnhide($client){
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('client = ? AND event = "hide" AND agency = ?'); 
	$deleted_list = $this->getList($query, [intval($client), $agency->getId()]);
        
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
    
    public function removeDeleted($client){
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('client = ? AND event = "delete" AND agency = ?'); 
	$deleted_list = $this->getList($query, [intval($client), $agency->getId()]);
        
        for ($i = 0; $i < count($deleted_list); $i++){
            $deleted_item = $this->load($deleted_list[$i]->id);
            $deleted_item->deleted = 1;
            $deleted_item->save();
        }
    }
    
    public function getEventsForProperty($property){
        global $agency, $utils;
        
        $query = DB::createQuery()->select('client, current_state, author, timestamp')->where('property = ? AND event = "condition_change" AND deleted = 0 AND agency = ?')->order("timestamp DESC"); 
	$events = $this->getList($query, [intval($property), $agency->getId()]);
        $events_parsed = [];
        
        for ($i = 0; $i < count($events); $i++){
            $client = Client::load($events[$i]->client);
            $exist = false;
            
            for ($z = 0; $z < count($events_parsed); $z++){
                if ($events_parsed[$z]["id"] == $client->id){
                    $exist = true;
                }
            }
            
            if ($exist){
                continue;
            }
            
            $event = [
                "id" => $client->id,
                "name" => $client->name,
                "price_from" => $client->price_from,
                "price_to" => $client->price_to,
                "currency_id" => $client->currency_id,
                "current_state" => $events[$i]->current_state,
                "agent_id" => $events[$i]->author,
                "timestamp" => $events[$i]->timestamp
            ];
            array_push($events_parsed, $event);
        }
        
        return $events_parsed;
    }
}
