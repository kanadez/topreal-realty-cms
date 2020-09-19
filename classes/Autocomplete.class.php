<?php

use Database\TinyMVCDatabase as DB;

class Autocomplete extends Database\TinyMVCDatabaseObject{ // класс системы гео-синонимов
    const tablename  = 'synonim';
    
    public function search($search_query, $latlng, $types, $locale, $place_city, $place_city_text){ // ищет все синониы, подходящие под запрос $query
        if ($latlng != null){
            $latlng_decoded = json_decode(strval($latlng), true);
        }
        else{
            $latlng_decoded = GoogleAC::getLatLngByPlaceId($place_city);
        }
        
        $params = [
            "radius" => 6000,
            "types" => $types,
            "location" => $latlng_decoded["lat"].",".$latlng_decoded["lng"],
            "input" => $search_query,
            "language" => $locale,
            "key" => "AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0"
        ];
        $jsonUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json?".http_build_query($params);

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        
        /* logging maps */
        Log::i("Autocomplete.class.php, search(), place", $search_query);
        /****************/
        
        curl_close($geofile);
        $decoded = json_decode($geofile, true);
        $synonims = [];
        
        for ($i = 0; $i < count($decoded["predictions"]); $i++){
            $googleac_long_name = GoogleAC::staticGetLongName($decoded["predictions"][$i]["place_id"]);
            
            $query = DB::createQuery()->select('id, text')->where('place_id = ? OR place_fulltext = ? OR place_fulltext = ?')->order("timestamp LIMIT 1"); 
            $response = $this->getList($query, [$decoded["predictions"][$i]["place_id"], $decoded["predictions"][$i]["description"], $googleac_long_name]);
            array_push($synonims, $response[0]);
        }
        
        $query = DB::createQuery()->select('id, text, place_id, place_text, place_fulltext, place_city, place_city_text')->where('text LIKE ? AND (place_city = ? OR place_city_text = ?)')->order("timestamp DESC LIMIT 5"); 
        $response = $this->getList($query, ["%".$search_query."%", $place_city, $place_city_text]);

        for ($z = 0; $z < count($response); $z++){
            $location = [
                "description" => $response[$z]->place_fulltext,
                "place_id" => $response[$z]->place_id,
                "structured_formatting" => [
                    "main_text" => $response[$z]->place_text,
                    "secondary_text" => $response[$z]->place_city_text
                ],
                "terms" => [
                    [
                        "value" => $response[$z]->place_text
                    ],
                    [
                        "value" => $response[$z]->place_city_text
                    ]
                ]
            ];

            array_push($decoded["predictions"], $location);
            
            $synonim = [
                "id" => $response[$z]->id,
                "text" => $response[$z]->text
            ];
            
            array_push($synonims, $synonim);
        }
        
        return [$decoded, $synonims];
    }
    
    public function get($id, $type){ // берет и отдает клиент один синоним по id
        $synonim = $this->load(intval($id));
        return ["id" => $synonim->id, "text" => $synonim->text, "type" => strval($type)];
    }

    public function createNew($text){ // создает новый синоним и возвращает id
        global $agency;
        
        $new_synonim = $this->create([
            "author" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "text" => strval($text),
            "timestamp" => time()
        ]);
        return $new_synonim->save();
    }
}
