<?php

use Database\TinyMVCDatabase as DB;

class Geo{
    public static function getForGoogleAC($place_id, $locale){ // отдает данные для базы автозапонения
        if (strlen($place_id) > 11){
            $api_key = GoogleApiKey::getOldestKey();
            /* logging maps */
            //Log::i("Geo.class.php, api_key", $api_key);
            /****************/
            $jsonUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=".$place_id."&language=".$locale."&key=".$api_key;

            $geocurl = curl_init();
            curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
            curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
            curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
            curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

            $geofile = curl_exec($geocurl);
            
            /* logging maps */
            //Log::i("Geo.class.php, getForGoogleAC(), place", $place_id);
            /****************/
            
            curl_close($geocurl);
            $decoded = json_decode($geofile, true);
            $response = [
                "placeid" => $decoded["result"]["place_id"],
                "short_name" => $decoded["result"]["name"],
                "long_name" => $decoded["result"]["formatted_address"],
                "lat" => $decoded["result"]["geometry"]["location"]["lat"],
                "lng" => $decoded["result"]["geometry"]["location"]["lng"]
            ];

            return $response;
        }
    }
    
    public static function getLatLngByAddress($address){ // отдает координаты на карте по полному адресу 
        $googleac_response = GoogleAC::getLatLngByAddress($address);
        
        if (isset($googleac_response)){
            /* logging maps */
            //Log::i("Geo.class.php, getLatLngByAddress(), geocode GOOGLEAC", json_encode($googleac_response));
            /****************/
            
            return $googleac_response;
        }
        else{
            $api_key = GoogleApiKey::getOldestKey();
            /* logging maps */
            //Log::i("Geo.class.php, api_key", $api_key);
            /****************/
            $jsonUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=".$api_key;
            $geocurl = curl_init();

            curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
            curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
            curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
            curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

            $geofile = curl_exec($geocurl);
            curl_close($geocurl);
            $decoded = json_decode($geofile, true);

            /* logging maps */
            //Log::i("Geo.class.php, getLatLngByAddress(), geocode RESPONSE", $address);
            //Log::i("Geo.class.php, getLatLngByAddress(), geocode RESPONSE", json_encode($decoded["results"][0]["geometry"]["location"]));
            /****************/
            
            $address_components = $decoded["results"][0]["address_components"];
            $new_address_short_name = $address_components[0]["long_name"];
            
            foreach ($address_components as $component) {
                if ($component["types"][0] == "route"){
                    $new_address_short_name = $component["long_name"];
                }
            }
            
            foreach ($address_components as $component) {
                if ($component["types"][0] == "street_number"){
                    $new_address_short_name .= " ".$component["long_name"];
                }
            }
            
            $new_address_long_name = $decoded["results"][0]["formatted_address"];
            $new_address_lat = $decoded["results"][0]["geometry"]["location"]["lat"];
            $new_address_lng = $decoded["results"][0]["geometry"]["location"]["lng"];
            $new_address_place_id = $decoded["results"][0]["place_id"];
            
            //Log::i("Geo.class.php, getLatLngByAddress(), geocode DUMP", json_encode($decoded["results"][0]));

            $googleac_save_response = GoogleAC::staticAddNotExisting(
                $new_address_short_name, 
                $new_address_long_name, 
                $new_address_lat, 
                $new_address_lng, 
                $new_address_place_id, 
                "en"
            );
            
            /* logging maps */
            //Log::i("Geo.class.php, getLatLngByAddress(), geocode SAVE", $googleac_save_response);
            /****************/

            return $decoded["results"][0]["geometry"]["location"];
        }
    }

