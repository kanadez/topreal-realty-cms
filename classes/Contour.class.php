<?php

use Database\TinyMVCDatabase as DB;

class Contour extends Database\TinyMVCDatabaseObject{
    const tablename  = 'contour';
    
    public function copyPreinstalled($id, $search){
        global $agency;
        
	$contour = $this->load(intval($id));
        $new_contour = $this->create([
            "title" => $contour->title,
            "city" => $contour->city,
            "data" => $contour->data,
            "agency" => $agency->getId(),
            "author" => $_SESSION["user"],
            "timestamp" => time(),
            "temporary" => 0,
            "preinstalled_search" => intval($search),
            "deleted" => 0
        ]);

        return [$new_contour->save(), $contour->title];
    }
    
    public function restore($id){
	$contour = $this->load(intval($id));
        $contour->deleted = 0; 
        return $contour->save();            
    }
    
    public function delete($id){  
        global $agency;
	$contour = $this->load(intval($id));
        
        $query = DB::createQuery()->select('id')->where("contour = ? AND default_search = 1 AND temporary = 0 AND deleted = 0 AND agency = ? LIMIT 1"); 
        $query_response = Search::getList($query, [intval($id), $agency->getId()]);
        
        try{
            if (count($query_response) > 0){
                throw new Exception("contour_default_search_forbidden", 501);
            }
            
            $contour->deleted = 1; 
            $response = $contour->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function updateTitle($id, $title){
	$contour = $this->load(intval($id));
        $contour->title = strval($title); 
        return ["id" => $contour->save(), "title" => strval($title)];            
    }
    
    public function createNewTemporary($search_id, $contour_data, $city){
        global $agency;
        $search_id = intval($search_id);
        
        $new_contour = $this->create([
            "author" => $_SESSION["user"], 
            "agency" => $agency->getId(), 
            "data" => $contour_data,
            "city" => strval($city),
            "temporary" => 1,
            "timestamp" => time()
        ]);
        
        $created_id = $new_contour->save();
        
        $search_id = intval($search_id);    
	$search = Search::load($search_id);
        $search->contour = strval($created_id); 
        $search->save();
    }
    
    public function createNew($search_id, $contour_title, $contour_data, $city){
        global $agency;
        $contour_title = strval($contour_title);
        $search_id = intval($search_id);
        
        $new_contour = $this->create([
            "title" => $contour_title,
            "author" => $_SESSION["user"], 
            "agency" => $agency->getId(), 
            "data" => $contour_data,
            "city" => strval($city),
            "timestamp" => time()
        ]);
        
        $created_id = $new_contour->save();
        
        if ($search_id != -1){
            $search_id = intval($search_id);    
            $search = Search::load($search_id);
            $search->contour = strval($created_id); 
            $search->save(); 
        }
        
        return $created_id;
    }
    
    public function set($contour_id, $search_id, $contour_data, $city){
        $search_id = intval($search_id);
        $contour_id = intval($contour_id);
        $contour = $this->load($contour_id);
        $contour->data = $contour_data;
        $contour->city = strval($city);
        
        if ($search_id != -1){
            $search = Search::load($search_id);
            $search->contour = strval($contour_id); 
            $search->save(); 
        }
        
        return $contour->save();            
    }
    
    public function createTemporary(){
        global $agency;
        
        $new_search = $this->create(["author" => $_SESSION["user"], "agency" => $agency->getId()]);
        return $new_search->save();
    }
    
    public function getQueryFormOptions(){ // берет из базы дефолтные опции для формы поиска
        global $query_form_data;
        $query_form_data["currency"] = Currency::getList();
        return $query_form_data;
    }
    
    public function getContoursList($search){
        global $agency;
        $contours_list = [];
        
        $query = DB::createQuery()->select('id, title, author, temporary, preinstalled_search')->where("temporary = 0 AND deleted = 0 AND agency = ".$agency->getId())->order("timestamp DESC"); 
        $response_list = $this->getList($query, [intval($search)]);
        $last_putted = FALSE;

        foreach ($response_list as $contour){
            if ($contour->preinstalled_search == null){
                array_push($contours_list, $contour);
            }
            else{
                if (!$last_putted){
                    array_push($contours_list, $contour);
                    $last_putted = TRUE;
                }
            }
        }
        
        return $contours_list;
    }
    
    public function getPreContoursList($city){
        $query = DB::createQuery()->select('id, title, author, temporary')->where("preinstalled_search IS NULL AND city = ? AND temporary = 0 AND deleted = 0 AND agency = 1")->order("timestamp DESC"); 
        
        return $this->getList($query, [$city]);
    }
    
    public static function getNoCityPreContoursList(){
        $query = DB::createQuery()
            ->select('*')
            ->where("preinstalled_search IS NULL AND city = ? AND temporary = 0 AND deleted = 0 AND agency = 1")
            ->order("timestamp DESC"); 
        
        return self::getList($query, [""]);
    }
    
    public static function isNoCityPreContour($contour_id){
        $query = DB::createQuery()
            ->select('id')
            ->where("id = ? AND preinstalled_search IS NULL AND city = ? AND temporary = 0 AND deleted = 0 AND agency = 1");
        
        $contours = self::getList($query, [$contour_id, ""]);
        
        if (count($contours) > 0){
            return TRUE;
        }
        else{
            return FALSE;
        }
    }
    
    public function get($search_id){ // данная функция будет по ID объекта поиска вытаскивать его из базы и отдавать
        $search_id = intval($search_id);
        $search = Search::load($search_id);
        $contour_id = $search->contour;
        
        $contour = $this->load($contour_id);
        return $contour->data; 
    }
    
    public function getByID($id){
        $id = intval($id);
        $contour = $this->load($id);
        return $contour->data; 
    }
    
    public function getForList($id){
        $id = intval($id);
        $contour = $this->load($id);
        return ["title" => $contour->title, "data" => $contour->data]; 
    }
}
