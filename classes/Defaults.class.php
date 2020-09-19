<?php

use Database\TinyMVCDatabase as DB;

class Defaults extends Database\TinyMVCDatabaseObject{
    const tablename  = 'user_default';
    
    public function get(){ //  get defaults for myself
        global $localization;
        $user_defaults = $this->loadByRow("user", $_SESSION["user"]);
        
        if ($_SESSION["user"] == 4){
            $user_defaults->locale = isset($_COOKIE["locale"]) ? $_COOKIE["locale"] : $localization->getBrowserLocale();
        }
        
        return $user_defaults;
    }
    
    public function getSearch(){ //  get default search for myself
        $defaults = $this->loadByRow("user", $_SESSION["user"]);
        
        if ($defaults->search != null && $defaults->search != 0){
            return Search::load($defaults->search);
        }
        else{
            return $defaults;
        }
    }
    
    public function getStock(){ //  get default stock value
        $defaults = $this->loadByRow("user", $_SESSION["user"]);
        
        return $defaults->search_stock;
    }
    
    public function getLocale(){
        global $localization;
        $locale_from_cookie = htmlspecialchars($_COOKIE["locale"]);
        
        if ($_SESSION["user"] == 4){ // если гость
            return $locale_from_cookie != NULL ? $locale_from_cookie : $localization->getBrowserLocale();
        }
        
        // для всех кроме гостя
        $defaults = $this->loadByRow("user", $_SESSION["user"]);
        $default_locale = $defaults->locale;
        
        if ($locale_from_cookie == NULL){ // если в куках языка нет
            if ($default_locale == NULL){ // и в базе в дифолте тоже
                $default_locale = $localization->getBrowserLocale(); // выставляем дифолтный англ
            }
        }
        else{ // если в куках язык есть
            $default_locale = $locale_from_cookie; // выставляем из куков
        }
        
        return $default_locale;
    }
    
    public function getLocaleByUser($user){
        global $localization;

        $defaults = $this->loadByRow("user", $user);
        $default_locale = $defaults->locale;
        
        if ($default_locale == NULL){ // и в базе в дифолте тоже
            $default_locale = $localization->getBrowserLocale(); // выставляем дифолтный англ
        }
        
        return $default_locale;
    }
    
    public function getSac(){ //  get default synonim alert closed flag for me
        $defaults = $this->loadByRow("user", $_SESSION["user"]);
        return $defaults->synonim_alert_closed;
    }
    
    public function getAllSearches(){ //  get default searches for all agency users
        global $agency;

        $query = DB::createQuery()->select('search')->where('agency=?'); 
        return $this->getList($query, [$agency->getId()]);
    }
    
    public function set($parameter, $value){ //set to myself
        try{
            $default = $this->loadByRow("user", $_SESSION["user"]);
            
            if ($default == FALSE)
                throw new Exception("Access forbidden", 501);
            
            $default->$parameter = $value;
            $response = $default->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function setUser($parameter, $value, $user){ // set to another user
        global $agency;
        $permission = new Permission();
        
        try{
            if (!$permission->is("edit_agent")){
                throw new Exception("Editing agents forbidden!", 501);
            }
            
            if (!$agency->isMyAgent(intval($user))){
                throw new Exception("Agent not exist!", 401);
            }
            
            $default = $this->loadByRow("user", $user);
            $default->$parameter = $value;
            $response = $default->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
}
