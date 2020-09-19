<?php

use Database\TinyMVCDatabase as DB;

class Photo extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property_photo';
    
    public function setTitle($property, $file, $title){
        $query = DB::createQuery()->select('id')->where("image = ? AND property = ? AND deleted = 0"); // берем ИД нашей копии 
        $response = $this->getList($query, [strval($file), strval($property)]); // получаем наши копии
        $photo = $this->load($response[0]->id);
        
        $photo->name = strval($title);
        return $photo->save(); 
    }
}