<?php

use Database\TinyMVCDatabase as DB;

class Quotes extends Database\TinyMVCDatabaseObject{
    const tablename  = 'quote';
    
    public function get(){
        global $agency;
        
        $query = DB::createQuery()->select('id, cell, data')->where('agency=? AND deleted=0')->order('timestamp ASC'); 
        return $this->getList($query, [$agency->getId()]);
    }
    
    public function add($cell, $data){
        global $agency;
        
        $new_quote = $this->create([
            "cell" => intval($cell), 
            "author" => $_SESSION["user"], 
            "agency" => $agency->getId(), 
            "data" => strval($data), 
            "timestamp" => time()
        ]);
        
        $added_id = $new_quote->save();
        
        return ["id" => $added_id, "data" => $data];
    }
    
    public function set($id, $data){
        $quote = $this->load(intval($id));
        
        if (strlen($data) > 0){
            $quote->data = strval($data);
            $saved_id = $quote->save();
        
            return ["id" => $saved_id, "data" => $quote->data];
        }
        else{
            $quote->deleted = 1;
            $quote->save();
        
            return -1;
        }
    }
}