<?php

use Database\TinyMVCDatabase as DB;

class Localization extends Database\TinyMVCDatabaseObject{
    const tablename  = 'locale';
    
    public function getLocale($lang){
        $lang = strval($lang);
        $query = DB::createQuery()->select('variable, '.$lang); 
        return $this->getList($query, [null]);
    }
    
    public function getBrowserLocale(){
        $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        
        switch ($lang){
            case "en":
                return "en";
            break;
            case "he":
                return "he";
            break;
            case "ru":
                return "ru";
            break;        
            default:
                return "en";
            break;
        }
    }
    
    public function getDefaultLocale(){
        global $defaults;
        $response = [];
        
        $default_locale = $response["locale_value"] = $defaults->getLocale(); // дифолт языка из базы, отдается на клиента если нет в куках
        $query = DB::createQuery()->select('variable, '.$default_locale); 
        $response["locale_data"] = $this->getList($query, null);
        
        return $response;
    }
    
    public function getVariable($locale, $key){
        $query = DB::createQuery()->select($locale)->where("variable = ?"); 
        $variable_list = $this->getList($query, [$key]);
        return $variable_list[0]->$locale;
    }
    
    public function getCurLocale(){
        global $defaults;
        
        $default_locale = $defaults->getLocale();
        
        return $default_locale;
    }
    
    public function getVariableCurLocale($key){
        global $defaults;
        
        $default_locale = $defaults->getLocale();
        $query = DB::createQuery()->select($default_locale)->where("variable = ?"); 
        $variable_list = $this->getList($query, [$key]);
        return $variable_list[0]->$default_locale;
    }
    
    public function getVariableCurUserLocale($key, $user){
        global $defaults;
        
        $default_locale = $defaults->getLocaleByUser($user);
        $query = DB::createQuery()->select($default_locale)->where("variable = ?"); 
        $variable_list = $this->getList($query, [$key]);
        return $variable_list[0]->$default_locale;
    }
    
    public function isArabian($locale){
        if ($locale === "he" || $locale === "ar" || $locale === "fa"){
            return TRUE;
        }
        else{
            return FALSE;
        }
    }
    
    public function toXSL($page){
        global $defaults;
        
        $default_locale = $defaults->getLocale();
        $query = DB::createQuery()->select('variable, '.$default_locale); 
        $query_result = $this->getList($query, null);
        $response = $page;
        //echo '<pre>'; print_r($result); echo '</pre>';
        
        for ($i = 0; $i < count($query_result); $i++){
            $response = str_replace("xsl_locale_".$query_result[$i]->variable."__", $query_result[$i]->$default_locale, $response);
        }
        
        $response = str_replace('option value="'.$default_locale.'"', 'option value="'.$default_locale.'" selected', $response); // выставляем язык в шапке в селекте
        $response = str_replace("MAPS_LOCALE_ID", $default_locale, $response); // выставляем язык для Google Maps
        
        return $response;
    }
    
    public function localizePayPal($page){
        global $defaults;
        
        $default_locale = $defaults->getLocale();
        $paypal_locale = "US";
        
        switch ($default_locale){
            case "ru":
                $paypal_locale = "RU";
            break;
            case "he":
                $paypal_locale = "IL";
            break;
        }
        
        return str_replace("xsl_paypal_locale", $paypal_locale, $page);
    }
    
}