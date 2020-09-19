<?php

use Database\TinyMVCDatabase as Database;

class App{
    public function getUser($user_id){
        $user_id = intval($user_id);
	$user = User::load($user_id);
        
        try{
            if ($user === FALSE)
                throw new Exception("User not exists at all", 503);
            
            $response = [
                //"pAgency" => $agency_data["agent"],
                "pUser" => $user
            ];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getCurrentUser(){
        $user_id = intval($_SESSION["user"]);
	$user = User::load($user_id);
        
        try{
            if ($user === FALSE)
                throw new Exception("User not exists at all", 503);
            
            $response = [
                //"pAgency" => $agency_data["agent"],
                "pUser" => $user
            ];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }

}
