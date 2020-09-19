<?php

use Database\TinyMVCDatabase as DB;

class GoogleAC extends Database\TinyMVCDatabaseObject{ // класс системы гео-синонимов
    const tablename  = 'google_autocomplete';

    public function add($short_name, $long_name, $lat, $lng, $placeid){ // создает новый синоним и возвращает id
        $existing_location = $this->loadByRow("placeid", $placeid);
        
        if ($existing_location == FALSE){
            $new_location = $this->create([
                "short_name" => $short_name,
                "long_name" => $long_name,
                "lat" => $lat,
                "lng" => $lng,
                "placeid" => $placeid,
                "timestamp" => time()
            ]);
            return $new_location->save();
        }
    }
    
    public static function staticAddNotExisting($short_name, $long_name, $lat, $lng, $placeid, $locale){ // создает новый синоним и возвращает id
        if (
                isset($long_name) && 
                isset($short_name) && 
                isset($lat) && 
                isset($lng) && 
                isset($placeid) && 
                isset($locale)
        ){
            $existing_query = DB::createQuery()->select('id')->where(
                'short_name = ? AND '
                . 'long_name = ? AND '
                . 'lat = ? AND '
                . 'lng = ? AND '
                . 'placeid = ? '
                . 'AND locale = ?'
            ); 
            $existing_places = self::getList($existing_query, [
                $short_name, 
                $long_name, 
                $lat, 
                $lng, 
                $placeid, 
                $locale
            ]);
        
            if (count($existing_places) == 0){
                $new_location = self::create([
                    "short_name" => $short_name,
                    "long_name" => $long_name,
                    "lat" => $lat,
                    "lng" => $lng,
                    "placeid" => strval($placeid),
                    "locale" => $locale,
                    "timestamp" => time()
                ]);
                
                //Log::i("GoogleAC.class.php, staticAddNotExisting()", "executed");
                
                return $new_location->save();
            }
            else{
                return FALSE;
            }
        }
        else{
            return FALSE;
        }
    }
    
    public static function staticAddNotExistingWithLocalized($short_name, $long_name, $localized_name, $lat, $lng, $placeid, $locale){ // создает новый синоним и возвращает id
        if (
                isset($long_name) && 
                isset($short_name) && 
                isset($localized_name) &&
                isset($lat) && 
                isset($lng) && 
                isset($placeid) &&
                isset($locale)
        ){
            $existing_query = DB::createQuery()->select('id')->where(
                'short_name = ? AND '
                . 'long_name = ? AND '
                . 'localized_name = ? AND '
                . 'lat = ? AND '
                . 'lng = ? AND '
                . 'placeid = ? AND '
                . 'locale = ?'
            ); 
            $existing_places = self::getList($existing_query, [
                $short_name, 
                $long_name, 
                $localized_name, 
                $lat, 
                $lng, 
                $placeid, 
                $locale
            ]);
        
            if (count($existing_places) == 0){
                $new_location = self::create([
                    "short_name" => $short_name,
                    "long_name" => $long_name,
                    "localized_name" => $localized_name,
                    "lat" => $lat,
                    "lng" => $lng,
                    "placeid" => strval($placeid),
                    "locale" => $locale,
                    "timestamp" => time()
                ]);
                
                //Log::i("GoogleAC.class.php, staticAddNotExistingWithLocalized()", "executed");

                return $new_location->save();  
            }
            else{
                return FALSE;
            }
        }
        else{
            return FALSE;
        }
    }
    
    public static function staticAddByPlaceid($placeid){ // создает новый синоним и возвращает id
        $query = DB::createQuery()->select('id')->where('placeid = ? AND locale = "en"'); 
        $places = self::getList($query, [$placeid]);
        
        if (count($places) == 0){
            $location = Geo::getFullByPlaceid($placeid);
            $new_location = self::create([
                "short_name" => $location["address_components"][0]["short_name"],
                "long_name" => $location["formatted_address"],
                "lat" => $location["geometry"]["location"]["lat"],
                "lng" => $location["geometry"]["location"]["lng"],
                "placeid" => strval($placeid),
                "locale" => "en",
                "timestamp" => time()
            ]);
            return $new_location->save();
        }
    }
    
