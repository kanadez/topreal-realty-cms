<?php

use Database\TinyMVCDatabase as DB;

class ResponseList extends Database\TinyMVCDatabaseObject{
    const tablename  = 'list';
    
    public function createNew($title, $data, $type){
        $title = strval($title);
        $parameters = [
            "title" => strval($title), 
            "author" => intval($_SESSION["user"]), 
            "data" => strval($data), 
            "type" => strval($type), 
            "timestamp" => time()
        ];
        $newlist = $this->create($parameters);
        return $newlist->save();
    }
    
    public function rewrite($id, $data, $type){
        $list = $this->load(intval($id));
        $list->data = strval($data);
        $list->type = strval($type);
        return $list->save();
    }
    
    public function get($id){ // данная функция будет по ID объекта поиска вытаскивать его из базы и отдавать
        global $agency, $stock;
        
        $list = $this->load(intval($id));
        $items_ids = json_decode($list->data, true);
        $items = [];
        
        for ($i = 0; $i < count($items_ids); $i++){
            if ($list->type == "properties"){
                $property = Property::load($items_ids[$i]);

                if ($property->stock == 1 && $property->agency != $agency->getId()){
                    if ($stock->exist($property->id)){
                        $property->foreign_stock_changed = 1; // своя копия чужокго стока
                    }

                    $property->foreign_stock = 1; // сток чужой

                    if ($property->statuses == 7 || $property->statuses == 5){
                        $property->house_number = null;
                        $property->contact1 = $agency->getPhone($property->agency);
                        $property->contact2 = null;
                        $property->contact3 = null;
                        $property->contact4 = null;
                    }
                }
                else{
                    if ($stock->exist($property->id)){
                        $property->foreign_stock_changed = 0; // чужая копия чужокго стока
                    }

                    $property->foreign_stock = 0;
                }

                array_push($items, $property);
            }
            elseif ($list->type == "clients"){
                $client = Client::load($items_ids[$i]);

                if ($client->agency == $agency->getId()){
                    array_push($items, $client);
                }
            }
        }
        
        return ["title" => $list->title, "data" => $items, "type" => $list->type];
    }
    
    public function getAll(){
        $query = DB::createQuery()->select('*')->where("deleted = 0 AND data <> '[]' AND author = ?")->order('timestamp DESC');
        return $this->getList($query, [$_SESSION["user"]]);
    }
    
    public function restore($id){
	$list = $this->load(intval($id));
        $list->deleted = 0;
        
        return $list->save();            
    }
    
    public function delete($id){    
	$list = $this->load(intval($id));
        $list->deleted = 1;
        
        return $list->save();            
    }
    
    public function refresh($properties, $clients){
        global $agency;
        
        $properties_response = [];
        $clients_response = [];
        
        if (count($properties) > 0){
            $properties_decoded = json_decode($properties, true);
            
            for ($i = 0; $i < count($properties_decoded); $i++){
                if ($properties_decoded[$i]["external"] == 0){
                    $p = Property::load($properties_decoded[$i]["card"]);
                    
                    if ($p->stock == 1 && $p->agency != $agency->getId()){
                        $p->foreign_stock = 1;
                    }
                    else{
                        $p->foreign_stock = 0;
                    }
                    
                    array_push($properties_response, $p);
                }
                else{
                    $ep = PropertyExternal::load($properties_decoded[$i]["card"]);
                    $ep_external_id = $ep->external_id;
                    
                    if ($ep->source == "yad2"){
                        $exploded = explode("_", $ep_external_id = $ep->external_id);
                        $ep_external_id = end($exploded);
                    }
                    
                    $query = DB::createQuery()->select('*')->where("(external_id = ? OR external_id_hex = ? OR external_id_winwin = ?) AND deleted = 0 AND temporary = 0");
                    $response = Property::getList($query, [$ep_external_id, $ep_external_id, $ep_external_id]);
                    $property_tmp = null;
                    
                    if (count($response) > 0){
                        $internal_id = $response[0]->id;
                        $response[0]->id = $properties_decoded[$i]["card"];
                        $response[0]->internal_id = $internal_id;
                        $property_tmp = $response[0];
                        //array_push($properties_response, $response[0]);
                    }
                    else{
                        $property_tmp = $ep;
                        //array_push($properties_response, $ep);
                    }
                    
                    if ($property_tmp->stock == 1 && $property_tmp->agency != $agency->getId()){
                        $property_tmp->foreign_stock = 1;
                    }
                    else{
                        $property_tmp->foreign_stock = 0;
                    }
                    
                    array_push($properties_response, $property_tmp);
                }
            }
        }
        
        if (count($clients) > 0){
            $clients_decoded = json_decode($clients, true);
            
            for ($i = 0; $i < count($clients_decoded); $i++){
                $c = Client::load($clients_decoded[$i]["card"]);
                array_push($clients_response, $c);
            }
        }
        
        return ["properties" => $properties_response, "clients" => $clients_response];
    }
}