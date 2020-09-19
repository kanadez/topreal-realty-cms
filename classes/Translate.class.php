<?php

class Translate{ // класс системы гео-синонимов
    protected $languages = [
        "iw" => [
            "description" => [
                "title" => "hebrew"
            ],
            "locations" => [
                "ChIJi8mnMiRJABURuiw1EyBCa2o"
            ]
        ],
        "ru" => [
            "description" => [
                "title" => "russian"
            ],
            "locations" => [
                "ChIJ-yRniZpWPEURE_YRZvj9CRQ"
            ]
        ]
    ];
    
    protected $countries = [
        "ChIJi8mnMiRJABURuiw1EyBCa2o" => "iw",
        "ChIJ-yRniZpWPEURE_YRZvj9CRQ" => "ru"
    ];

    public function checkLanguage($string){ // ищет все синониы, подходящие под запрос $query
        global $agency;
        
        $params = [
            "q" => strval($string),
            "key" => "AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0"
        ];
        $jsonUrl = "https://translation.googleapis.com/language/translate/v2/detect?".http_build_query($params);
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $jsonUrl);
        curl_setopt($curl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($curl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $response = curl_exec($curl);
        curl_close($curl);
        $decoded = json_decode($response, true);
        $location_coincides = FALSE;
        
        for ($i = 0; $i < count($this->languages[$decoded["data"]["detections"][0][0]["language"]]["locations"]); $i++){
            if ($this->languages[$decoded["data"]["detections"][0][0]["language"]]["locations"][$i] == $agency->getCountry()){
                $location_coincides = TRUE;
            }
        }
        
        return [$location_coincides, !$location_coincides ? $this->countries[$agency->getCountry()] : null];
    }
}
