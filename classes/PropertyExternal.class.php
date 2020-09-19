<?php

use Database\TinyMVCDatabase as DB;

class PropertyExternal extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property_external';
    
    public function createNew($data){
        // проверяем на существование в базе внешних
        $query = DB::createQuery()->select('id, stock_id')->where('external_id = ?'); 
        $resp = $this->getList($query, [$data["external_id"]]);
        
        // проверяем на существование в базе внутренних
        //$external_id_exploded = explode("_", $data["external_id"]);
        //$external_id_extracted = end($external_id_exploded);
        //Log::i("PropertyExternal::createNew()", "started");
        //$property_query = DB::createQuery()->select('id')->where('external_id = ? OR external_id_hex = ?'); 
        //$property_resp = Property::getList($property_query, [$external_id_extracted, $external_id_extracted]);
        
        if ($data["external_id"] == null){// || count($property_resp) > 0){
            return false;
        }
        elseif (count($resp) > 0){
            $p = $this->load($resp[0]->id);
            $new_last_updated = $this->parseLastUpdated($data["last_updated"]);
            
            if ($p->last_updated < $new_last_updated){
                $p->price = $data["price"];
                $p->last_updated = $this->parseLastUpdated($data["last_updated"]);
                $p->query = $data["query"];
                $p->city_street = $data["city_street"];
                $r1 = $p->save();

                //Log::i("PropertyExternal::createNew()", "updated external: ".$resp[0]->id.", ".$p->price.", ".$r1);
            }
            
            $stock_id = $resp[0]->stock_id;
            $stock_old_price = 0;

            if ($stock_id != null){
                $stock = Property::load($stock_id);
                
                if ($stock->last_updated < $new_last_updated){
                    $stock_old_price = $stock->price;
                    $stock->price = $data["price"];
                    $stock->last_updated = $this->parseLastUpdated($data["last_updated"]);
                    $r2 = $stock->save();

                    $property_object = new Property;
                    $property_object->savePriceHistory($stock_id, $stock->price, $stock_old_price, $stock->currency_id);
                    $property_object->setStockHistory($stock_id, '{"price":{"old":"'.$stock_old_price.'","new":"'.$stock->price.'"}}');

                    //Log::i("PropertyExternal::createNew()", "updated stock: ".$stock_id.", ".$p->price.", ".$r2);
                }
            }
            
            return false;
        }
        
        global $googleac, $geo;
        $country = null;
        $country_text = null;
        $city = null;
        $city_text = null;
        $street = null;
        $street_text = null;
        $latlng = null;
        
        $country_tmp = $geo->getPlaceIdByAddress($data["country"]);
        
        if ($country_tmp != null && $country_tmp != "null"){
            $country = $country_tmp;
            $country_text = Geo::getFullAddress($country_tmp);
        }
        else{
            $country_text = $data["country"];
        }
        
        if (strlen($data["city"]) > 0){
            $city_tmp = $geo->getPlaceIdByAddress($data["city"]." ".$data["country"]);

            if ($city_tmp != null && $city_tmp != "null"){
                $city = $city_tmp;
                $city_text = Geo::getFullAddress($city_tmp);
            }
            else{
                $city_text = $data["city"];
            }
        }
        
        if (strlen($data["street"]) > 0){
            $street_tmp = $geo->getPlaceIdByAddress($data["street"]." ".$data["city"]." ".$data["country"]);
            $types = $this->parseType($data["type"]);
            
            if (
                    ($street_tmp != null && $street_tmp != "null" && $street_tmp != $city) ||
                    ($types == "[7]" || $types == "[11]" || $types == "[7,11]")
            ){
                $street = $street_tmp;
                $street_text = Geo::getFullAddress($street);
                $latlng = $this->getLocation($street, $data);
                $googleac->ajaxAddShortNoLocale($street);
            }
            else{
                return false;
                //$street_text = $data["street"];
            }
        }
        
        $new_property = $this->create([
            "external_id" => $data["external_id"],
            "ascription" => $data["ascription"],
            "types" => $this->parseType($data["type"]), 
            "country" => $country,
            "country_text" => $country_text,
            "city" => $city,
            "city_text" => $city_text,
            "street" => $street,
            "street_text" => $street_text,
            "lat" => $latlng["lat"],
            "lng" => $latlng["lng"],
            "price" => $data["price"],
            "currency_id" => $this->parseCurrency($data["currency"]),
            "rooms_count" => $data["rooms_count"],
            "floors_count" => $data["floors_count"],
            "last_updated" => $this->parseLastUpdated($data["last_updated"]),
            "source" => $data["source"],
            "query" => $data["query"],
            "city_street" => $data["city_street"],
            "timestamp" => time()
        ]);
        $response = $new_property->save();
                
        return $response;
    }
    
    public function createNewWinwin($data){
        // проверяем на существование в базе внешних
        $query = DB::createQuery()->select('id')->where('external_id = ?'); 
        $resp = $this->getList($query, [$data["external_id"]]);
        
        // проверяем на существование в базе внутренних
        //$property_query = DB::createQuery()->select('id')->where('external_id_winwin = ?'); 
        //$property_resp = Property::getList($property_query, [$data["external_id"]]);
        
        if (count($resp) > 0 || $data["external_id"] == null){// || count($property_resp) > 0){
            return false;
        }
        
        global $googleac, $geo;
        $country = null;
        $country_text = null;
        $city = null;
        $city_text = null;
        $street = null;
        $street_text = null;
        $latlng = null;
        
        $country_tmp = $geo->getPlaceIdByAddress($data["country"]);
        
        if ($country_tmp != null && $country_tmp != "null"){
            $country = $country_tmp;
            $country_text = Geo::getFullAddress($country_tmp);
        }
        else{
            $country_text = $data["country"];
        }
        
        if (strlen($data["city"]) > 0){
            $city_tmp = $geo->getPlaceIdByAddress($data["city"]." ".$data["country"]);

            if ($city_tmp != null && $city_tmp != "null"){
                $city = $city_tmp;
                $city_text = Geo::getFullAddress($city_tmp);
            }
            else{
                $city_text = $data["city"];
            }
        }
        
        if (strlen($data["street"]) > 0){
            $street_tmp = $geo->getPlaceIdByAddress($data["street"]." ".$data["city"]." ".$data["country"]);

            if ($street_tmp != null && $street_tmp != "null" && $street_tmp != $city){
                $street = $street_tmp;
                $street_text = Geo::getFullAddress($street);
                $latlng = $this->getLocation($street, $data);//Geo::getLatLngByAddress($street_text);
                $googleac->ajaxAddShortNoLocale($street);
            }
            else{
                $street_text = $data["street"];
            }
        }
        
        $new_property = $this->create([
            "external_id" => $data["external_id"], 
            "ascription" => $data["ascription"],
            "types" => $this->parseType($data["type"]), 
            "country" => $country,
            "country_text" => $country_text,
            "city" => $city,
            "city_text" => $city_text,
            "street" => $street,
            "street_text" => $street_text,
            "lat" => $latlng["lat"],
            "lng" => $latlng["lng"],
            "house_number" => $data["house_number"],
            "price" => $data["price"],
            "currency_id" => $this->parseCurrency($data["currency"]),
            "rooms_count" => $data["rooms_count"],
            "floors_count" => $data["floors_count"],
            "last_updated" => $this->parseLastUpdated($data["last_updated"]),
            "source" => $data["source"],
            "query" => $data["query"],
            "timestamp" => time()
        ]);
        $response = $new_property->save();
                
        return $response;
    }
    
    private function getLocation($street, $data){
        $latlng = null;
        $c = 0;
        $max_geo_attempts = 3;
        
        if ($street != NULL){
            while ($latlng == null && $c < $max_geo_attempts){
                $latlng = Geo::getTrueLocation($street, null, 0);
                $c++;
                usleep(100000);
            }
        }
        
        return $latlng;
    }
    
    private function parseType($type){
        global $property_form_data;
        
        $response = [];
        $types = [];
        
        if (strpos($type, "דירה") !== false){ // если распарсеный аскрипшн содержит Коттедж
            array_push($response, "apartment"); // то значение парсинга = Коттедж
        }
        else if (strpos($type, "דירת גן") !== false){
            array_push($response, "garden_apartment");
        }
        else if (strpos($type, "גג/פנטהאוז") !== false){
            array_push($response, "penthouse");
        }
        else if (strpos($type, "סטודיו/לופט") !== false){
            array_push($response, "studio");
        }
        else if (strpos($type, "דירת נופש") !== false){
            array_push($response, "camp");
        }
        else if (strpos($type, "מרתף/פרטר") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "דופלקס") !== false){
            array_push($response, "duplex");
        }
        else if (strpos($type, "טריפלקס") !== false){
            array_push($response, "duplex_plus");
        }
        else if (strpos($type, "פרטי/קוטג'") !== false){
            array_push($response, "cottage");
        }
        else if (strpos($type, "דו משפחתי") !== false){
            array_push($response, "two_family_house");
        }
        else if (strpos($type, "יחידת דיור") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "משק חקלאי/נחלה") !== false){
            array_push($response, "farm");
        }
        else if (strpos($type, "משק עזר") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "מחסן") !== false){
            array_push($response, "warehouse");
        }
        else if (strpos($type, "חניה") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "מבנים ניידים/קרוואן") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "מגרשים") !== false){
            array_push($response, "land");
        }
        else if (strpos($type, "בניין מגורים") !== false){
            array_push($response, "building");
        }
        else if (strpos($type, "קב' רכישה/ זכות לנכס") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "כללי") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "סאבלט") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "החלפת הדירות") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "אולמות") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "בניין משרדים") !== false){
            array_push($response, "office");
        }
        else if (strpos($type, "חנויות/שטח מסחרי") !== false){
            array_push($response, "store");
        }
        else if (strpos($type, "חניון") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "מבני תעשיה") !== false){
            array_push($response, "commercial");
        }
        else if (strpos($type, "מחסנים") !== false){
            array_push($response, "warehouse");
        }
        else if (strpos($type, "מרתף") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "משק חקלאי") !== false){
            array_push($response, "farm");
        }
        else if (strpos($type, "משרדים") !== false){
            array_push($response, "office");
        }
        else if (strpos($type, "נחלה") !== false){
            array_push($response, "other");
        }
        else if (strpos($type, "עסקים למכירה") !== false){
            array_push($response, "commercial");
        }
        else if (strpos($type, "קליניקות") !== false){
            array_push($response, "other");
        }
        else{
            array_push($response, "other");
        }
        
        for ($m = 0; $m < count($response); $m++){
            $index = array_search($response[$m], $property_form_data["property_type"]);

            if ($index !== FALSE){ 
                array_push($types, $index);
            }
        }

        return json_encode($types);
    }
    
    private function parseCurrency($currency){
        global $currency;
        
        $response = null;
        
        if (strpos($currency, "₪") !== false){
            $response = "ILS";
        }
        
        return $currency->getCode($response);
    }
    
    private function parseLastUpdated($time){
        $a = strptime($time, '%d.%m.%y');
        return mktime(0, 0, 0, $a['tm_mon']+1, $a['tm_mday'], $a['tm_year']+1900);
    }
    
    public static function createLink($property, $external_id){
        if ($external_id != null && strlen($external_id) > 0){
            $ext_id = "%".$external_id."%";
            $query = DB::createQuery()->select('id')->where("external_id LIKE ?");
            $ext_response = self::getList($query, [$ext_id]);
            $response = null;

            for ($r = 0; $r < count($ext_response); $r++){
                $ext_property = PropertyExternal::load($ext_response[$r]->id);
                $ext_property->stock_id = $property->id;
                $response = $ext_property->save();
            }
            
            return $response;
        }
        else{
            return false;
        }
    }
    
    public static function removeOld(){
        $two_months_ago = time()-5270400;
        $query = DB::createQuery()->select('id')->where("timestamp < ?");
        $ext_response = self::getList($query, [$two_months_ago]);

        for ($r = 0; $r < count($ext_response); $r++){
            $ext_property = self::load($ext_response[$r]->id);
            $ext_property->deleted = 1;
            $ext_property->save();
        }
    }
    
    public function deleteList($properties){
        $properties_list = json_decode($properties);

        for ($r = 0; $r < count($properties_list); $r++){
            $ext_property = $this->load($properties_list[$r]->card);
            $ext_property->deleted = 1;
            $ext_property->save();
        }
    }
}
