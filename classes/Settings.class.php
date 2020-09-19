<?php
/*ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);*/
use Database\TinyMVCDatabase as DB;

class Settings extends Database\TinyMVCDatabaseObject{
    const tablename  = 'settings';
    
    public static function getValue($name){
        $setting = self::loadByRow("name", $name);
        
        return $setting->value;
    }
    
    public static function setValue($name, $value){
        $setting = self::loadByRow("name", $name);
        $setting->value = $value;
        return $setting->save();
    }
    
}