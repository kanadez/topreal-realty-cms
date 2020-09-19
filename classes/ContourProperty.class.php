<?php

use Database\TinyMVCDatabase as DB;

class ContourProperty extends Database\TinyMVCDatabaseObject{
    const tablename  = 'contour_property';
    
    public static function addByProperty($property_id){
        $property = Property::load($property_id);
        $no_city_pre_contours = Contour::getNoCityPreContoursList();
        
        foreach ($no_city_pre_contours as $contour){
            if (
                $property->lat != null &&
                $property->lng != null &&
                $property->lat > 0 &&
                $property->lng > 0 &&
                self::containsLocation($contour->data, $property->lat, $property->lng)
            ){
                $existing_query = DB::createQuery()->select('id')->where("contour = ? AND property = ?");
                $existing = self::getList($existing_query, [$contour->id, $property_id]);
                
                if (count($existing) == 0){
                    $new_data = [
                        "contour"   => $contour->id,
                        "property"  => $property_id,
                        "timestamp" => time()
                    ];

                    $new = self::create($new_data);
                    $new->save();
                    
                    //echo $property->id."\n";
                }
            }
        }
    }
    
    public static function addByContour($contour_id){
        $contour = Contour::load($contour_id);
        
        $processed_query = DB::createQuery()->select('id')
                ->where("contour = ?");
        $processed = ContourPropertyProcessed::getList($processed_query, [$contour_id]);
        
        if (count($processed) > 0){
            return FALSE;
        }
        
        $properties_query = DB::createQuery()->select('id, lat, lng')
                ->where("deleted = 0 AND temporary = 0")
                ->order("last_updated DESC");
        $all_properties = Property::getList($properties_query);
        
        foreach ($all_properties as $property){
            if (
                $property->lat != null &&
                $property->lng != null &&
                $property->lat > 0 &&
                $property->lng > 0 &&
                self::containsLocation($contour->data, $property->lat, $property->lng)
            ){
                $existing_query = DB::createQuery()->select('id')->where("contour = ? AND property = ?");
                $existing = self::getList($existing_query, [$contour_id, $property->id]);
                
                if (count($existing) == 0){
                    $new_data = [
                        "contour"   => $contour_id,
                        "property"  => $property->id,
                        "timestamp" => time()
                    ];

                    $new = self::create($new_data);
                    $new->save();
                    
                    //echo $property->id."\n";
                }
            }
        }
        
        ContourPropertyProcessed::create([
            "contour"   => $contour_id,
            "timestamp" => time()
        ]);
    }
    
    public static function updateAllByContours(){
        $no_city_pre_contours = Contour::getNoCityPreContoursList();
        
        foreach ($no_city_pre_contours as $contour){
            self::addByContour($contour->id);
        }
    }

    public static function getPropertiesByContour($contour_id){
        $properties_query = DB::createQuery()->select('property')
                ->where("contour = ?")
                ->order("timestamp DESC");
        $properties = self::getList($properties_query, [$contour_id]);
        
        return $properties;
    }

    private static function containsLocation($contour, $lat, $lng){ // определяет, попала ли точка в полигон
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
}