    public function ajaxAdd($short_name, $long_name, $placeid, $old_placeid){ // создает новый синоним и возвращает id
        //$locale = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        global $defaults;
        
        $user_defaults = $defaults->loadByRow("user", $_SESSION["user"]);
        $locale = $user_defaults->locale;
        
        $query = DB::createQuery()->select('id')->where('placeid = ? AND locale = ?'); 
        $places = $this->getList($query, [$placeid, $locale]);
        //$existing_location = $this->loadByRow("placeid", $placeid);
        
        if (count($places) === 0){
            $new_location = $this->create([
                "short_name" => $short_name,
                "long_name" => $long_name,
                "placeid" => $placeid,
                "timestamp" => time(),
                "locale" => $locale
            ]);
            
            $new_location->save();
        }
        
        if ($placeid != $old_placeid){
            $old_query = DB::createQuery()->select('id')->where('placeid = ? AND locale = ?'); 
            $old_places = $this->getList($old_query, [$old_placeid, $locale]);
            //$existing_location = $this->loadByRow("placeid", $placeid);
            
            if (count($old_places) === 0){
                $old_location = $this->create([
                    "short_name" => $short_name,
                    "long_name" => $long_name,
                    "placeid" => $old_placeid,
                    "timestamp" => time(),
                    "locale" => $locale
                ]);

                $old_location->save();
            }
        }
    }
    
    public function ajaxAddShort($placeid){ // вторая версия ajaxAdd, добавляет только по placeid и сразу координыаты тоже
        global $defaults;
        
        $user_defaults = $defaults->loadByRow("user", $_SESSION["user"]);
        $locale = $user_defaults->locale;
        
        $query = DB::createQuery()->select('id')->where('placeid = ? AND locale = ?'); 
        $places = $this->getList($query, [$placeid, $locale]);

        if (count($places) === 0){
            $geo_data = Geo::getForGoogleAC($placeid, $locale);
            
            if ($geo_data["short_name"] != null){
                $new_location = $this->create([
                    "short_name" => $geo_data["short_name"],
                    "long_name" => $geo_data["long_name"],
                    "placeid" => $geo_data["placeid"],
                    "lat" => $geo_data["lat"],
                    "lng" => $geo_data["lng"],
                    "timestamp" => time(),
                    "locale" => $locale
                ]);

                $new_location->save();

                if ($placeid != $geo_data["placeid"]){
                    $old_location = $this->create([
                        "short_name" => $geo_data["short_name"],
                        "long_name" => $geo_data["long_name"],
                        "placeid" => $placeid,
                        "lat" => $geo_data["lat"],
                        "lng" => $geo_data["lng"],
                        "timestamp" => time(),
                        "locale" => $locale
                    ]);

                    $old_location->save();
                }
            }
        }
    }
    
    public function ajaxAddShortNoLocale($placeid){ // с дифолтной англлийиской локализацией (на случай если добавление без авторизайи юзера)
        $locale = "en";
        
        $query = DB::createQuery()->select('id')->where('placeid = ? AND locale = ?'); 
        $places = $this->getList($query, [$placeid, $locale]);

        if (count($places) === 0){
            $geo_data = Geo::getForGoogleAC($placeid, $locale);
            
            if ($geo_data["short_name"] != null){
                $new_location = $this->create([
                    "short_name" => $geo_data["short_name"],
                    "long_name" => $geo_data["long_name"],
                    "placeid" => $geo_data["placeid"],
                    "lat" => $geo_data["lat"],
                    "lng" => $geo_data["lng"],
                    "timestamp" => time(),
                    "locale" => $locale
                ]);

                $new_location->save();

                if ($placeid != $geo_data["placeid"]){
                    $old_location = $this->create([
                        "short_name" => $geo_data["short_name"],
                        "long_name" => $geo_data["long_name"],
                        "placeid" => $placeid,
                        "lat" => $geo_data["lat"],
                        "lng" => $geo_data["lng"],
                        "timestamp" => time(),
                        "locale" => $locale
                    ]);

                    $old_location->save();
                }
            }
        }
    }
    