    public static function getFullAddress($place_id){ // отдает полный адрес по place_id
        if (strlen($place_id) > 11){            
            $googleac_response = GoogleAC::staticGetLongName($place_id);
                    
            if ($googleac_response !== -1){ // если адрес есть в нашей базе, отдаем его
                /* logging maps */
                //Log::i("Geo.class.php, getFullAddress(), place GOOGLEAC", $googleac_response);
                /****************/
                
                return $googleac_response;
            }
            else{ // если нет - берем у гугла, пишем в нашу базу и отдаем
                $api_key = GoogleApiKey::getOldestKey();
                /* logging maps */
                //Log::i("Geo.class.php, api_key", $api_key);
                /****************/
                $jsonUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=".$place_id."&language=en&key=".$api_key;

                $geocurl = curl_init();
                curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
                curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
                curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
                curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

                $geofile = curl_exec($geocurl);
                curl_close($geocurl);
                $decoded = json_decode($geofile, true);
                
                /* logging maps */
                //Log::i("Geo.class.php, getFullAddress(), place", $place_id);
                //Log::i("Geo.class.php, getFullAddress(), place, RESPONSE", $decoded["result"]["formatted_address"]);
                /****************/
                
                $new_address_short_name = $decoded["result"]["address_components"][0]["long_name"];
                $new_address_long_name = $decoded["result"]["formatted_address"];
                $new_address_lat = $decoded["result"]["geometry"]["location"]["lat"];
                $new_address_lng = $decoded["result"]["geometry"]["location"]["lng"];
                $new_address_place_id = $decoded["result"]["place_id"];
                
                GoogleAC::staticAddNotExisting(
                    $new_address_short_name, 
                    $new_address_long_name, 
                    $new_address_lat, 
                    $new_address_lng, 
                    $new_address_place_id, 
                    "en"
                );
                
                return $decoded["result"]["formatted_address"];
            }
        }
        else{
            $synonim = Synonim::load(intval($place_id));
            
            return $synonim->text;
        }
    }
    
    public static function getTrueLocation($street, $house_number, $status){ // отдает коодинаты на карте зависимо от статуса недвиж. Если брокер или кооперация, то дает только координаты улицы
        if ($street == null){
            return null;
        }
        
        //Log::i("Geo.class.php, getTrueLocation()", $street);
        
        if ($status != 7 && $status != 5){
            $address_with_house_number = self::getAddressWithHouseNumber($house_number, Geo::getFullAddress($street));
            
            return Geo::getLatLngByAddress($address_with_house_number);
        }
        else{
            return Geo::getLatLngByAddress(Geo::getFullAddress($street));
        }
    }
    
    protected static function getAddressWithHouseNumber($house_number, $address){
        if (!isset($house_number)){
            return $address;
        }
        else{
            $address_exploded = explode(",", $address);
            $counter = 0;
            $address_with_house_number = "";

            foreach ($address_exploded as $address_part){
                if ($counter == 0){
                    $address_with_house_number .= $address_part." ".$house_number;
                }
                else{
                    $address_with_house_number .= ",".$address_part;
                }

                $counter++;
            }

            return $address_with_house_number;
        }
    }

    public static function getAddressForAllLocales($place_id){ // отдает адрес на всех языках системы
        $locales = ["en","he","fr","ru","el","es","it","de","pt","ar","da","nl","hu","tr","lt","sr","pl","fa","cs","ro","sv"];
        $response = [];
        
        for ($i = 0; $i < count($locales); $i++){
            $address = GoogleAC::getLongNameByLocale(strval($place_id), $locales[$i]);
            
            if ($address === FALSE){
                $params = [
                    "placeid" => $place_id,
                    "language" => $locales[$i],
                    "key" => "AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0"
                ];
                $api_key = GoogleApiKey::getOldestKey();
                /* logging maps */
                //Log::i("Geo.class.php, api_key", $api_key);
                /****************/
                $jsonUrl = "https://maps.googleapis.com/maps/api/place/details/json?".http_build_query($params)."&key=".$api_key;
                $geocurl = curl_init();
                curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
                curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
                curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
                curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

                $geofile = curl_exec($geocurl);
                
                /* logging maps */
                //Log::i("Geo.class.php, getAddressForAllLocales(), place", $place_id);
                /****************/
                
                curl_close($geocurl);
                $decoded = json_decode($geofile, true);

                array_push($response, $decoded["result"]["address_components"][0]["long_name"]);
                
                GoogleAC::staticAddNotExisting(
                    $decoded["result"]["address_components"][0]["short_name"], 
                    $decoded["result"]["address_components"][0]["long_name"], 
                    $decoded["result"]["geometry"]["location"]["lat"], 
                    $decoded["result"]["geometry"]["location"]["lng"], 
                    $place_id, 
                    $locales[$i]
                );
            }
            else{
                array_push($response, $address);
            }
        }
        
        return $response;
    }
    
