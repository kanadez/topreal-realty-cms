<?php

use Database\TinyMVCDatabase as DB;

class PropertyComparisonList extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property_comparison_list';
    
    public function createNew($property, $clients){
        global $agency;
        $ids = [];
        
        for ($i = 0; $i < count($clients); $i++){
            array_push($ids, $clients[$i]->id);
        }
        
        $new_event = $this->create([
            "agency" => $agency->getId(),
            "author" => $_SESSION["user"],
            "property" => intval($property), 
            "data" => json_encode($ids),
            "count" => count($clients),
            "timestamp" => time()
        ]);

        return $new_event->save();
    }
    
    public function getLastDate($property){
        global $agency;
        
        $query = DB::createQuery()->select('MAX(timestamp) AS timestamp')->where('property = ? AND agency = ?'); 
	$response = $this->getList($query, [intval($property), $agency->getId()]);
        
        return $response[0]->timestamp;
    }
    
    public function getLastCount($property){
        global $agency;
        
        $last_date = $this->getLastDate(intval($property));
        
        if ($last_date != null){
            $query = DB::createQuery()->select('count')->where('property = ? AND agency = ? AND timestamp = ?'); 
            $response = $this->getList($query, [intval($property), $agency->getId(), $last_date]);

            $total = $response[0]->count;
            
            $query2 = DB::createQuery()->select('id')->where('property = ? AND agency = ? AND (event = "delete") AND deleted = 0'); 
            $response2 = PropertyComparison::getList($query2, [intval($property), $agency->getId()]);
            
            return $total-count($response2);
        }
        else{
            return null;
        }
    }
    
    public function getProperties($property){
        global $agency;
        
        $last_date = $this->getLastDate(intval($property));
        
        $query = DB::createQuery()->select('data')->where('property = ? AND agency = ? AND timestamp = ?'); 
        $response = $this->getList($query, [intval($property), $agency->getId(), $last_date]);

        $ids = json_decode($response[0]->data);
        $clients = [];
        
        for ($i = 0; $i < count($ids); $i++){
            array_push($clients, Client::load($ids[$i]));
        }
        
        return [
            "data" => $clients, 
            "total" => count($ids),
            "type" => "last"
        ];
    }
}
