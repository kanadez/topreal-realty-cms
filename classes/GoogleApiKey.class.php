<?php

use Database\TinyMVCDatabase as DB;

class GoogleApiKey extends Database\TinyMVCDatabaseObject{ // класс системы гео-синонимов
    const tablename  = 'google_api_key';
    const tablename_with_prefix = "topreal_google_api_key";

    /**
     * Функция берет из базы самый старый по времени ключ, дабы создать возможность чередовать ключи в будущем
     */
    public static function getOldestKey(){
        $query = DB::createQuery()->select('id')->where('last_used = (SELECT MIN(last_used) FROM '.self::tablename_with_prefix.')'); 
        $oldest_key_response = self::getList($query);        
        $oldest_key_id = array_pop($oldest_key_response)->id;
        
        $oldest_key = self::load($oldest_key_id);
        $api_key = $oldest_key->api_key;
        $oldest_key->last_used = self::microtimeFloat();
        $oldest_key->save();
        
        return $api_key;
    }
    
    private static function microtimeFloat(){
        list($usec, $sec) = explode(" ", microtime());
        
        return ((float)$usec + (float)$sec);
    } 
}
