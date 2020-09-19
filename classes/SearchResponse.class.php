<?php

use Database\TinyMVCDatabase as DB;

class SearchResponse extends Database\TinyMVCDatabaseObject{
    const tablename  = 'search_response';
    
    public static function set($search_id, $search_response){
        $start = microtime(true);
        $properties = $search_response["properties"];
        $clients = $search_response["clients"];
        $properties_ids = [];
        $clients_ids = [];
        $search_object = Search::load($search_id);
        
        if ($search_object->type == 1){
            for ($i = 0; $i < count($properties); $i++){
                array_push($properties_ids, $properties[$i]->id);
            }

            for ($i = 0; $i < count($clients); $i++){
                array_push($clients_ids, $clients[$i]->id);
            }

            $new_response = self::create([
                "search" => $search_id,
                "user" => $_SESSION["user"],
                "data" => json_encode(["properties" => $properties_ids, "clients" => $clients_ids]),
                "timestamp" => time()
            ]);
            $new_response->save();
            //Log::i("SearchResponse::set() microtime()", microtime(true)-$start);
        }
    }
    
    public function get($search_id){
        global $defaults;
        
        if ($search_id == "default"){
            $parsed_search_id = $this->getLast();
            
            $query = DB::createQuery()->select('data')->where("search = ?")->order("timestamp DESC LIMIT 1");
            $response = $this->getList($query, [$parsed_search_id]);
        }
        else{
            $query = DB::createQuery()->select('data')->where("search = ?")->order("timestamp DESC LIMIT 1");
            $response = $this->getList($query, [$search_id]);
        }
        
        return json_decode($response[0]->data, true);
    }
    
    public function getLast(){
        $query = DB::createQuery()->select('search')->where("user = ?")->order("timestamp DESC LIMIT 1");
        $response = $this->getList($query, [$_SESSION["user"]]);
        
        if (count($response > 0)){
            return $response[0]->search;
        }
        else{
            return false;
        }
    }
}