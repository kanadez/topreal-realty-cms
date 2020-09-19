<?php

use Database\TinyMVCDatabase as DB;

class ClientComparisonList extends Database\TinyMVCDatabaseObject{
    const tablename  = 'client_comparison_list';
    
    public function createNew($client, $properties){
        global $agency;
        $ids = [];
        
        for ($i = 0; $i < count($properties); $i++){
            array_push($ids, $properties[$i]->id);
        }
        
        $new_event = $this->create([
            "agency" => $agency->getId(),
            "author" => $_SESSION["user"],
            "client" => intval($client), 
            "data" => json_encode($ids),
            "count" => count($properties),
            "timestamp" => time()
        ]);

        return $new_event->save();
    }
    
    public function getLastDate($client){
        global $agency;
        
        $query = DB::createQuery()->select('MAX(timestamp) AS timestamp')->where('client = ? AND agency = ?'); 
	$response = $this->getList($query, [intval($client), $agency->getId()]);
        
        return $response[0]->timestamp;
    }
    
    public function getLastCount($client){
        global $agency;
        
        $last_date = $this->getLastDate(intval($client));
        
        if ($last_date != null){
            $query = DB::createQuery()->select('count')->where('client = ? AND agency = ? AND timestamp = ?'); 
            $response = $this->getList($query, [intval($client), $agency->getId(), $last_date]);

            $total = $response[0]->count;
            
            $query2 = DB::createQuery()->select('id')->where('client = ? AND agency = ? AND (event = "delete") AND deleted = 0'); 
            $response2 = ClientComparison::getList($query2, [intval($client), $agency->getId()]);
            
            return $total-count($response2);
        }
        else{
            return null;
        }
    }
    
    public function getProperties($client){
        global $agency;
        
        $last_date = $this->getLastDate(intval($client));
        
        $query = DB::createQuery()->select('data')->where('client = ? AND agency = ? AND timestamp = ?'); 
        $response = $this->getList($query, [intval($client), $agency->getId(), $last_date]);

        $ids = json_decode($response[0]->data);
        $properties = [];
        
        for ($i = 0; $i < count($ids); $i++){
            array_push($properties, Property::load($ids[$i]));
        }
        
        return [
            "data" => $properties, 
            "total" => count($ids),
            "type" => "last"
        ];
    }
}