    public function ajaxAddBackend($placeids){
        global $defaults;
        
        $user_defaults = $defaults->loadByRow("user", $_SESSION["user"]);
        $locale = $user_defaults->locale;
        $decoded_placeids = json_decode($placeids);
        
        for ($i = 0; $i < count($decoded_placeids); $i++){
            $placeid = $decoded_placeids[$i];
            
            $query = DB::createQuery()->select('id')->where('placeid = ? AND locale = ?'); 
            $places = $this->getList($query, [$placeid, $locale]);

            if (count($places) === 0){
                $geo_data = Geo::getForGoogleAC($placeid, $locale);
                
                if ($geo_data["short_name"] != null){
                    $new_location = $this->create([
                        "short_name" => $geo_data["short_name"],
                        "long_name" => $geo_data["long_name"],
                        "placeid" => $geo_data["placeid"],
                        "lat" => $geo_data["lat"],
                        "lng" => $geo_data["lng"],
                        "timestamp" => time(),
                        "locale" => $locale
                    ]);

                    $new_location->save();

                    if ($placeid != $geo_data["placeid"]){
                        $old_location = $this->create([
                            "short_name" => $geo_data["short_name"],
                            "long_name" => $geo_data["long_name"],
                            "placeid" => $placeid,
                            "lat" => $geo_data["lat"],
                            "lng" => $geo_data["lng"],
                            "timestamp" => time(),
                            "locale" => $locale
                        ]);

                        $old_location->save();
                    }
                }
            }
        }
    }
    
    public function ajaxAddLatLng($lat, $lng, $placeid, $old_placeid){ // создает новый синоним и возвращает id
        //$existing_location = $this->loadByRow("placeid", $placeid);
        $query = DB::createQuery()->select('id')->where('placeid = ?'); 
        $places = $this->getList($query, [$placeid]);
        
        if (count($places) > 0){
            for ($i = 0; $i < count($places); $i++){
                $place = $this->load($places[$i]->id);
                $place->lat = floatval($lat);
                $place->lng = floatval($lng);

                $place->save();
            }
        }
        
        if ($placeid != $old_placeid){
            $old_query = DB::createQuery()->select('id')->where('placeid = ?'); 
            $old_places = $this->getList($old_query, [$old_placeid]);

            if (count($old_places) > 0){
                for ($i = 0; $i < count($old_places); $i++){
                    $old_place = $this->load($old_places[$i]->id);
                    $old_place->lat = floatval($lat);
                    $old_place->lng = floatval($lng);

                    $old_place->save();
                }
            }
        }
    }
    
    public static function getShortNameForGroup($placeid_array){
        global $defaults;
        $placeids_concated = "";
        $synonims_concated = "";
        
        for ($i = 0; $i < count($placeid_array); $i++){
            if (strlen($placeid_array[$i]) > 11){
                $placeids_concated .= '"'.$placeid_array[$i].'",';
            }
            elseif (strlen($placeid_array[$i]) > 0 && $placeid_array[$i] != "null" && $placeid_array[$i] != null){
                $synonims_concated .= '"'.$placeid_array[$i].'",';
            }
        }
        
        $placeids_concated_trimmed = rtrim($placeids_concated, ',');
        $synonims_concated_trimmed = rtrim($synonims_concated, ',');
        $places = [];
        $synonims = [];
        $places_synonims = [];
        
        if (strlen($placeids_concated_trimmed) > 0){
            $query = DB::createQuery()->select('placeid, short_name')->where('placeid IN ('.$placeids_concated_trimmed.') AND locale = ?'); 
            $places = self::getList($query, [$defaults->getLocale()]);
        
            $query2 = DB::createQuery()->select('place_id, text')->where('place_id IN ('.$placeids_concated_trimmed.')'); 
            $places_synonims = Synonim::getList($query2, null);
        }
        
        if (strlen($synonims_concated_trimmed) > 0){
            $query3 = DB::createQuery()->select('id, text')->where('id IN ('.$synonims_concated_trimmed.')'); 
            $synonims = Synonim::getList($query3, null);
        }
        
        if (count($places) > 0){
            return ["places" => $places, "synonims" => $synonims, "places_synonims" => $places_synonims];
        }
        else{
            return null;
        }
    }
    
