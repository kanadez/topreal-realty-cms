<?php

include(dirname(__FILE__).'/Currency.data.php');

use Database\TinyMVCDatabase as DB;

class Currency extends Database\TinyMVCDatabaseObject{
    const tablename  = 'currency';
    
    public function update(){
        $query = DB::createQuery()->select('id, symbol, last_updated');
        $currency_list = $this->getList($query, []);

        if (time() - $currency_list[0]->last_updated > 86400){ // here must be 86400
            $request_string = "https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22";

            for ($i = 0; $i < count($currency_list); $i++)
                if ($i < count($currency_list)-1)
                    $request_string .= "USD".$currency_list[$i]->symbol.",";
                else $request_string .= "USD".$currency_list[$i]->symbol;

            $request_string .= "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
            $myCurl = curl_init();

            curl_setopt_array($myCurl, array(
                CURLOPT_URL => $request_string,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => false
            ));

            $response = curl_exec($myCurl);
            curl_close($myCurl);

            $array = json_decode($response, true);
            $rates = $array["query"]["results"]["rate"];

            for ($z = 0; $z < count($rates); $z++){
                $rate = $rates[$z]["Rate"];
                $names = explode("/", $rates[$z]["Name"]);
                $name = $names[1];
                
                $currency = $this->loadByRow("symbol", $name);
                $currency->exchange = $rate;
                $currency->last_updated = time();
                
                $currency->save();  
            }            
            
            /*for ($z = 0; $z < count($rates); $z++){
                $request_string2 = "UPDATE `currency` SET `exchange` = ";
                $rate = $rates[$z]["Rate"];
                $names = explode("/", $rates[$z]["Name"]);
                $name = $names[1];
                $request_string2 .= "$rate WHERE `symbol` = '$name';";
                $db->db_query($request_string2, __LINE__, __FILE__);

                $request_string3 = "UPDATE `currency` SET `last_updated` = ".time()." WHERE `symbol` = '".$name."';";
                $db->db_query($request_string3, __LINE__, __FILE__);
            }*/
        }
    }
    
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
        $currency = $this->loadByRow("code", $code);
        return $currency->exchange;
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