    public static function getFullByPlaceid($place_id){ // отдает поллную инфу по месту на основе place_id 
        $api_key = GoogleApiKey::getOldestKey();
        /* logging maps */
        //Log::i("Geo.class.php, api_key", $api_key);
        /****************/
        $jsonUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=".$place_id."&language=en&key=".$api_key;

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        
        /* logging maps */
        //Log::i("Geo.class.php, getFullByPlaceid(), place", $place_id);
        /****************/
        
        curl_close($geocurl);
        $decoded = json_decode($geofile, true);

        return $decoded["result"];
    }
    
    public static function getAddressByLatLng($lat, $lng, $locale){ // отдает адрес по коодинатам (обартно getLatLngByAddress)
        $api_key = GoogleApiKey::getOldestKey();
        /* logging maps */
        //Log::i("Geo.class.php, api_key", $api_key);
        /****************/
        $jsonUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=".urlencode($lat).",".urlencode($lng)."&language=".urlencode($locale)."&key=".$api_key;

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        
        /* logging maps */
        //Log::i("Geo.class.php, getAddressByLatLng(), geocode", $lat.", ".$lng.", ".$locale);
        /****************/
        
        curl_close($geofile);
        $decoded = json_decode($geofile, true);

        return $decoded["results"];
    }
    
    public static function containsLocation($contour, $lat, $lng){ // определяет, попала ли точка в полигон
        $contour_decoded = json_decode($contour, true);
        $polySides = count($contour_decoded);
        $polyX = [];
        $polyY = [];

        for ($i = 0; $i < count($contour_decoded); $i++){
            array_push($polyX, $contour_decoded[$i]["lat"]);
            array_push($polyY, $contour_decoded[$i]["lng"]);
        }

        $x = $lat;
        $y = $lng;

        $j = $polySides-1 ;
        $oddNodes = 0;

        for ($i=0; $i<$polySides; $i++) {
            if ($polyY[$i]<$y && $polyY[$j]>=$y ||  $polyY[$j]<$y && $polyY[$i]>=$y){
                if ($polyX[$i]+($y-$polyY[$i])/($polyY[$j]-$polyY[$i])*($polyX[$j]-$polyX[$i])<$x){
                    $oddNodes=!$oddNodes;
                }
            }

            $j=$i; 
        }

        return $oddNodes; 
    }
    
    public function getPlaceIdByAddress($address){ // отдает place_id по полному адресу, предварительно проверив адрес в нашей базе
        $googleac_response = GoogleAC::getPlaceIdByAddress($address);
        
        if (isset($googleac_response)){
            /* logging maps */
            //Log::i("Geo.class.php, getPlaceIdByAddress(), geocode GOOGLEAC", $googleac_response);
            /****************/
            
            return $googleac_response;
        }
        else{
            $api_key = GoogleApiKey::getOldestKey();
            /* logging maps */
            //Log::i("Geo.class.php, api_key", $api_key);
            /****************/
            $jsonUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=".$api_key;
            $geocurl = curl_init();
            
            curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
            curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
            curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
            curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

            $geofile = curl_exec($geocurl);
            curl_close($geofile);
            $decoded = json_decode($geofile, true);
            
            /* logging maps */
            //Log::i("Geo.class.php, getPlaceIdByAddress(), geocode ADDRESS", $address);
            //Log::i("Geo.class.php, getPlaceIdByAddress(), geocode RESPONSE", $decoded["results"][0]["place_id"]);
            /****************/
            
            $address_components = $decoded["results"][0]["address_components"];
            $new_address_short_name = $address_components[0]["long_name"];
            
            foreach ($address_components as $component) {
                if ($component["types"][0] == "route"){
                    $new_address_short_name = $component["long_name"];
                }
            }
            
            foreach ($address_components as $component) {
                if ($component["types"][0] == "street_number"){
                    $new_address_short_name .= " ".$component["long_name"];
                }
            }
            
            $new_address_long_name = $decoded["results"][0]["formatted_address"];
            $new_address_lat = $decoded["results"][0]["geometry"]["location"]["lat"];
            $new_address_lng = $decoded["results"][0]["geometry"]["location"]["lng"];
            $new_address_place_id = $decoded["results"][0]["place_id"];

            GoogleAC::staticAddNotExistingWithLocalized(
                $new_address_short_name, 
                $new_address_long_name,
                $address,
                $new_address_lat, 
                $new_address_lng, 
                $new_address_place_id, 
                "en"
            );
            
            return $decoded["results"][0]["place_id"];
        }
    }
}