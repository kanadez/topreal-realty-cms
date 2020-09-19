<?php

use Database\TinyMVCDatabase as DB;

class Dimensions extends Database\TinyMVCDatabaseObject{
    const tablename  = 'dimensions';
    
    public function convert($convertion_currency, $subject_currency, $subject_price){
        $response["iConvertedPrice"] = round($subject_price/($this->getCoef($subject_currency)*$this->getCoef($convertion_currency)), 2);
        $response["sConvertedCurrencySymbolCode"] = $this->getSymbolCode($convertion_currency);
        return $response;
    }

    /*public function getList(){
        global $currency_data;
        return $currency_data;
    }*/
    
    
    public function get($id){
        global $currency_data;
        return $currency_data[$id];
    }

    public function getRatio($code){
        $dimension = $this->loadByRow("code", $code);
        return $dimension->exchange;
    }

    public function getSymbolCode($code){
        global $currency_data;
        return $currency_data[$code]["sCurrencySymbolCode"];
    }

    public function getName($code){
        global $currency_data;
        return $currency_data[$code]["sCurrencyName"];
    }
    
    public function getCode($name){
        global $currency_data;
        $response = -1;
        
        try{
            for ($i = 0; $i < count($currency_data); $i++)
                if ($currency_data[$i]["sCurrencySymbolCode"] == $name)
                    $response = $i;
                
                if ($response == -1)
                    throw new Exception("There is no such currency", 401);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }

    public function getDefaultSymbolCode(){
        global $currency_data;
        return $currency_data[0]["sCurrencySymbolCode"];
    }

    public function getDefaultCoef(){
        global $currency_data;
        return $currency_data[0]["iCurrencyCoef"];
    }

}