    public function getShortName($placeid){ // проверяет наличие в базе
        //$locale = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        global $defaults;

        $query = DB::createQuery()->select('short_name')->where('placeid = ? AND locale = ?'); 
        $places = $this->getList($query, [strval($placeid), $defaults->getLocale()]);
        //$existing_location = $this->loadByRow("placeid", $placeid);
        
        $synonim = Synonim::loadByRow("place_id", strval($placeid));
        
        if (count($places) > 0){
            $places[0]->placeid = $placeid;
            $places[0]->synonim = $synonim != FALSE ? $synonim->text : null;
            
            return $places[0];
        }
        else{
            return $placeid;
        }
    }
    
    public static function staticGetLongName($placeid){
        $query = DB::createQuery()->select('long_name')->where('placeid = ? AND locale = "en" LIMIT 1'); 
        $places = self::getList($query, [strval($placeid)]);
       
        if (count($places) > 0){
            return $places[0]->long_name;
        }
        else{
            return -1;
        }
    }
    
    public static function getLongNameByLocale($placeid, $locale){ // проверяет наличие в базе
        $query = DB::createQuery()->select('long_name')->where('placeid = ? AND locale = ?'); 
        $places = self::getList($query, [strval($placeid), strval($locale)]);
        
        if (count($places) > 0){
            return $places[0]->long_name;
        }
        else{
            return FALSE;
        }
    }
    
    public static function getShortNameByLocale($placeid, $locale){ // проверяет наличие в базе
        $query = DB::createQuery()->select('short_name')->where('placeid = ? AND locale = ?'); 
        $places = self::getList($query, [strval($placeid), strval($locale)]);
        
        if (count($places) > 0){
            return $places[0]->short_name;
        }
        else{
            return FALSE;
        }
    }
    
    public static function getShortNameForAdmin($placeid){ // проверяет наличие в базе
        $query = DB::createQuery()->select('short_name')->where('placeid = ? AND locale = "en"'); 
        $places = self::getList($query, [strval($placeid)]);
        
        if (count($places) > 0){
            $places[0]->placeid = strval($placeid);
            return $places[0];
        }
        else{
            return FALSE;
        }
    }
    
    public static function getLatLngByPlaceId($placeid){
        $query = DB::createQuery()->select('lat, lng')->where('placeid = ? LIMIT 1'); 
        $places = self::getList($query, [strval($placeid)]);
        $response = [];
       
        if (count($places) > 0){
            $response["lat"] = $places[0]->lat;
            $response["lng"] = $places[0]->lng;
            
            return $response;
        }
        else{
            return null;
        }
    }
    
    public static function getPlaceIdByAddress($address){
        $response = null;
        $query = DB::createQuery()->select("placeid")->where("short_name LIKE ? OR long_name LIKE ? OR localized_name LIKE ?"); 
        $places = self::getList($query, [strval($address), strval($address), strval($address)]);
        
        if (count($places) > 0){
            $response = $places[0]->placeid;
        }
        
        return $response;
    }
    
    public static function getLatLngByAddress($address){
        $response = null;
        $query = DB::createQuery()->select("lat, lng")->where("short_name LIKE ? OR long_name LIKE ? OR localized_name LIKE ?"); 
        $places = self::getList($query, [strval($address), strval($address), strval($address)]);
        
        if (count($places) > 0){
            $response = [
                "lat" => $places[0]->lat,
                "lng" => $places[0]->lng
            ];
        }
        
        return $response;
    }
}
