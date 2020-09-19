<?php

use Database\TinyMVCDatabase as DB;

class AutocompleteSynonim extends Database\TinyMVCDatabaseObject{ // класс системы гео-синонимов
    const tablename  = 'synonim';
    const HOST_AGENCY_ID = 1;
    
    public function search($search_query, $place_id, $place_text){ // ищет все синониы, подходящие под запрос $query
        global $agency;
        $query = DB::createQuery()->select('id, text')->where('text LIKE ? AND agency = ? AND (place_id = ? OR place_text = ?) LIMIT 5'); 
        $response = $this->getList($query, ["%".strval($search_query)."%", $agency->getId(), strval($place_id), strval($place_text)]);
        
        return count($response) > 0 ? $response : 0;
    }
    
    public function add($text, $place_id, $place_text, $place_fulltext, $place_city, $place_city_text){
        global $agency, $translate;
        
        try{
            $checklang_result = $translate->checkLanguage($text);
            
            if (!$checklang_result[0]){
                throw new Exception("wrong_synonim_language_need_".$checklang_result[1], 403);
            }
            
            GoogleAC::staticAddByPlaceid($place_id);

            $new_synonim = $this->create([
                "author" => $_SESSION["user"], 
                "agency" => $agency->getId(), 
                "text" => strval($text),
                "place_id" => strval($place_id),
                "place_text" => strval($place_text),
                "place_fulltext" => Geo::getFullAddress(strval($place_id)),
                "place_city" => strval($place_city),
                "place_city_text" => strval($place_city_text),
                "timestamp" => time()
            ]);
            $added_id = $new_synonim->save();
            
            $response = ["id" => $added_id, "text" => $text];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function edit($synonim_id, $text){
        global $agency, $translate;
        
        try{
            if ($agency->getId() != self::HOST_AGENCY_ID){
                throw new Exception("access_forbidden_label", 501);
            }
            
            $checklang_result = $translate->checkLanguage($text);
            
            if (!$checklang_result[0]){
                throw new Exception("wrong_synonim_language_need_".$checklang_result[1], 403);
            }
            
            GoogleAC::staticAddByPlaceid($place_id);

            $synonim_to_edit = $this->load($synonim_id);
            $synonim_to_edit->text = $text;
            $saved_id = $synonim_to_edit->save();
            
            $response = ["id" => $saved_id, "text" => $text];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function get($id, $type){ // берет и отдает клиент один синоним по id
        $synonim = $this->load(intval($id));
        return ["id" => $synonim->id, "text" => $synonim->text, "type" => strval($type)];
    }

    public function createNew($text){ // создает новый синоним и возвращает id
        global $agency;
        
        $new_synonim = $this->create([
            "author" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "text" => strval($text),
            "timestamp" => time()
        ]);
        return $new_synonim->save();
    }
    
    public static function getByPlaceID($place_id){ // массивв должен быть НЕ ассоц.
        $synonim = [];
        
        $query = DB::createQuery()->select('text')->where('place_id = ?'); 
        $response = self::getList($query, [strval($place_id)]);

        if (count($response) > 0){
            array_push($synonim, $place_id);
            array_push($synonim, $response[0]->text);
        }
        else{
            $synonim = FALSE;
        }
        
        return $synonim;
    }
}
