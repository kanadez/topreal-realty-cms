<?php

class Utils{
    private $phone_country_codes;

    function __construct() {
        $this->phone_country_codes = [
            "+972", // Israel
            "+7", // Russia
            "+33", // France
            "+1" // US
        ];
    }

    public static function isStringsSimilar($string1, $string2){
        similar_text($string1, $string2, $sim);
        
        if ($sim >= 90){
            return TRUE;
        }
        else{
            return FALSE;
        }
    }
    
    public function removeDuplicatesFromAssocArray($array, $key){
        if (count($array) === 0){
            return $array;
        }

        $new_array = [array_pop($array)];
        $exist = 0;

        while (count($array) > 0){
            $exist = 0;
            $element = array_pop($array);

            for ($i = 0; $i < count($new_array); $i++){
                if ($element->$key == $new_array[$i]->$key){
                    $exist++;
                }
            }

            if ($exist == 0){
                array_push($new_array, $element);
            }
        }
        
        return $new_array;
    }
    
    public function explodePhone($phone){
        $filtered = preg_replace('/\D/', '', $phone);
        $exploded = str_split($filtered);
        $expr = "(\\-|\\(|\\)|\\_|\\*|\\+|\\#|\\.|\\:|\\;)*";
        $response = "";
        
        for ($i = 0; $i < count($exploded); $i++){
            $response .= $expr.$exploded[$i];
        }
        
        return $response.$expr;
    }
    
    public function explodePhoneWithoutCountryCode($phone){ // удаляет код страны для поиска без него
        $phone_without_country_code = $phone;
        
        for ($i = 0; $i < count($this->phone_country_codes); $i++){
            $phone_without_country_code = str_replace($this->phone_country_codes[$i], $phone, "");
        }
        
        $filtered = preg_replace('/\D/', '', $phone_without_country_code);
        $exploded = str_split($filtered);
        $expr = "(\\-|\\(|\\)|\\_|\\*|\\+|\\#|\\.|\\:|\\;)*";
        $response = "";
        
        for ($i = 0; $i < count($exploded); $i++){
            $response .= $expr.$exploded[$i];
        }
        
        return $response.$expr;
    }
    
    public function log($msg){
        if (($handle = fopen("api_log.txt", "a")) !== FALSE){
            fwrite($handle, date('m/d/Y h:i:s a', time()).": ");      
            fwrite($handle, $msg."\n");
            
            fclose($handle);
        }
    }
    
    public function parseURLencoded($url){ // разбирает в массив строку вида param1=value&param2=value
        return explode("&", urldecode($url));
    }
}