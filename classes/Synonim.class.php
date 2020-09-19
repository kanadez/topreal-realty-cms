<?php

use Database\TinyMVCDatabase as DB;

class Synonim extends Database\TinyMVCDatabaseObject{ // класс системы гео-синонимов
    const tablename  = 'synonim';
    
    public function search($search_query, $place_city, $place_city_text){ // ищет все синониы, подходящие под запрос $query
        global $agency;
        $query = DB::createQuery()->select('id, text, place_id, place_text')->where('text LIKE ? AND (place_city = ? OR place_city_text = ?)')->order("timestamp DESC LIMIT 5"); 
        $response = $this->getList($query, ["%".strval($search_query)."%", strval($place_city), strval($place_city_text)]);
        
        return count($response) > 0 ? $response : 0;
    }
    
    public function get($id, $type){ // берет и отдает клиент один синоним по id
        $synonim = $this->load(intval($id));
        return ["id" => $synonim->id, "text" => $synonim->text, "type" => strval($type)];
    }

    public function createNew($text, $city){ // создает новый синоним и возвращает id
        global $agency;
        
        $new_synonim = $this->create([
            "author" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "text" => strval($text),
            "place_city" => $city,
            "place_city_text" => Geo::getFullByPlaceid($city)["name"],
            "timestamp" => time()
        ]);
        return $new_synonim->save();
    }
    
    public function createNewFromExternal($text, $city){ // создает новый синоним и возвращает id
        $new_synonim = $this->create([
            "author" => 1,
            "agency" => 1,
            "text" => strval($text),
            "place_city" => $city,
            "place_city_text" => Geo::getFullByPlaceid($city)["name"],
            "timestamp" => time()
        ]);
        return $new_synonim->save();
    }
}
