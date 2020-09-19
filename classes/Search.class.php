<?php

include(dirname(__FILE__).'/Search.data.php');

use Database\TinyMVCDatabase as DB;

class Search extends Database\TinyMVCDatabaseObject{
    const tablename  = 'search';
    protected $is_empty = false;
    
    public function restore($id){
        $search_id = intval($id);    
	$search = $this->load($search_id);
        
        if ($search->default_search == 0){
            $search->deleted = 0;
        }
        
        return $search->save();            
    }
    
    public function delete($id){
        $search_id = intval($id);    
	$search = $this->load($search_id);
        
        if ($search->default_search == 0){
            $search->deleted = 1;
        }
        
        return $search->save();            
    }
    
    public function updateTitle($id, $title){
        $search_id = intval($id);    
	$search = $this->load($search_id);
        
        if ($search->default_search == 0){
            $search->title = strval($title);
        }
        
        return ["id" => $search->save(), "title" => strval($title)];            
    }
    
    public function update($search_id, $search_data){
        global $synonim;
        
        $object = json_decode($search_data, true);
        $search = $this->load(intval($search_id));
        $search_array = get_object_vars($search);
            
        if ($search_array["default_search"] == 1 && $search_array["author"] == $_SESSION["user"]){
            unset($search_array["id"]);
            $search_array["default_search"] = 0;
            $search = $this->create($search_array);    
        }
        
        foreach ($object as $key => $val) {
            if (is_array($val)){
                $val = json_encode($val);
            }
            
            $search->$key = $val;
        }
        
        if ($search->street != null){
            $street_decoded = json_decode($search->street);
            $street_text = [];

            for ($i = 0; $i < count($street_decoded); $i++){
                array_push($street_text, Geo::getFullAddress($street_decoded[$i]));
            }
            
            $search->street_text = json_encode($street_text, JSON_UNESCAPED_UNICODE);
        }
        
        $search->neighborhood_text = $search->neighborhood != null ? Geo::getFullAddress($search->neighborhood) : "";
        $search->city_text = $search->city != null ? Geo::getFullAddress($search->city) : "";
        $search->country_text = $search->country != null ? Geo::getFullAddress($search->country) : "";
        $search->timestamp = time();
        
        return $search->save();            
    }
    
    public function set($search_id, $search_data){
        global $synonim;
        
        $search_id = intval($search_id);
        $object = json_decode($search_data, true);       
	$search = $this->load($search_id);
        //$this->toggleStock($search->stock);
        
        try{
            if ($search->default_search == 1 && $search->author != $_SESSION["user"]){
                throw new Exception("Editing foreign default searches forbidden!", 501);
            }
            
            if ($search->default_search == 1 && $search->author == $_SESSION["user"]){ //  пересчитываем интервал для history_select
                if ($object["history_from"] == null && $object["history_to"] == null){
                    $object["history_interval"] = null;
                }
                elseif ($object["history_from"] != null && $object["history_to"] == null){
                    $object["history_interval"] = time() - $object["history_from"];
                }
                elseif ($object["history_from"] == null && $object["history_to"] != null){
                    $object["history_interval"] = $object["history_to"];
                }
                else{
                    $object["history_interval"] = $object["history_to"] - $object["history_from"];
                }
            }
            
            foreach ($object as $key => $val) {
                if (is_array($val)){
                    $val = json_encode($val);
                }
                
                $search->$key = $val;
            }

            if ($search->street != null){
                $street_decoded = json_decode($search->street);
                $street_text = [];

                for ($i = 0; $i < count($street_decoded); $i++){
                    array_push($street_text, Geo::getFullAddress($street_decoded[$i]));
                }

                $search->street_text = json_encode($street_text, JSON_UNESCAPED_UNICODE);
            }

            $search->neighborhood_text = $search->neighborhood != null ? Geo::getFullAddress($search->neighborhood) : "";
            $search->city_text = $search->city != null ? Geo::getFullAddress($search->city) : "";
            $search->country_text = $search->country != null ? Geo::getFullAddress($search->country) : "";
            $search->timestamp = time();
            $search->temporary = 0; 
            $response = $search->save();
        }            
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function createNew($search_id, $search_data){
        global $synonim, $defaults;
        
        $search_id = intval($search_id);
        $object = json_decode($search_data, true);       
	$search = $this->load($search_id);
        $agent_defaults = $defaults->get();
        
        foreach ($object as $key => $val) {
            if (is_array($val))
                $val = json_encode($val);
            
            $search->$key = $val;
        }
        
        if ($search->street != null){
            $street_decoded = json_decode($search->street);
            $street_text = [];

            for ($i = 0; $i < count($street_decoded); $i++){
                array_push($street_text, Geo::getFullAddress($street_decoded[$i]));
            }
            
            $search->street_text = json_encode($street_text, JSON_UNESCAPED_UNICODE);
        }
        
        $search->neighborhood_text = $search->neighborhood != null ? Geo::getFullAddress($search->neighborhood) : "";
        $search->city_text = $search->city != null ? Geo::getFullAddress($search->city) : "";
        $search->country_text = $search->country != null ? Geo::getFullAddress($search->country) : "";
        $search->timestamp = time();
        //$this->toggleStock($search->stock);
        //$search->temporary = 0; 
        return $search->save();            
    }
    
    public function createTemporary(){
        global $agency;
        
        $new_search = $this->create(["author" => $_SESSION["user"], "agency" => $agency->getId()]);
        return $new_search->save();
    }
    
    public function getQueryFormOptions(){ // берет из базы дефолтные опции для формы поиска
        global $query_form_data;
        $query_form_data["currency"] = Currency::getList();
        $query_form_data["dimension"] = Dimensions::getList();
        return $query_form_data;
    }
    
    public function getSearchesList(){
        $query = DB::createQuery()->select('id,title,author,default_search')->where("temporary = 0 AND default_search <> 1 AND deleted = 0 AND author = ?")->order("timestamp DESC"); 
        return $this->getList($query, [$_SESSION["user"]]);
    }
    
    public function get($search_id){ // данная функция будет по ID объекта поиска вытаскивать его из базы и отдавать
        $search = $this->load(intval($search_id));
        $search_array = get_object_vars($search);
            
        if ($search_array["default_search"] == 1 && $search_array["author"] != $_SESSION["user"]){
            unset($search_array["id"]);
            $search_array["default_search"] = 0;
            $new_search = $this->create($search_array);
            $new_search->save();
            $search = $new_search;
        }
        
        return $search;
    }
    
    public function queryEmpty(){
        global $defaults;
        
        $this->is_empty = true;
        $agent_defaults = $defaults->get();
        return $this->query($agent_defaults->search, 1);
    }
    
    public function query($search_id, $for_empty_search = null){
        global $agency, $currency, $dimensions, $utils, $defaults, $stock;
        
        $search_id = intval($search_id);
        $search = $this->load($search_id);    
        $object = get_object_vars($search);
        $query_response_limit = isset($search->contour) ? 25000 : 300;
        //$this->toggleStock($search->stock);
        $agent_defaults = $defaults->get();
        
        try{
            if (!is_array($object))
                throw new Exception("Wrong query parameters", 500);
            
            if ($search->type == 1){ // обычный поиск (не Special)
                $search->special_by = null;
                $search->special_argument = null;
                $search->save();
                
                if ($search->ascription == 0 || $search->ascription == 1){ // поиск по недвижимости
                    $parsed = $this->parseSearchForProperty($object);
                    // берем всю свою (и сток и не сток):
                    $query = DB::createQuery()->select('*')->where("stock = 0 AND deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order('last_updated DESC LIMIT '.$query_response_limit);
                    $property_list = Property::getList($query, $parsed["parameters"]);
                    // и проекции стока:
                    $query = DB::createQuery()->select('*')->where("deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order('last_updated DESC LIMIT '.$query_response_limit);
                    $stock_changed_properties = $stock->getList($query, $parsed["parameters"]); // выбрали по запросу
                    
                    for ($i = 0; $i < count($stock_changed_properties); $i++){
                        $stock_changed_properties[$i]->id = $stock_changed_properties[$i]->stock_id;
                        
                        for ($z = 0; $z < count($property_list); $z++){
                            if ($stock_changed_properties[$i]->id == $property_list[$z]->id){
                                array_splice($property_list, $z, 1);
                            }
                        }
                    }
                    
                    if ($search->external != null && $agency->getExternalStatus() == 1 && $agency->getId() == 1){ // поиск по внешним, только для первого агентства
                        $parsed_external = $this->parseSearchForPropertyExternal($object);
                        // затем собранное внешним коллектором:
                        $query_external = DB::createQuery()->select('*')->where("deleted = 0 AND stock_id IS NULL ".$parsed_external["query"])->order("last_updated DESC LIMIT ".$query_response_limit);
                        $property_external_list = PropertyExternal::getList($query_external, $parsed_external["parameters"]);
                        $property_list = array_merge($property_external_list, $property_list, $stock_changed_properties);
                    }
                    else{
                        $property_list = array_merge($property_list, $stock_changed_properties);
                    }

                    //$property_list = array_merge($property_list, $stock_changed_properties);
                    // теперь берем все существ. стоки, если это включено(и оплачено):
                    if ($search->stock == 1){
                        $query = DB::createQuery()->select('*')->where("stock = 1 AND deleted = 0 AND temporary = 0 AND agency <> ".$agency->getId()." ".$parsed["query"])->order('last_updated DESC LIMIT '.$query_response_limit);
                        $stock_list = Property::getList($query, $parsed["parameters"]);
                        
                        for ($i = 0; $i < count($stock_list); $i++){
                            for ($z = 0; $z < count($property_list); $z++){
                                if ($stock_list[$i]->id == $property_list[$z]->id){
                                    array_splice($stock_list, $i, 1);
                                }
                            }
                        }
                        
                        $property_list = array_merge($property_list, $stock_list);
                    }
                    
                    $property_types = json_decode($object["property"]);
                    $property_streets = json_decode($object["street"]);
                    $property_streets_text = json_decode($object["street_text"]);
                    $search_contour = $object["contour"];
                    $property_parsed = [];
                    $debuga = [];
                    
                    // ##################################### начало отсева по типам ###############################//
                    
                    if ($search->property != null){
                        for ($i = 0; $i < count($property_list); $i++){ // отсев по типам (обязательно)
                            $types_fit = 0;
                            $tmp_object = get_object_vars($property_list[$i]);
                            $tmp_property_types = json_decode($tmp_object["types"]);

                            for ($z = 0; $z < count($tmp_property_types); $z++){
                                $type = $tmp_property_types[$z];

                                for ($c = 0; $c < count($property_types); $c++){
                                    if ($property_types[$c] == $type){
                                        $types_fit++;
                                    }
                                }
                            }

                            if ($types_fit > 0){
                                array_push($property_parsed, $property_list[$i]);
                            }
                        }
                        
                        $property_list = [];
                    }
                    
                    // ##################################### конец отсева по типам ################################//
                            
                    if (($search->price_from != null || $search->price_to != null) && $search->currency != null){ // поиск по цене (с конвертацией валюты)
                        $ratio1 = $currency->getRatio($search->currency);
                        $property_list1 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list1) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list1); $i++){
                                $price = $property_list1[$i]->price;
                                $ratio2 = $currency->getRatio($property_list1[$i]->currency_id);
                                $price_converted = round($price/$ratio2*$ratio1);
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);

                                if (
                                        ($search->price_from != null && 
                                        $search->price_to != null && 
                                        $search->price_from <= $price_converted && 
                                        $search->price_to >= $price_converted) ||
                                        ($search->price_from != null &&
                                        $search->price_to == null &&
                                        $search->price_from <= $price_converted) ||
                                        ($search->price_to != null &&
                                        $search->price_from == null &&
                                        $search->price_to >= $price_converted)
                                ){
                                    array_push($property_parsed, $property_list1[$i]);
                                }
                            }
                            
                            $property_list = [];
                        }
                    }
                    
                    if (($search->object_size_from != null || $search->object_size_to != null) && $search->object_dimensions != null){ // поиск по dimensions (с конвертацией)
                        $ratio1 = $dimensions->getRatio($search->object_dimensions);
                        $property_list2 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list2) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list2); $i++){
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);
                                if ($search->object_type == 1){
                                    $home_size = $property_list2[$i]->home_size;
                                    $home_ratio2 = $dimensions->getRatio($property_list2[$i]->home_dims);
                                    $home_size_converted = round($home_size/$ratio1*$home_ratio2);
                                    //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);
                                    
                                    if (
                                            ($search->object_size_from != null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_from <= $home_size_converted && 
                                            $search->object_size_to >= $home_size_converted) ||
                                            ($search->object_size_from != null &&
                                            $search->object_size_to == null &&
                                            $search->object_size_from <= $home_size_converted) ||
                                            ($search->object_size_from == null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_to >= $home_size_converted) &&
                                            $home_size != null
                                        ){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }elseif ($search->object_type == 2){
                                    $lot_size = $property_list2[$i]->lot_size;
                                    $lot_ratio2 = $dimensions->getRatio($property_list2[$i]->lot_dims);
                                    $lot_size_converted = round($lot_size/$ratio1*$lot_ratio2);
                                    //array_push($debuga, ["lot_size_from" => $search->object_size_from, "lot_size" => $lot_size, "lot_size_converted" => $lot_size_converted, "lot_dimension" => $property_list2[$i]->lot_dims]);
                                    
                                    if (
                                            ($search->object_size_from != null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_from <= $lot_size_converted && 
                                            $search->object_size_to >= $lot_size_converted) ||
                                            ($search->object_size_from != null &&
                                            $search->object_size_to == null &&
                                            $search->object_size_from <= $lot_size_converted) ||
                                            ($search->object_size_from == null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_to >= $lot_size_converted) &&
                                            $lot_size != null
                                        ){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }
                            }
                            
                            //if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }
                    
                    /*if ($search->history_type == 2 || $search->history_type == 3 || $search->history_type == 4){ // поиск по событиям совы
                        if ($search->history_type == 2){
                            $event_type1 = "call-in";
                            $event_type2 = "call-out";
                        }
                        elseif ($search->history_type == 3){
                            $event_type1 = "email-in";
                            $event_type2 = "email-out";
                        }
                        elseif ($search->history_type == 4){
                            $event_type1 = "sms-in";
                            $event_type2 = "sms-out";
                        }
                        
                        
                        $property_list3 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list3) > 0){
                            $property_parsed = [];
                            $query = DB::createQuery()->select('card')->where("agency = ? AND subject_type = 'property' AND (event_type = ? OR event_type = ?) AND timestamp BETWEEN ? AND ?");
                            $owl_list = Owl::getList($query, [$agency->getId(), $event_type1, $event_type2, $search->history_from, $search->history_to]);
                            //return $owl_list;
                            if (count($owl_list) > 0){
                                for ($i = 0; $i < count($owl_list); $i++){
                                    for ($z = 0; $z < count($property_list3); $z++){
                                        if ($property_list3[$z]->id == $owl_list[$i]->card){
                                            array_push($property_parsed, $property_list3[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $property_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }
                    
                    if ($search->history_type == 5){ // поиск по "предложено"
                        $property_list4 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list4) > 0){
                            $property_parsed = [];
                            $query = DB::createQuery()->select('property')->where("deleted = 0 AND agency = ? AND timestamp BETWEEN ? AND ?");
                            $proposed_list = Propose::getList($query, [$agency->getId(), $search->history_from, $search->history_to]);
                            //return $proposed_list;

                            if (count($proposed_list) > 0){
                                for ($i = 0; $i < count($proposed_list); $i++){
                                    for ($z = 0; $z < count($property_list4); $z++){
                                        if ($property_list4[$z]->id == $proposed_list[$i]->property){
                                            array_push($property_parsed, $property_list4[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $property_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $property_list = [];
                        } 
                    }*/
                    
                    if (
                            $search->history_type == 2 || 
                            $search->history_type == 3 || 
                            $search->history_type == 4 ||
                            $search->history_type == 5 ||
                            $search->history_type == 6 ||
                            $search->history_type == 7
                    ){ // поиск по действиям компарижна
                        $condition_id = $search->history_type-1;
                        $property_list3 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list3) > 0){
                            $property_parsed = [];
                            $history_to = $search->history_to == 0 || $search->history_to == null ? time() : $search->history_to+86400;
                            $query = DB::createQuery()->select('property')->where("agency = ? AND event = 'condition_change' AND current_state = ? AND timestamp BETWEEN ? AND ?");
                            $comparison_list = ClientComparison::getList($query, [$agency->getId(), $condition_id, $search->history_from, $history_to]);
                            //return $owl_list;
                            if (count($comparison_list) > 0){
                                for ($i = 0; $i < count($comparison_list); $i++){
                                    for ($z = 0; $z < count($property_list3); $z++){
                                        if ($property_list3[$z]->id == $comparison_list[$i]->property){
                                            array_push($property_parsed, $property_list3[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $property_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }
                    
                    if ($search->street != null){
                        $property_list5 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list5) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list5); $i++){ // отсев по типам (обязательно)
                                $street_fits = 0;
                                $tmp_object = get_object_vars($property_list5[$i]);
                                $tmp_property_street = $tmp_object["street"];
                                $tmp_property_street_text = $tmp_object["street_text"];
                                
                                if (count($property_streets) > 0 && $search_contour == null){ //  проверка на наличие улиц в клиенте вообще
                                    for ($m = 0; $m < count($property_streets); $m++){
                                        if ($tmp_property_street == $property_streets[$m] || Utils::isStringsSimilar($tmp_property_street_text, $property_streets_text[$m])){
                                            $street_fits++;
                                        }
                                    }
                                }
                                else{ // если улиц нет и/или задан контур
                                    $street_fits++;
                                }

                                if ($street_fits > 0){
                                    array_push($property_parsed, $property_list5[$i]);
                                }
                            }

                            $property_list = [];
                        }
                    }
                    
                    $reduced_duplicates = count($property_parsed) > 0 ? $utils->removeDuplicatesFromAssocArray($property_parsed, "id") : $utils->removeDuplicatesFromAssocArray($property_list, "id");
                    
                    //if (count($reduced_duplicates) > 200){ // срезаем массив до 200 элементо в если их больше
                    //    $reduced_duplicates = array_slice($reduced_duplicates, 0, 200);
                    //}
                    
                    for ($i = 0; $i < count($reduced_duplicates); $i++){ // разделение по своим и чужим стокам
                        if ($reduced_duplicates[$i]->stock == 1 && $reduced_duplicates[$i]->agency != $agency->getId()){
                            $reduced_duplicates[$i]->foreign_stock = 1;
                        }
                        else{
                            $reduced_duplicates[$i]->foreign_stock = 0;
                        }
                        
                        $ratio1 = $currency->getRatio(0);
                        $price = $reduced_duplicates[$i]->price;
                        $ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                        $reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                    }
                    
                    $response = [
                        "conditions" => $object,
                        "properties" => $reduced_duplicates,//count($property_parsed) > 0 ? $property_parsed : $property_list,//$debuga,
                        "clients" => []
                    ];
                }
                else if ($search->ascription == 2 || $search->ascription == 3){ // поиск по клиентам
                    $parsed = $this->parseSearchForClient($object);
                    $query = DB::createQuery()->select('*')->where("deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order('last_updated DESC'); 
                    $client_list = Client::getList($query, $parsed["parameters"]);
                    $client_parsed = [];
                    $debuga = [];
                            
                    if (($search->price_from != null || $search->price_to != null) && $search->currency != null){ // поиск по цене (с конвертацией валюты)
                        $ratio1 = $currency->getRatio($search->currency);
                        
                        for ($i = 0; $i < count($client_list); $i++){
                            $price_from = $client_list[$i]->price_from;
                            $price_to = $client_list[$i]->price_to;
                            $ratio2 = $currency->getRatio($client_list[$i]->currency_id);
                            $price_from_converted = round($price_from/$ratio2*$ratio1);
                            $price_to_converted = round($price_to/$ratio2*$ratio1);
                            //return $price_converted;
                            //array_push($debuga, ["price_from" => $search->price_from, "price" => $price_from, "price_converted" => $price_from_converted, "currency" => $property_list[$i]->currency_id]);
                            
                            if (
                                    ($search->price_to != null &&
                                    $search->price_from != null &&
                                    $search->price_from <= $price_from_converted && 
                                    $search->price_to >= $price_to_converted) ||
                                    ($search->price_to == null &&
                                    $search->price_from != null &&
                                    $search->price_from <= $price_from_converted) ||
                                    ($search->price_to != null &&
                                    $search->price_from == null &&
                                    $search->price_to >= $price_to_converted)
                                )
                                {
                                array_push($client_parsed, $client_list[$i]);
                            }
                        }
                        
                        $client_list = [];
                    }
                    
                    /*if ($search->object_size_from != null && $search->object_size_to != null && $search->object_dimensions != null){ // поиск по размерам дома и участка для клиента, надо дорабатывать
                        $ratio1 = $dimensions->getRatio($search->object_dimensions);
                        $client_list2 = count($client_parsed) > 0 ? $client_parsed : $client_list;
                        
                        if (count($client_list2) > 0){
                            $client_parsed = [];
                            
                            for ($i = 0; $i < count($client_list2); $i++){
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);
                                if ($search->object_type == 1){
                                    $home_size = $client_list2[$i]->home_size;
                                    $home_ratio2 = $dimensions->getRatio($property_list2[$i]->home_dims);
                                    $home_size_converted = round($home_size/$ratio1*$home_ratio2);
                                    //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);
                                    
                                    if ($search->object_size_from <= $home_size_converted && $search->object_size_to >= $home_size_converted){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }elseif ($search->object_type == 2){
                                    $lot_size = $property_list2[$i]->lot_size;
                                    $lot_ratio2 = $dimensions->getRatio($property_list2[$i]->lot_dims);
                                    $lot_size_converted = round($lot_size/$ratio1*$lot_ratio2);
                                    //array_push($debuga, ["lot_size_from" => $search->object_size_from, "lot_size" => $lot_size, "lot_size_converted" => $lot_size_converted, "lot_dimension" => $property_list2[$i]->lot_dims]);
                                    
                                    if ($search->object_size_from <= $lot_size_converted && $search->object_size_to >= $lot_size_converted){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }
                            }
                            
                            if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }*/
                    
                    /*if ($search->history_type == 2 || $search->history_type == 3 || $search->history_type == 4){ // поиск по событиям совы для клиента, надо дорабатывать
                        if ($search->history_type == 2){
                            $event_type1 = "call-in";
                            $event_type2 = "call-out";
                        }
                        elseif ($search->history_type == 3){
                            $event_type1 = "email-in";
                            $event_type2 = "email-out";
                        }
                        elseif ($search->history_type == 4){
                            $event_type1 = "sms-in";
                            $event_type2 = "sms-out";
                        }
                        
                        $client_list3 = count($client_parsed) > 0 ? $client_parsed : $client_list;
                        
                        if (count($client_list3) > 0){
                            $client_parsed = [];
                            
                            if ($search->history_from != null && $search->history_to != null){
                                $timestamp_interval = "timestamp BETWEEN ? AND ?";
                                $query_parameters = [$agency->getId(), $event_type1, $event_type2, $search->history_from, $search->history_to];
                            }
                            elseif ($search->history_from != null && $search->history_to == null){
                                $timestamp_interval = "timestamp >= ?";
                                $query_parameters = [$agency->getId(), $event_type1, $event_type2, $search->history_from];
                            }
                            elseif ($search->history_from == null && $search->history_to != null){
                                $timestamp_interval = "timestamp <= ?";
                                $query_parameters = [$agency->getId(), $event_type1, $event_type2, $search->history_to];
                            }
                            
                            $query = DB::createQuery()->select('card')->where("agency = ? AND subject_type = 'client' AND (event_type = ? OR event_type = ?) AND ".$timestamp_interval);
                            $owl_list = Owl::getList($query, $query_parameters);
                            //return $owl_list;

                            for ($i = 0; $i < count($owl_list); $i++){
                                for ($z = 0; $z < count($client_list3); $z++){
                                    if ($client_list3[$z]->id == $owl_list[$i]->card){
                                        array_push($client_parsed, $client_list3[$z]);
                                    }
                                }
                            }

                            if (count($client_list) > 0)
                                $client_list = [];
                        }
                    }
                    
                    if ($search->history_type == 5){ // поиск по "предложено" для клиента, надо дорабатывать
                        $client_list4 = count($client_parsed) > 0 ? $client_parsed : $client_list;
                        
                        if (count($client_list4) > 0){
                            $client_parsed = [];
                            $query = DB::createQuery()->select('client')->where("deleted = 0 AND agency = ? AND timestamp BETWEEN ? AND ?");
                            $proposed_list = Propose::getList($query, [$agency->getId(), $search->history_from, $search->history_to]);
                            //return $proposed_list;

                            if (count($proposed_list) > 0){
                                for ($i = 0; $i < count($proposed_list); $i++){
                                    for ($z = 0; $z < count($client_list4); $z++){
                                        if ($client_list4[$z]->id == $proposed_list[$i]->client){
                                            array_push($client_parsed, $client_list4[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $client_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $client_list = [];
                        } 
                    }*/
                    
                    $reduced_duplicates = count($client_parsed) > 0 ? $utils->removeDuplicatesFromAssocArray($client_parsed, "id") : $client_list;                    
                    
                    //if (count($reduced_duplicates) > 200){ // срезаем массив до 200 элементо в если их больше
                    //    $reduced_duplicates = array_slice($reduced_duplicates, 0, 200);
                    //}
                    
                    for ($i = 0; $i < count($reduced_duplicates); $i++){
                        $ratio1 = $currency->getRatio(0);
                        $price = $reduced_duplicates[$i]->price_from;
                        $ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                        $reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                    }
                    
                    $response = [
                        "conditions" => $object,
                        "properties" => [],
                        "clients" => $reduced_duplicates//count($client_parsed) > 0 ? $client_parsed : $client_list
                    ];
                }
            }
            else{ // Специальный поиск
                switch ($search->special_by){ // обычная выборка из property
                    case 5:
                        $parsed = json_decode($search->special_argument, true);
                        $phones = $parsed["phones"];
                        $object_id = $parsed["object_id"];
                        $parameters_property = [];
                        $parameters_client = [];
                        $query_part = "";
                        
                        for ($i = 0; $i < count($phones); $i++){
                            $phone_exploded = $utils->explodePhone($phones[$i]);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            $query_part .= ($i !== 0 ? " OR " : "")."contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?";
                        }
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 AND id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 AND id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        
                        //return $parameters_property;
                    break;
                    case 3:
                        //$prepared = "%".preg_replace('/\D/', '', $search->special_argument)."%";
                        //$prepared = "%".$search->special_argument."%";
                        $prepared = $utils->explodePhone($search->special_argument);
                        $parameters_property = [$prepared, $prepared, $prepared, $prepared];
                        $parameters_client = [$prepared, $prepared, $prepared, $prepared];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 1 OR stock = 0 AND agency = ".$agency->getId().") AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            //. "AND agency = ".$agency->getId()." "
                            . "AND (contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?)"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND (contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?)"); 
                    break;
                    case 4:
                        $parameters_property = ["%".$search->special_argument."%"];
                        $parameters_client = ["%".$search->special_argument."%"];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                    break;
                    case 2:
                        $parameters_property = [$search->special_argument];
                        $parameters_client = [$search->special_argument];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ?"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            " deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ?");
                    break;
                    case 0:
                        //return $this->prepareQuery($search->special_argument);
                        $parameters_property = $this->permureParametersForProperty($search->special_argument);
                        $parameters_client = $this->permureParametersForClient($search->special_argument);
                        $parameters_string_property = "";
                        $parameters_string_client = "";
                        
                        for ($i = 0; $i < count($parameters_property)/3-1; $i++)
                            $parameters_string_property .= "OR free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ";
                        
                        for ($i = 0; $i < count($parameters_client)/4-1; $i++)
                            $parameters_string_client .= "OR free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? OR details LIKE ? ";
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                        $query_client = DB::createQuery()->select('*')->where(
                            " deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? OR details LIKE ? ".$parameters_string_client.")");
                        //return $parameters_string_property; 
                    break; 
                    /*case 1:
                        $agreement = strval($search->special_argument);
                        
                        $proposed_property_query = DB::createQuery()->select('property')->where("deleted = 0 AND agreement = ?");
                        $proposed_property = Propose::getList($proposed_property_query, [$agreement]);
                        $proposed_client_query = DB::createQuery()->select('client')->where("deleted = 0 AND agreement = ?");
                        $proposed_client = Propose::getList($proposed_client_query, [$agreement]);
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_client[0]->client != "" ? $proposed_client[0]->client : -1));
                        //return $parameters_property; 
                    break; */

                    //default :
                    //exit();
                }
                
                switch ($search->special_by){ // выборка проекций из stock_changed
                    case 5:    
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 AND stock_id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        
                        //return $parameters_property;
                    break;
                    case 3:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND (contact1 LIKE ? "
                            . "OR contact2 LIKE ? "
                            . "OR contact3 LIKE ? "
                            . "OR contact4 LIKE ?)"); 
                    break;
                    case 4:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                    break;
                    case 2:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND stock_id = ?");
                    break;
                    case 0:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                    break; 
                    /*case 1:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                        //return $parameters_property; 
                    break; */

                    //default :
                    //exit();
                }
                
                if ($search->stock == 1){
                    switch ($search->special_by){ // выборка всего стока из property
                        case 5:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 AND id <> ".$object_id
                                . " AND agency <> ".$agency->getId()
                                . " AND (".$query_part.")"); 

                            //return $parameters_property;
                        break;
                        case 3:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND agency <> ".$agency->getId()." "
                                . "AND (contact1 LIKE ? "
                                . "OR contact2 LIKE ? "
                                . "OR contact3 LIKE ? "
                                . "OR contact4 LIKE ?)"); 
                        break;
                        case 4:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND agency <> ".$agency->getId()." "
                                . "AND email LIKE ? "); 
                        break;
                        case 2:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 "
                                . "AND agency <> ".$agency->getId()." "
                                . "AND id = ?");
                        break;
                        case 0:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND agency <> ".$agency->getId()." "
                                . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                        break; 
                        /*case 1:

                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                                . "AND agency = ".$agency->getId()." "
                                . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                            //return $parameters_property; 
                        break; */

                        //default :
                        //exit();
                    }
                }
                
                $property_list = Property::getList($query_property, $parameters_property);
                $stock_changed_properties = $stock->getList($query_property_stock_changed, $parameters_property);
                
                for ($i = 0; $i < count($stock_changed_properties); $i++){
                    $stock_changed_properties[$i]->id = $stock_changed_properties[$i]->stock_id;

                    for ($z = 0; $z < count($property_list); $z++){
                        if ($stock_changed_properties[$i]->id == $property_list[$z]->id){
                            array_splice($property_list, $z, 1);
                        }
                    }
                }
                
                if ($search->stock == 1){
                    $stock_properties = Property::getList($query_property_stock, $parameters_property);
                    
                    for ($i = 0; $i < count($stock_properties); $i++){
                        for ($z = 0; $z < count($property_list); $z++){
                            if ($stock_properties[$i]->id == $property_list[$z]->id){
                                array_splice($property_list, $z, 1);
                            }
                        }
                    }

                    $property_list = array_merge($property_list, $stock_properties);
                }
                
                $property_list = array_merge($property_list, $stock_changed_properties);
                $reduced_duplicates = $utils->removeDuplicatesFromAssocArray($property_list, "id");
                    
                //if (count($reduced_duplicates) > 200){ // срезаем массив до 200 элементо в если их больше
                //    $reduced_duplicates = array_slice($reduced_duplicates, 0, 200);
                //}

                $shared_brokered_filtered = [];
                
                for ($i = 0; $i < count($reduced_duplicates); $i++){ // разделение по своим и чужим стокам
                    if ($reduced_duplicates[$i]->stock == 1 && $reduced_duplicates[$i]->agency != $agency->getId()){
                        $reduced_duplicates[$i]->foreign_stock = 1;
                    }
                    else{
                        $reduced_duplicates[$i]->foreign_stock = 0;
                    }
                    
                    if ( // очистка от брокерных и кооперационных недвиж. при поиске по номеру телефона
                        $reduced_duplicates[$i]->agency != $agency->getId() && 
                        ($reduced_duplicates[$i]->statuses == 5 || $reduced_duplicates[$i]->statuses == 7) &&
                        ($search->special_by == 5 || $search->special_by == 3)
                    ){
                        //unset($reduced_duplicates[$i]);
                    }
                    else{
                        array_push($shared_brokered_filtered, $reduced_duplicates[$i]);
                    }

                    //$ratio1 = $currency->getRatio(0);
                    //$price = $reduced_duplicates[$i]->price;
                    //$ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                    //$reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                }
                
                $reduced_duplicates = $shared_brokered_filtered;
                
                $response = [
                    "conditions" => $object,
                    "properties" => $reduced_duplicates,
                    "clients" => Client::getList($query_client, $parameters_client)
                ];
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getShortEmpty(){
        global $defaults, $search_response;
        
        $this->is_empty = true;
        $last = $search_response->getLast();
        
        if ($last == false){
            $agent_defaults = $defaults->get();
            return $this->getIDsOnly($agent_defaults->search, 1);
        }
        else{
            return $this->getIDsOnly($last);
        }
    }
    
    public function getIDsOnly($search_id, $for_empty_search = null){ // $for_empty_search - флаг, показывает для чего поиск - для пустого поиска или для выполненного
        //set_time_limit(60);
        //Utils::log("getIDsOnly() started");
        $_start = microtime(true);
        global $agency, $currency, $dimensions, $utils, $defaults, $stock, $googleac;
        
        $search_id = intval($search_id);
        $search = $this->load($search_id);    
        $object = get_object_vars($search);
        $query_response_limit = isset($search->contour) ? 25000 : 300;
        //$this->toggleStock($search->stock);
        $agent_defaults = $defaults->get();
        
        try{
            if (!is_array($object))
                throw new Exception("Wrong query parameters", 500);
            
            if ($search->type == 1){ // обычный поиск (не Special)
                $search->special_by = null;
                $search->special_argument = null;
                $search->save();
                
                //$sort_by = $this->getSortString($search);
                
                if ($search->ascription == 0 || $search->ascription == 1){ // поиск по недвижимости
                    $parsed = $this->parseSearchForProperty($object);
                    // берем всю свою (и сток и не сток):
                    $query = DB::createQuery()->select('*')->where("stock = 0 AND deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order("last_updated DESC LIMIT ".$query_response_limit);
                    $property_list = Property::getList($query, $parsed["parameters"]);
                    // и проекции стока:
                    $query = DB::createQuery()->select('*')->where("deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order("last_updated DESC LIMIT ".$query_response_limit);
                    $stock_changed_properties = $stock->getList($query, $parsed["parameters"]); // выбрали по запросу
                    
                    for ($i = 0; $i < count($stock_changed_properties); $i++){
                        $stock_changed_properties[$i]->id = $stock_changed_properties[$i]->stock_id;
                        
                        for ($z = 0; $z < count($property_list); $z++){
                            if ($stock_changed_properties[$i]->id == $property_list[$z]->id){
                                array_splice($property_list, $z, 1);
                            }
                        }
                    }

                    if ($search->external != null && $agency->getExternalStatus() == 1 && $agency->getId() == 1){ // поиск по внешним, только для первого агентства
                        $parsed_external = $this->parseSearchForPropertyExternal($object);
                        // затем собранное внешним коллектором:
                        $query_external = DB::createQuery()->select('*')->where("deleted = 0 AND stock_id IS NULL ".$parsed_external["query"])->order("last_updated DESC LIMIT ".$query_response_limit);
                        $property_external_list = PropertyExternal::getList($query_external, $parsed_external["parameters"]);
                        $property_list = array_merge($property_external_list, $property_list, $stock_changed_properties);
                    }
                    else{
                        $property_list = array_merge($property_list, $stock_changed_properties);
                    }
                    
                    // теперь берем все существ. стоки, если это включено(и оплачено):
                    if ($search->stock == 1){
                        $query = DB::createQuery()->select('*')->where("stock = 1 AND deleted = 0 AND temporary = 0 ".$parsed["query"])->order("last_updated DESC LIMIT ".$query_response_limit);
                        $stock_list = Property::getList($query, $parsed["parameters"]);
                        
                        for ($i = 0; $i < count($stock_list); $i++){
                            for ($z = 0; $z < count($property_list); $z++){
                                if ($stock_list[$i]->id == $property_list[$z]->id){
                                    array_splice($stock_list, $i, 1);
                                }
                            }
                        }
                        
                        $property_list = array_merge($property_list, $stock_list);
                    }
                    
                    $property_types = json_decode($object["property"]);
                    $property_streets = json_decode($object["street"]);
                    $property_streets_text = json_decode($object["street_text"]);
                    $search_contour = $object["contour"];
                    $property_parsed = [];
                    $debuga = [];
                   
                    // ##################################### начало отсева по типам ###############################//
                    
                    if ($search->property != null){
                        for ($i = 0; $i < count($property_list); $i++){ // отсев по типам (обязательно)
                            $types_fit = 0;
                            $tmp_object = get_object_vars($property_list[$i]);
                            $tmp_property_types = json_decode($tmp_object["types"]);

                            for ($z = 0; $z < count($tmp_property_types); $z++){
                                $type = $tmp_property_types[$z];

                                for ($c = 0; $c < count($property_types); $c++){
                                    if ($property_types[$c] == $type){
                                        $types_fit++;
                                    }
                                }
                            }

                            if ($types_fit > 0){
                                array_push($property_parsed, $property_list[$i]);
                            }
                        }
                        
                        $property_list = [];
                    }
                    
                    // ##################################### конец отсева по типам ################################//
                    
                    if ($search->contour != null){ // отсев по контуру
                        $property_list0 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list0) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list0); $i++){ // отсев по типам (обязательно)
                                $contour = Contour::load($search->contour);
                                $tmp_object = get_object_vars($property_list0[$i]);
                                $tmp_property_lat = $tmp_object["lat"];
                                $tmp_property_lng = $tmp_object["lng"];
                                
                                if (
                                    $tmp_property_lat != null &&
                                    $tmp_property_lng != null &&
                                    $tmp_property_lat > 0 &&
                                    $tmp_property_lng > 0 &&
                                    $this->containsLocation($contour->data, $tmp_property_lat, $tmp_property_lng)
                                ){
                                    array_push($property_parsed, $property_list0[$i]);
                                }
                            }

                            $property_list = [];
                        }
                    }
                        
                    if (($search->price_from != null || $search->price_to != null) && $search->currency != null){ // поиск по цене (с конвертацией валюты)
                        $ratio1 = $currency->getRatio($search->currency);
                        $property_list1 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list1) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list1); $i++){
                                $price = $property_list1[$i]->price;
                                $ratio2 = $currency->getRatio($property_list1[$i]->currency_id);
                                $price_converted = round($price/$ratio2*$ratio1);
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);

                                if (
                                        ($search->price_from != null && 
                                        $search->price_to != null && 
                                        $search->price_from <= $price_converted && 
                                        $search->price_to >= $price_converted) ||
                                        ($search->price_from != null &&
                                        $search->price_to == null &&
                                        $search->price_from <= $price_converted) ||
                                        ($search->price_to != null &&
                                        $search->price_from == null &&
                                        $search->price_to >= $price_converted)
                                ){
                                    array_push($property_parsed, $property_list1[$i]);
                                }
                            }
                            
                            $property_list = [];
                        }
                    }
                    
                    if (($search->object_size_from != null || $search->object_size_to != null) && $search->object_dimensions != null){ // поиск по dimensions (с конвертацией)
                        $ratio1 = $dimensions->getRatio($search->object_dimensions);
                        $property_list2 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list2) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list2); $i++){
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);
                                if ($search->object_type == 1){
                                    $home_size = $property_list2[$i]->home_size;
                                    $home_ratio2 = $dimensions->getRatio($property_list2[$i]->home_dims);
                                    $home_size_converted = round($home_size/$ratio1*$home_ratio2);
                                    //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);
                                    
                                    if (
                                            ($search->object_size_from != null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_from <= $home_size_converted && 
                                            $search->object_size_to >= $home_size_converted) ||
                                            ($search->object_size_from != null &&
                                            $search->object_size_to == null &&
                                            $search->object_size_from <= $home_size_converted) ||
                                            ($search->object_size_from == null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_to >= $home_size_converted) &&
                                            $home_size != null
                                        ){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }elseif ($search->object_type == 2){
                                    $lot_size = $property_list2[$i]->lot_size;
                                    $lot_ratio2 = $dimensions->getRatio($property_list2[$i]->lot_dims);
                                    $lot_size_converted = round($lot_size/$ratio1*$lot_ratio2);
                                    //array_push($debuga, ["lot_size_from" => $search->object_size_from, "lot_size" => $lot_size, "lot_size_converted" => $lot_size_converted, "lot_dimension" => $property_list2[$i]->lot_dims]);
                                    
                                    if (
                                            ($search->object_size_from != null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_from <= $lot_size_converted && 
                                            $search->object_size_to >= $lot_size_converted) ||
                                            ($search->object_size_from != null &&
                                            $search->object_size_to == null &&
                                            $search->object_size_from <= $lot_size_converted) ||
                                            ($search->object_size_from == null &&
                                            $search->object_size_to != null &&
                                            $search->object_size_to >= $lot_size_converted) &&
                                            $lot_size != null
                                        ){
                                        array_push($property_parsed, $property_list2[$i]);
                                    }
                                }
                            }
                            
                            //if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }
                    
                    if (
                            $search->history_type == 2 || 
                            $search->history_type == 3 || 
                            $search->history_type == 4 ||
                            $search->history_type == 5 ||
                            $search->history_type == 6 ||
                            $search->history_type == 7
                    ){ // поиск по действиям компарижна
                        $condition_id = $search->history_type-1;
                        $property_list3 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list3) > 0){
                            $property_parsed = [];
                            $history_to = $search->history_to == 0 || $search->history_to == null ? time() : $search->history_to+86400;
                            $query = DB::createQuery()->select('property')->where("agency = ? AND event = 'condition_change' AND current_state = ? AND timestamp BETWEEN ? AND ?");
                            $comparison_list = ClientComparison::getList($query, [$agency->getId(), $condition_id, $search->history_from, $history_to]);
                            //return $owl_list;
                            if (count($comparison_list) > 0){
                                for ($i = 0; $i < count($comparison_list); $i++){
                                    for ($z = 0; $z < count($property_list3); $z++){
                                        if ($property_list3[$z]->id == $comparison_list[$i]->property){
                                            array_push($property_parsed, $property_list3[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $property_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $property_list = [];
                        }
                    }
                    
                    /*if ($search->history_type == 9){ // поиск по "предложено"
                        $property_list4 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list4) > 0){
                            $property_parsed = [];
                            $query = DB::createQuery()->select('property')->where("deleted = 0 AND agency = ? AND timestamp BETWEEN ? AND ?");
                            $proposed_list = Propose::getList($query, [$agency->getId(), $search->history_from, $search->history_to]);
                            //return $proposed_list;

                            if (count($proposed_list) > 0){
                                for ($i = 0; $i < count($proposed_list); $i++){
                                    for ($z = 0; $z < count($property_list4); $z++){
                                        if ($property_list4[$z]->id == $proposed_list[$i]->property){
                                            array_push($property_parsed, $property_list4[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $property_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $property_list = [];
                        } 
                    }*/
                    
                    if ($search->street != null){
                        $property_list5 = count($property_parsed) > 0 ? $property_parsed : $property_list;
                        
                        if (count($property_list5) > 0){
                            $property_parsed = [];
                            
                            for ($i = 0; $i < count($property_list5); $i++){ // отсев по типам (обязательно)
                                $street_fits = 0;
                                $tmp_object = get_object_vars($property_list5[$i]);
                                $tmp_property_street = $tmp_object["street"];
                                $tmp_property_street_text = $tmp_object["street_text"];
                                
                                if (count($property_streets) > 0 && $search_contour == null){ //  проверка на наличие улиц в клиенте вообще
                                    for ($m = 0; $m < count($property_streets); $m++){
                                        if ($tmp_property_street == $property_streets[$m] || Utils::isStringsSimilar($tmp_property_street_text, $property_streets_text[$m])){
                                            $street_fits++;
                                        }
                                    }
                                }
                                else{ // если улиц нет и/или задан контур
                                    $street_fits++;
                                }

                                if ($street_fits > 0){
                                    array_push($property_parsed, $property_list5[$i]);
                                }
                            }

                            $property_list = [];
                        }
                    }
                    
                    // ###################### зачищаем от совпдаающих внешних
                    $property_external_for_slice = count($property_parsed) > 0 ? $property_parsed : $property_list;
                    $reduced_duplicates_external_filtered = [];
                    $reduced_duplicates_not_external = [];
                    $external_ids_tmp = [];
                    
                    for ($f = 0; $f < count($property_external_for_slice); $f++){
                        if (!isset($property_external_for_slice[$f]->source)){ // не внешняя
                            array_push($external_ids_tmp, $property_external_for_slice[$f]->external_id);
                            array_push($external_ids_tmp, $property_external_for_slice[$f]->external_id_hex);
                            array_push($external_ids_tmp, $property_external_for_slice[$f]->external_id_winwin);
                            array_push($reduced_duplicates_not_external, $property_external_for_slice[$f]);
                        }
                    }
                    
                    $external_were_sliced = false;
                    $response_limit = 100;
                    
                    switch ($agency->getId()){
                        case 1:
                            $response_limit = 600;
                        break;
                        case 69:
                            $response_limit = 10;
                        break;
                    }
                    
                    for ($f = 0; $f < count($property_external_for_slice); $f++){
                        if (isset($property_external_for_slice[$f]->source)){ // если внешняя
                            if ($property_external_for_slice[$f]->source == "yad2"){
                                $exploded = explode("_", $property_external_for_slice[$f]->external_id);
                                $key = array_search(end($exploded), $external_ids_tmp);
                                
                                if (!$key){
                                    array_push($reduced_duplicates_external_filtered, $property_external_for_slice[$f]);
                                }
                                else{
                                    $external_were_sliced = count($property_external_for_slice) == $response_limit ? true : false;
                                }
                            }
                            else{
                                $key = array_search($property_external_for_slice[$f]->external_id, $external_ids_tmp);
                            
                                if (!$key){
                                    array_push($reduced_duplicates_external_filtered, $property_external_for_slice[$f]);
                                }
                                else{
                                    $external_were_sliced = count($property_external_for_slice) == $response_limit ? true : false;
                                }
                            }
                        }
                    }
                    
                    $property_parsed = array_merge($reduced_duplicates_external_filtered, $reduced_duplicates_not_external);
                    
                    //##################### обрезка до $response_limit штук #########################################//
                    
                    $property_list_for_slice = count($property_parsed) > 0 ? $property_parsed : $property_list;
                    $property_list_for_slice = $this->sort($property_list_for_slice, $search);
                     // пишем кол-во найденных в общем
                    $search->last_finded = count($property_list_for_slice)*20;
                    $search->save();
                    
                    if (count($property_list_for_slice) > $response_limit){
                        $property_parsed = array_slice($property_list_for_slice, 0, $response_limit);
                        $property_list = [];
                    }
                    
                    //##################################################################################//
                    
                    $reduced_duplicates = count($property_parsed) > 0 ? $utils->removeDuplicatesFromAssocArray($property_parsed, "id") : $utils->removeDuplicatesFromAssocArray($property_list, "id");
                    
                    //if (count($reduced_duplicates) > $response_limit){ // срезаем массив до $response_limit элементо в если их больше
                    //    $reduced_duplicates = array_slice($reduced_duplicates, 0, $response_limit);
                    //}
                    
                    $street_placeids = [];
                    
                    for ($i = 0; $i < count($reduced_duplicates); $i++){ // разделение по своим и чужим стокам
                        if ($reduced_duplicates[$i]->stock == 1 && $reduced_duplicates[$i]->agency != $agency->getId()){
                            $reduced_duplicates[$i]->foreign_stock = 1;
                            
                            if ($reduced_duplicates[$i]->statuses == 7 || $reduced_duplicates[$i]->statuses == 5){
                                $reduced_duplicates[$i]->house_number = null;
                                $reduced_duplicates[$i]->contact1 = $agency->getPhone($reduced_duplicates[$i]->agency);
                                $reduced_duplicates[$i]->contact2 = null;
                                $reduced_duplicates[$i]->contact3 = null;
                                $reduced_duplicates[$i]->contact4 = null;
                            }
                        }
                        else{
                            $reduced_duplicates[$i]->foreign_stock = 0;
                        }
                        
                        $ratio1 = $currency->getRatio(0);
                        $price = $reduced_duplicates[$i]->price;
                        $ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                        $reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                        $reduced_duplicates[$i]->street_name = $reduced_duplicates[$i]->street_text;
                        array_push($street_placeids, $reduced_duplicates[$i]->street);
                        //$reduced_duplicates[$i]->street_googleac = $googleac->getShortName($reduced_duplicates[$i]->street);
                    }
                    
                    $reduced_duplicates = $this->sort($reduced_duplicates, $search);
                    
                    $response = [
                        "conditions" => $object,
                        "tmp" => $street_placeids,
                        "street_googleac" => GoogleAC::getShortNameForGroup($street_placeids),
                        "properties" => $reduced_duplicates,//count($property_parsed) > 0 ? $property_parsed : $property_list,//$debuga
                        "clients" => [],
                        "external_were_sliced" => $external_were_sliced
                    ];
                    
                    SearchResponse::set($search->id, ["properties" => $reduced_duplicates, "clients" => []]);
                }
                else if ($search->ascription == 2 || $search->ascription == 3){ // поиск по клиентам
                    $parsed = $this->parseSearchForClient($object);
                    $query = DB::createQuery()->select('*')->where("deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." ".$parsed["query"])->order("last_updated DESC"); 
                    $client_list = Client::getList($query, $parsed["parameters"]);
                    $client_parsed = [];
                    $debuga = [];
                            
                    if (($search->price_from != null || $search->price_to != null) && $search->currency != null){ // поиск по цене (с конвертацией валюты)
                        $ratio1 = $currency->getRatio($search->currency);
                        
                        for ($i = 0; $i < count($client_list); $i++){
                            $price_from = $client_list[$i]->price_from;
                            $price_to = $client_list[$i]->price_to;
                            $ratio2 = $currency->getRatio($client_list[$i]->currency_id);
                            $price_from_converted = round($price_from/$ratio2*$ratio1);
                            $price_to_converted = round($price_to/$ratio2*$ratio1);
                            //return $price_converted;
                            //array_push($debuga, ["price_from" => $search->price_from, "price" => $price_from, "price_converted" => $price_from_converted, "currency" => $property_list[$i]->currency_id]);
                            
                            if (
                                    ($search->price_to != null &&
                                    $search->price_from != null &&
                                    $search->price_from <= $price_from_converted && 
                                    $search->price_to >= $price_to_converted) ||
                                    ($search->price_to == null &&
                                    $search->price_from != null &&
                                    $search->price_from <= $price_from_converted) ||
                                    ($search->price_to != null &&
                                    $search->price_from == null &&
                                    $search->price_to >= $price_to_converted)
                                )
                                {
                                array_push($client_parsed, $client_list[$i]);
                            }
                        }
                        
                        $client_list = [];
                    }
                    
                    if ($search->object_size_from != null && $search->object_size_to != null && $search->object_dimensions != null){ // поиск по размерам дома и участка для клиента, надо дорабатывать
                        $ratio1 = $dimensions->getRatio($search->object_dimensions);
                        $client_list2 = count($client_parsed) > 0 ? $client_parsed : $client_list;
                        
                        if (count($client_list2) > 0){
                            $client_parsed = [];
                            
                            for ($i = 0; $i < count($client_list2); $i++){
                                //return $price_converted;
                                //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);
                                if ($search->object_type == 1){
                                    $home_size_from = $client_list2[$i]->home_size_from;
                                    $home_size_to = $client_list2[$i]->home_size_to;
                                    $home_ratio2 = $dimensions->getRatio($client_list2[$i]->home_size_dims);
                                    $home_size_from_converted = round($home_size_from/$ratio1*$home_ratio2);
                                    $home_size_to_converted = round($home_size_to/$ratio1*$home_ratio2);
                                    //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);
                                    
                                    if ($search->object_size_from <= $home_size_from_converted && $search->object_size_to >= $home_size_to_converted){
                                        array_push($client_parsed, $client_list2[$i]);
                                    }
                                }
                                elseif ($search->object_type == 2){
                                    $lot_size_from = $client_list2[$i]->lot_size_from;
                                    $lot_size_to = $client_list2[$i]->lot_size_to;
                                    $lot_ratio2 = $dimensions->getRatio($client_list2[$i]->lot_size_dims);
                                    $lot_size_from_converted = round($lot_size_from/$ratio1*$lot_ratio2);
                                    $lot_size_to_converted = round($lot_size_to/$ratio1*$lot_ratio2);
                                    //array_push($debuga, ["lot_size_from" => $search->object_size_from, "lot_size" => $lot_size, "lot_size_converted" => $lot_size_converted, "lot_dimension" => $property_list2[$i]->lot_dims]);
                                    
                                    if ($search->object_size_from <= $lot_size_from_converted && $search->object_size_to >= $lot_size_to_converted){
                                        array_push($client_parsed, $client_list2[$i]);
                                    }
                                }
                            }
                            
                            $client_list = [];
                        }
                    }
                    
                    if (
                            $search->history_type == 2 || 
                            $search->history_type == 3 || 
                            $search->history_type == 4 ||
                            $search->history_type == 5 ||
                            $search->history_type == 6 ||
                            $search->history_type == 7
                    ){ // поиск по действиям компарижна
                        $condition_id = $search->history_type-1;
                        $client_list3 = count($client_parsed) > 0 ? $client_parsed : $client_list;
                        
                        if (count($client_list3) > 0){
                            $client_parsed = [];
                            $history_to = $search->history_to == 0 || $search->history_to == null ? time() : $search->history_to+86400;
                            $query = DB::createQuery()->select('client')->where("agency = ? AND event = 'condition_change' AND current_state = ? AND timestamp BETWEEN ? AND ?");
                            $comparison_list = PropertyComparison::getList($query, [$agency->getId(), $condition_id, $search->history_from, $history_to]);
                            //return $owl_list;
                            if (count($comparison_list) > 0){
                                for ($i = 0; $i < count($comparison_list); $i++){
                                    for ($z = 0; $z < count($client_list3); $z++){
                                        if ($client_list3[$z]->id == $comparison_list[$i]->client){
                                            array_push($client_parsed, $client_list3[$z]);
                                        }
                                    }
                                }
                            }
                            else{
                                $client_parsed = [];
                            }

                            //if (count($property_list) > 0)
                                $client_list = [];
                        }
                    }
                    
                    $reduced_duplicates = count($client_parsed) > 0 ? $utils->removeDuplicatesFromAssocArray($client_parsed, "id") : $client_list;                    
                    
                    //if (count($reduced_duplicates) > 200){ // срезаем массив до 200 элементо в если их больше
                    //    $reduced_duplicates = array_slice($reduced_duplicates, 0, 200);
                    //}
                    
                    for ($i = 0; $i < count($reduced_duplicates); $i++){
                        $ratio1 = $currency->getRatio(0);
                        $price = $reduced_duplicates[$i]->price_from;
                        $ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                        $reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                    }
                    
                    $response = [
                        "conditions" => $object,
                        "properties" => [],
                        "clients" => $reduced_duplicates//count($client_parsed) > 0 ? $client_parsed : $client_list
                    ];
                    
                    SearchResponse::set($search->id, ["clients" => $reduced_duplicates, "properties" => []]);
                }
            }
            else{ // Специальный поиск
                switch ($search->special_by){ // обычная выборка из property
                    case 5:
                        $parsed = json_decode($search->special_argument, true);
                        $phones = $parsed["phones"];
                        $object_id = $parsed["object_id"];
                        $parameters_property = [];
                        $parameters_client = [];
                        $query_part = "";
                        
                        for ($i = 0; $i < count($phones); $i++){
                            $phone_exploded = $utils->explodePhone($phones[$i]);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_property, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            array_push($parameters_client, $phone_exploded);
                            $query_part .= ($i !== 0 ? " OR " : "")."contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?";
                        }
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 AND id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 AND id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        
                        //return $parameters_property;
                    break;
                    case 3:
                        //$prepared = "%".preg_replace('/\D/', '', $search->special_argument)."%";
                        //$prepared = "%".$search->special_argument."%";
                        $prepared = $utils->explodePhone($search->special_argument);
                        $parameters_property = [$prepared, $prepared, $prepared, $prepared];
                        $parameters_client = [$prepared, $prepared, $prepared, $prepared];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 1 OR stock = 0 AND agency = ".$agency->getId().") AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            //. "AND agency = ".$agency->getId()." "
                            . "AND (contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?)"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND (contact1 REGEXP ? "
                            . "OR contact2 REGEXP ? "
                            . "OR contact3 REGEXP ? "
                            . "OR contact4 REGEXP ?)"); 
                    break;
                    case 4:
                        $parameters_property = ["%".$search->special_argument."%"];
                        $parameters_client = ["%".$search->special_argument."%"];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                    break;
                    case 2:
                        $parameters_property = [$search->special_argument];
                        $parameters_client = [$search->special_argument];
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ?"); 
                        $query_client = DB::createQuery()->select('*')->where(
                            " deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ?");
                    break;
                    case 0:
                        //return $this->prepareQuery($search->special_argument);
                        $parameters_property = $this->permureParametersForProperty($search->special_argument);
                        $parameters_client = $this->permureParametersForClient($search->special_argument);
                        $parameters_string_property = "";
                        $parameters_string_client = "";
                        
                        for ($i = 0; $i < count($parameters_property)/3-1; $i++)
                            $parameters_string_property .= "OR free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ";
                        
                        for ($i = 0; $i < count($parameters_client)/4-1; $i++)
                            $parameters_string_client .= "OR free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? OR details LIKE ? ";
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                        $query_client = DB::createQuery()->select('*')->where(
                            " deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? OR details LIKE ? ".$parameters_string_client.")");
                        //return $parameters_string_property; 
                    break; 
                    /*case 1:
                        $agreement = strval($search->special_argument);
                        
                        $proposed_property_query = DB::createQuery()->select('property')->where("deleted = 0 AND agreement = ?");
                        $proposed_property = Propose::getList($proposed_property_query, [$agreement]);
                        $proposed_client_query = DB::createQuery()->select('client')->where("deleted = 0 AND agreement = ?");
                        $proposed_client = Propose::getList($proposed_client_query, [$agreement]);
                        
                        $query_property = DB::createQuery()->select('*')->where(
                            "(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                        $query_client = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_client[0]->client != "" ? $proposed_client[0]->client : -1));
                        //return $parameters_property; 
                    break; */

                    //default :
                    //exit();
                }
                
                switch ($search->special_by){ // выборка проекций из stock_changed
                    case 5:    
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 AND stock_id <> ".$object_id
                            . " AND agency = ".$agency->getId()
                            . " AND (".$query_part.")"); 
                        
                        //return $parameters_property;
                    break;
                    case 3:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND (contact1 LIKE ? "
                            . "OR contact2 LIKE ? "
                            . "OR contact3 LIKE ? "
                            . "OR contact4 LIKE ?)"); 
                    break;
                    case 4:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND email LIKE ? "); 
                    break;
                    case 2:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 "
                            . "AND agency = ".$agency->getId()." "
                            . "AND stock_id = ?");
                    break;
                    case 0:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                            . "AND ascription = ".$search->ascription." "
                            . "AND agency = ".$agency->getId()." "
                            . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                    break; 
                    /*case 1:
                        $query_property_stock_changed = DB::createQuery()->select('*')->where(
                            "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                            . "AND agency = ".$agency->getId()." "
                            . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                        //return $parameters_property; 
                    break; */

                    //default :
                    //exit();
                }
                
                if ($search->stock == 1){
                    switch ($search->special_by){ // выборка всего стока из property
                        case 5:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 AND id <> ".$object_id
                                . " AND agency <> ".$agency->getId()
                                . " AND (".$query_part.")"); 

                            //return $parameters_property;
                        break;
                        case 3:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND ascription = ".$search->ascription." "
                                . "AND agency <> ".$agency->getId()." "
                                . "AND (contact1 LIKE ? "
                                . "OR contact2 LIKE ? "
                                . "OR contact3 LIKE ? "
                                . "OR contact4 LIKE ?)"); 
                        break;
                        case 4:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND ascription = ".$search->ascription." "
                                . "AND agency <> ".$agency->getId()." "
                                . "AND email LIKE ? "); 
                        break;
                        case 2:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 "
                                . "AND agency <> ".$agency->getId()." "
                                . "AND id = ?");
                        break;
                        case 0:
                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "stock = 1 AND deleted = 0 AND temporary = 0 ".($search->country != null ? " AND (country = '".$search->country."' OR country_text = '".$search->country_text."') " : " ")." ".($search->city != null ? " AND (city = '".$search->city."' OR city_text = '".$search->city_text."') " : " ")
                                . "AND ascription = ".$search->ascription." "
                                . "AND agency <> ".$agency->getId()." "
                                . "AND (free_number LIKE ? OR remarks_text LIKE ? OR name LIKE ? ".$parameters_string_property.")");
                        break; 
                        /*case 1:

                            $query_property_stock = DB::createQuery()->select('*')->where(
                                "deleted = 0 AND temporary = 0 ".($search->country != null ? " AND country = '".$search->country."' " : " ")." ".($search->city != null ? " AND city = '".$search->city."' " : " ")
                                . "AND agency = ".$agency->getId()." "
                                . "AND id = ".($proposed_property[0]->property != "" ? $proposed_property[0]->property : -1));
                            //return $parameters_property; 
                        break; */

                        //default :
                        //exit();
                    }
                }
                
                $property_list = Property::getList($query_property, $parameters_property);
                $stock_changed_properties = $stock->getList($query_property_stock_changed, $parameters_property);
                
                for ($i = 0; $i < count($stock_changed_properties); $i++){
                    $stock_changed_properties[$i]->id = $stock_changed_properties[$i]->stock_id;

                    for ($z = 0; $z < count($property_list); $z++){
                        if ($stock_changed_properties[$i]->id == $property_list[$z]->id){
                            array_splice($property_list, $z, 1);
                        }
                    }
                }
                
                if ($search->stock == 1){
                    $stock_properties = Property::getList($query_property_stock, $parameters_property);
                    
                    for ($i = 0; $i < count($stock_properties); $i++){
                        for ($z = 0; $z < count($property_list); $z++){
                            if ($stock_properties[$i]->id == $property_list[$z]->id){
                                array_splice($property_list, $z, 1);
                            }
                        }
                    }

                    $property_list = array_merge($property_list, $stock_properties);
                }
                
                $property_list = array_merge($property_list, $stock_changed_properties);
                $reduced_duplicates = $utils->removeDuplicatesFromAssocArray($property_list, "id");
                    
                //if (count($reduced_duplicates) > 200){ // срезаем массив до 200 элементо в если их больше
                //    $reduced_duplicates = array_slice($reduced_duplicates, 0, 200);
                //}

                $shared_brokered_filtered = [];
                
                for ($i = 0; $i < count($reduced_duplicates); $i++){ // разделение по своим и чужим стокам
                    if ($reduced_duplicates[$i]->stock == 1 && $reduced_duplicates[$i]->agency != $agency->getId()){
                        $reduced_duplicates[$i]->foreign_stock = 1;
                        
                        if ($reduced_duplicates[$i]->statuses == 7 || $reduced_duplicates[$i]->statuses == 5){
                            $reduced_duplicates[$i]->house_number = null;
                            $reduced_duplicates[$i]->contact1 = $agency->getPhone($reduced_duplicates[$i]->agency);
                            $reduced_duplicates[$i]->contact2 = null;
                            $reduced_duplicates[$i]->contact3 = null;
                            $reduced_duplicates[$i]->contact4 = null;
                        }
                    }
                    else{
                        $reduced_duplicates[$i]->foreign_stock = 0;
                    }
                    
                    if ( // если поиск по номеру и недвж. брокерная или аукционная
                        $reduced_duplicates[$i]->agency != $agency->getId() && 
                        ($reduced_duplicates[$i]->statuses == 5 || $reduced_duplicates[$i]->statuses == 7) &&
                        ($search->special_by == 5 || $search->special_by == 3)
                    ){
                        //unset($reduced_duplicates[$i]);
                    }
                    else{
                        array_push($shared_brokered_filtered, $reduced_duplicates[$i]);
                    }

                    //$ratio1 = $currency->getRatio(0);
                    //$price = $reduced_duplicates[$i]->price;
                    //$ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                    //$reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                }
                
                $reduced_duplicates = $shared_brokered_filtered;
                
                $street_placeids = [];
                    
                for ($i = 0; $i < count($reduced_duplicates); $i++){ // разделение по своим и чужим стокам
                    if ($reduced_duplicates[$i]->stock == 1 && $reduced_duplicates[$i]->agency != $agency->getId()){
                        $reduced_duplicates[$i]->foreign_stock = 1;

                        if ($reduced_duplicates[$i]->statuses == 7 || $reduced_duplicates[$i]->statuses == 5){
                            $reduced_duplicates[$i]->house_number = null;
                            $reduced_duplicates[$i]->contact1 = $agency->getPhone($reduced_duplicates[$i]->agency);
                            $reduced_duplicates[$i]->contact2 = null;
                            $reduced_duplicates[$i]->contact3 = null;
                            $reduced_duplicates[$i]->contact4 = null;
                        }
                    }
                    else{
                        $reduced_duplicates[$i]->foreign_stock = 0;
                    }

                    $ratio1 = $currency->getRatio(0);
                    $price = $reduced_duplicates[$i]->price;
                    $ratio2 = $currency->getRatio($reduced_duplicates[$i]->currency_id);
                    $reduced_duplicates[$i]->price_converted = round($price/$ratio2*$ratio1);
                    $reduced_duplicates[$i]->street_name = $reduced_duplicates[$i]->street_text;
                    array_push($street_placeids, $reduced_duplicates[$i]->street);
                    //$reduced_duplicates[$i]->street_googleac = $googleac->getShortName($reduced_duplicates[$i]->street);
                }

                $reduced_duplicates = $this->sort($reduced_duplicates, $search);
                
                $response = [
                    "conditions" => $object,
                    "tmp" => $street_placeids,
                    "street_googleac" => GoogleAC::getShortNameForGroup($street_placeids),
                    "properties" => $reduced_duplicates,
                    "clients" => Client::getList($query_client, $parameters_client)
                ];
                
                SearchResponse::set($search->id, ["properties" => $reduced_duplicates, "clients" => Client::getList($query_client, $parameters_client)]);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        //Log::i("Search::getIDsOnly() microtime() 1,200,000 - 1,600,000 ILS", microtime(true)-$_start);
        return $response;
    }
    
    protected function sort($properties, $current_search){
        if ($current_search->sort_by != null){
            switch ($current_search->sort_by){
                case "date":
                    $response = $this->sortByDate($properties, $current_search->sort_desc);
                break;
                case "house":
                    $response = $this->sortByHouse($properties, $current_search->sort_desc);
                break;
                case "price":
                    $response = $this->sortByPrice($properties, $current_search->sort_desc);
                break;
                case "street":
                    $response = $this->sortByStreet($properties, $current_search->sort_desc);
                break;
                case "property":
                    $response = $this->sortByProperty($properties, $current_search->sort_desc);
                break;
                case "agent":
                    $response = $this->sortByAgent($properties, $current_search->sort_desc);
                break;
                default:
                    $response = $this->sortByDate($properties, 1);
                break;
            }
        }
        else{
            $response = $this->sortByDate($properties, 1);
        }
        
        return $response;
    }
    
    protected function sortByHouse($properties, $desc){
        $arr = $properties;
        $house = array();
        
        foreach ($arr as $key => $row){
            $house[$key] = $row->house_number;
        }
        
        array_multisort($house, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function sortByDate($properties, $desc){
        $arr = $properties;
        $date = array();
        
        foreach ($arr as $key => $row){
            $date[$key] = isset($row->last_updated) ? $row->last_updated : $row->timestamp;
        }
        
        array_multisort($date, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function sortByPrice($properties, $desc){
        $arr = $properties;
        $price = array();
        
        foreach ($arr as $key => $row){
            $price[$key] = $row->price_converted;
        }
        
        array_multisort($price, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function sortByStreet($properties, $desc){
        $arr = $properties;
        $price = array();
        
        foreach ($arr as $key => $row){
            $price[$key] = $row->street_name;
        }
        
        array_multisort($price, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function sortByProperty($properties, $desc){
        global $property_form_data, $localization;
        $arr = $properties;
        $date = array();
        
        
        foreach ($arr as $key => $row){
            $full_property_string = $localization->getVariableCurLocale($property_form_data["property_type"][$row->type1]);// .
                /*($row->type2 != null ? "/".$localization->getVariableCurLocale($property_form_data["property_type"][$row->type2]) : "") .
                ($row->type3 != null ? "/".$localization->getVariableCurLocale($property_form_data["property_type"][$row->type3]) : "") .
                ($row->type4 != null ? "/".$localization->getVariableCurLocale($property_form_data["property_type"][$row->type4]) : "");*/
            $date[$key] = $full_property_string;
        }
        
        array_multisort($date, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function sortByAgent($properties, $desc){
        global $user;
        $arr = $properties;
        $date = array();
        
        foreach ($arr as $key => $row){
            $date[$key] = $user->getAgentNameOrStock($row->agent_id);
        }
        
        array_multisort($date, $desc == 1 ? SORT_DESC : SORT_ASC, $arr);
        
        return $arr;
    }
    
    protected function parseSearchForProperty($object){
        global $user;
        $sql_query = "";
        $query_parameters = [];
        
        foreach ($object as $key => $val){
            if ($val != NULL){
                switch ($key){
                    case "agent":
                        //$me = $user->load($_SESSION["user_id"]);
                        
                        //if ($_SESSION["user"] != $val){
                            $sql_query .= " AND agent_id = ?"; 
                            array_push($query_parameters, $val);
                        //}
                    break;
                    case "country":
                        $sql_query .= " AND (country = ? OR country_text = ?)";  
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["country_text"]);
                    break;
                    case "city":
                        $sql_query .= " AND (city = ? OR city_text = ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["city_text"]);
                    break;
                    case "neighborhood":
                        $sql_query .= " AND (neighborhood = ? OR neighborhood_text = ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["neighborhood_text"]);
                    break;
                    case "ascription":
                        $sql_query .= " AND ascription = ?";
                        array_push($query_parameters, $val);
                    break;
                    case "status":
                        $val = json_decode($val, true);
                        $sql_query .= " AND (statuses = ?";
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                array_push($query_parameters, $val[$i]);
                                $sql_query .= " OR statuses = ?";
                            }

                        $sql_query .= ")";
                    break;
                    case "furniture":
                        if ($val == 1){
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag = 3 OR furniture_flag = 4)";
                        }
                        elseif ($val == 0){
                            $sql_query .= " AND (furniture_flag = 0 OR furniture_flag = 4)";
                        }
                        elseif ($val == 3){
                            $sql_query .= " AND furniture_flag = 3";
                        }
                        elseif ($val == 4){
                            $sql_query .= " AND furniture_flag = 4";
                        }
                        //array_push($query_parameters, $val);
                    break;
                    case "property":
                        /*$val = json_decode(stripcslashes($val), true);
                        $sql_query .= " AND (type1 = ? OR type2 = ? OR type3 = ? OR type4 = ?";
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                $sql_query .= " OR type1 = ? OR type2 = ? OR type3 = ? OR type4 = ?";
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                            }

                        $sql_query .= ")";*/
                    break;
                    case "price_from":
                        //$sql_query .= " AND price BETWEEN ? AND ?";  
                        //array_push($query_parameters, $val);
                    break;
                    case "price_to":
                        //array_push($query_parameters, $val);
                    break;
                    case "currency":
                        //$sql_query .= " AND currency_id = ?";
                        //array_push($query_parameters, $val);
                    break;
                    case "history_type":
                        //if ($this->is_empty){
                        //    continue;
                        //}
                        
                        $day = 86400;
                        
                        if ($object["history_from"] != null && $object["history_from"] != 0 && $object["history_to"] != null &&  $object["history_to"] != 0){
                            if ($val == 0){ // last update
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated BETWEEN ? AND ?) OR (last_updated IS NULL AND timestamp BETWEEN ? AND ?))";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]+$day);
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]+$day);
                            }
                            elseif ($val == 1){ // free from 
                                $sql_query .= " AND free_from BETWEEN ? AND ?";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]+$day);
                            }
                        }
                        else if ($object["history_from"] != null && $object["history_from"] != 0){
                            if ($val == 0){ // last update
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated >= ?) OR (last_updated IS NULL AND timestamp >= ?))";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_from"]);
                            }
                            elseif ($val == 1){ // free from 
                                $sql_query .= " AND free_from >= ?";
                                array_push($query_parameters, $object["history_from"]);
                            }
                        }
                        else if ($object["history_to"] != null && $object["history_to"] != 0){
                            if ($val == 0){ // last update
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated <= ?) OR (last_updated IS NULL AND timestamp <= ?))";
                                array_push($query_parameters, $object["history_to"]+$day);
                                array_push($query_parameters, $object["history_to"]+$day);
                            }
                            elseif ($val == 1){ // free from 
                                $sql_query .= " AND free_from <= ?";
                                array_push($query_parameters, $object["history_to"]+$day); 
                            }
                        }
                        
                    break;
                    /*case "object_type": // временно закоментировано пока не будут сделаны дименсионс
                        if ($val == 1) // 1 - house, 2 - flat
                            $sql_query .= " AND home_size BETWEEN ? AND ? AND dimensions = ?";
                        elseif ($val == 2) $sql_query .= " AND lot_size BETWEEN ? AND ? AND dimensions = ?";
                    break;  
                    case "object_size_from":
                        array_push($query_parameters, $val);
                    break;
                    case "object_size_to":
                        array_push($query_parameters, $val);
                    break;
                    case "object_dimensions":
                        array_push($query_parameters, $val);
                    break;*/
                    case "free_number_from":
                        if ($object["free_number_to"] != null){
                            $sql_query .= " AND (free_number >= ? AND free_number <= ?)";
                        }
                        else{
                            $sql_query .= " AND free_number >= ?";
                        }
                        
                        array_push($query_parameters, $val > 0 ? $val : 1);
                    break;
                    case "free_number_to":
                        if ($object["free_number_from"] == null){
                            $sql_query .= " AND free_number <= ? AND free_number > 0";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "age_from":
                        if ($object["age_to"] != null){
                            $sql_query .= " AND (age >= ? AND age <= ?)";
                        }
                        else{
                            $sql_query .= " AND age >= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "age_to":
                        if ($object["age_from"] == null){
                            $sql_query .= " AND age <= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "floors_from":
                        if ($object["floors_to"] != null){
                            $sql_query .= " AND (floor_from >= ? AND floor_from <= ?)";
                        }
                        else{
                            $sql_query .= " AND floor_from >= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "floors_to":
                        if ($object["floors_from"] == null){
                            $sql_query .= " AND floor_from <= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "house_num":
                        $sql_query .= " AND house_number = ?";
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_from":
                        if ($object["rooms_type"] == 2){
                            if ($object["rooms_to"] != null){
                                $sql_query .= " AND (bedrooms_count >= ? AND bedrooms_count <= ?)";
                            }
                            else{
                                $sql_query .= " AND bedrooms_count >= ?";
                            }
                        }
                        elseif ($object["rooms_type"] == 1){
                            if ($object["rooms_to"] != null){
                                $sql_query .= " AND (rooms_count >= ? AND rooms_count <= ?)";
                            }
                            else{
                                $sql_query .= " AND rooms_count >= ?";
                            }
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_to":
                        if ($object["rooms_type"] == 2){
                            if ($object["rooms_from"] == null){
                                $sql_query .= " AND bedrooms_count <= ?";
                            }
                        }
                        elseif ($object["rooms_type"] == 1){
                            if ($object["rooms_from"] == null){
                                $sql_query .= " AND rooms_count <= ?";
                            }
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "project":
                        $sql_query .= " AND project_id = ?";
                        array_push($query_parameters, $val);
                    break;  
                    case "history_type":
                        //???
                    break;
                    case "history_from":
                        //???
                    break;
                    case "history_to":
                        //???
                    break;
                    case "parking":
                        if ($val == 1)
                            $sql_query .= " AND parking_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "facade":
                        //$sql_query .= " AND parking_flag = ?";
                    break;
                    case "air_cond":
                        if ($val == 1)
                            $sql_query .= " AND air_cond_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "elevator":
                        if ($val == 1)
                            $sql_query .= " AND elevator_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "no_ground_floor":
                        if ($val == 1){
                            $sql_query .= " AND floor_from > 1 AND floor_from IS NOT NULL";
                        }
                        //$sql_query .= " AND  = ?";
                        //???
                    break;
                    case "no_last_floor":
                        if ($val == 1){
                            $sql_query .= " AND floor_from < floors_count AND floors_count IS NOT NULL AND floor_from IS NOT NULL";
                        }
                        //??? 
                    break;
                    //case "stock":
                        //$sql_query .= " AND stock IN (".$val.", 0)"; 
                        //array_push($query_parameters, $val);
                    //break;
                }
            }
        }
        
        return ["query" => $sql_query, "parameters" => $query_parameters];
    }
    
    protected function parseSearchForPropertyExternal($object){
        global $user;
        $sql_query = "";
        $query_parameters = [];
        
        foreach ($object as $key => $val){
            if ($val != NULL){
                switch ($key){
                    case "country":
                        $sql_query .= " AND (country = ? OR country_text = ?)";  
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["country_text"]);
                    break;
                    case "city":
                        $sql_query .= " AND (city = ? OR city_text = ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["city_text"]);
                    break;
                    case "ascription":
                        $sql_query .= " AND ascription = ?";
                        array_push($query_parameters, $val);
                    break;
                    case "status":
                        $val = json_decode($val, true);
                        $sql_query .= " AND (statuses = ?";
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                array_push($query_parameters, $val[$i]);
                                $sql_query .= " OR statuses = ?";
                            }

                        $sql_query .= ")";
                    break;
                    case "floors_from":
                        if ($object["floors_to"] != null){
                            $sql_query .= " AND (floors_count >= ? AND floors_count <= ?)";
                        }
                        else{
                            $sql_query .= " AND floors_count >= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "floors_to":
                        if ($object["floors_from"] == null){
                            $sql_query .= " AND floors_count <= ?";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_from":
                        if ($object["rooms_type"] == 2){
                            if ($object["rooms_to"] != null){
                                $sql_query .= " AND (bedrooms_count >= ? AND bedrooms_count <= ?)";
                            }
                            else{
                                $sql_query .= " AND bedrooms_count >= ?";
                            }
                        }
                        elseif ($object["rooms_type"] == 1){
                            if ($object["rooms_to"] != null){
                                $sql_query .= " AND (rooms_count >= ? AND rooms_count <= ?)";
                            }
                            else{
                                $sql_query .= " AND rooms_count >= ?";
                            }
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_to":
                        if ($object["rooms_type"] == 2){
                            if ($object["rooms_from"] == null){
                                $sql_query .= " AND bedrooms_count <= ?";
                            }
                        }
                        elseif ($object["rooms_type"] == 1){
                            if ($object["rooms_from"] == null){
                                $sql_query .= " AND rooms_count <= ?";
                            }
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "external":
                        $decoded_array = json_decode($val);
                        $sql_query .= " AND (source = ?";
                        array_push($query_parameters, $decoded_array[0]);
                        
                        if (count($decoded_array) > 1){
                            for ($f = 1; $f < count($decoded_array); $f++){
                                $sql_query .= " OR source = ?";
                                array_push($query_parameters, $decoded_array[$f]);
                            }
                        }
                        
                        $sql_query .= ")";
                        
                    break;
                    case "history_type":
                        $day = 86400;
                        
                        if ($object["history_from"] != null && $object["history_from"] != 0 && $object["history_to"] != null &&  $object["history_to"] != 0){
                            if ($val == 0){
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated BETWEEN ? AND ?) OR (last_updated IS NULL AND timestamp BETWEEN ? AND ?))";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]+$day);
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]+$day);
                            }
                        }
                        else if ($object["history_from"] != null && $object["history_from"] != 0){
                            if ($val == 0){
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated >= ?) OR (last_updated IS NULL AND timestamp >= ?))";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_from"]);
                            }
                        }
                        else if ($object["history_to"] != null && $object["history_to"] != 0){
                            if ($val == 0){
                                $sql_query .= " AND ((last_updated IS NOT NULL AND last_updated <= ?) OR (last_updated IS NULL AND timestamp <= ?))";
                                array_push($query_parameters, $object["history_to"]+$day);
                                array_push($query_parameters, $object["history_to"]+$day);
                            }
                        }
                    break;
                }
            }
        }
        
        return ["query" => $sql_query, "parameters" => $query_parameters];
    }
    
    protected function parseSearchForClient($object){
        $sql_query = "";
        $query_parameters = [];
        
        foreach ($object as $key => $val){
            if ($val != NULL){
                switch ($key) {
                    /*case "agent":
                        $sql_query .= " AND agent_id = ?"; 
                        array_push($query_parameters, $val);
                    break;*/
                   case "country":
                        $sql_query .= " AND (country = ? OR country_text = ?)";  
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["country_text"]);
                    break;
                    case "city":
                        $sql_query .= " AND (city = ? OR city_text = ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["city_text"]);
                    break;
                    case "neighborhood":
                        $sql_query .= " AND (neighborhood = ? OR neighborhood_text = ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["neighborhood_text"]);
                    break;
                    //case "street": // улиц много, надо разбираться, код можно взять из компарижна
                        /*$sql_query .= " AND street = ?";
                        array_push($query_parameters, $val);*/
                    //break;
                    case "ascription":
                        $sql_query .= " AND ascription = ?";
                        array_push($query_parameters, $val == 2 ? 0 : 1); // if ascription = sale client then sale else rent
                    break;
                    case "status":
                        $val = json_decode($val, true);
                        $sql_query .= " AND (status = ?";
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                array_push($query_parameters, $val[$i]);
                                $sql_query .= " OR status = ?";
                            }

                        $sql_query .= ")";
                    break;
                    case "furniture":
                        if ($val == 1){
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag = 3 OR furniture_flag = 4)";
                        }
                        elseif ($val == 0){
                            $sql_query .= " AND (furniture_flag = 0 OR furniture_flag = 4)";
                        }
                        elseif ($val == 3){
                            $sql_query .= " AND furniture_flag = 3";
                        }
                        elseif ($val == 4){
                            $sql_query .= " AND furniture_flag = 4";
                        }
                        //array_push($query_parameters, $val);
                    break;
                    case "property": // недвижимостей может быть много, надо парсить, берем из компарижна
                        /*$val = json_decode(stripcslashes($val), true);
                        $sql_query .= " AND (type1 = ? OR type2 = ? OR type3 = ? OR type4 = ?";
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                $sql_query .= " OR type1 = ? OR type2 = ? OR type3 = ? OR type4 = ?";
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                                array_push($query_parameters, $val[$i]);
                            }

                        $sql_query .= ")";*/
                    break;
                    case "price_from":
                        //$sql_query .= " AND ? < price_from AND ? > price_to";  
                        //array_push($query_parameters, $val);
                    break;
                    case "price_to":
                        //array_push($query_parameters, $val);
                    break;
                    case "currency":
                        //$sql_query .= " AND currency_id = ?";
                        //array_push($query_parameters, $val);
                    break;
                    case "history_type":
                        if ($val == 0){ // 0 - last update, 1 - free from
                            $sql_query .= " AND (last_updated BETWEEN ? AND ? OR timestamp BETWEEN ? AND ?)";
                            $history_to = $object["history_to"] == 0 || $object["history_to"] == null ? time() : $object["history_to"];
                            array_push($query_parameters, $object["history_from"]);
                            array_push($query_parameters, $history_to);
                            array_push($query_parameters, $object["history_from"]);
                            array_push($query_parameters, $history_to);
                        }
                        elseif ($val == 1){
                            if ($object["history_to"] == 0 || $object["history_to"] == null){
                                $sql_query .= " AND free_from >= ?";
                                array_push($query_parameters, $object["history_from"]);
                            }
                            else{
                                $sql_query .= " AND free_from BETWEEN ? AND ?";
                                array_push($query_parameters, $object["history_from"]);
                                array_push($query_parameters, $object["history_to"]);
                            }
                        }
                    break;
                    /*case "object_type":
                        if ($val == 1) // 1 - house, 2 - flat
                            $sql_query .= " AND home_size BETWEEN ? AND ? AND dimensions = ?";
                        elseif ($val == 2) $sql_query .= " AND lot_size BETWEEN ? AND ? AND dimensions = ?";
                    break;  
                    case "object_size_from":
                        array_push($query_parameters, $val);
                    break;
                    case "object_size_to":
                        array_push($query_parameters, $val);
                    break;
                    case "object_dimensions":
                        array_push($query_parameters, $val);
                    break;*/
                    case "age_from":
                        if ($object["age_to"] != null){
                            $sql_query .= " AND ? <= age_from AND ? >= age_from";
                        }
                        else{
                            $sql_query .= " AND ? <= age_from";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "age_to":
                        if ($object["age_from"] == null){
                            $sql_query .= " AND ? >= age_from";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "floors_from":
                        if ($object["floors_to"] != null){
                            $sql_query .= " AND ? <= floor_from AND ? >= floor_to";
                        }
                        else{
                            $sql_query .= " AND ? <= floor_from";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "floors_to":
                        if ($object["floors_from"] == null){
                            $sql_query .= " AND ? >= floor_to";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_from":
                        if ($object["rooms_to"] != null){
                            $sql_query .= " AND ? <= rooms_from AND ? >= rooms_to";
                        }
                        else{
                            $sql_query .= " AND ? <= rooms_from";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_to":
                        if ($object["rooms_from"] == null){
                            $sql_query .= " AND ? >= rooms_to";
                        }
                        
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_type":
                        $sql_query .= " AND ? = rooms_type";
                        array_push($query_parameters, $val);
                    break;
                    case "project":
                        $sql_query .= " AND project_id = ?";
                        array_push($query_parameters, $val);
                    break;  
                    case "history_type":
                        //???
                    break;
                    case "history_from":
                        //???
                    break;
                    case "history_to":
                        //???
                    break;
                    case "parking":
                        if ($val == 1)
                            $sql_query .= " AND parking_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "facade":
                        if ($val == 1)
                            $sql_query .= " AND front_flag = 1";
                    break;
                    case "air_cond":
                        if ($val == 1)
                            $sql_query .= " AND air_cond_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "elevator":
                        if ($val == 1)
                            $sql_query .= " AND elevator_flag = 1";
                        //array_push($query_parameters, $val);
                    break;
                    case "no_ground_floor":
                        if ($val == 1)
                            $sql_query .= " AND no_ground_floor_flag = 1";
                    break;
                    case "no_last_floor":
                        if ($val == 1)
                            $sql_query .= " AND no_last_floor_flag = 1";
                    break;
                }
            }
        }
        
        return ["query" => $sql_query, "parameters" => $query_parameters];
    }
    
    private function permureParametersForProperty($parameters){
        $tmp = $this->permutation(explode(" ", $parameters));
        $parsed = [];
        
        if (count($tmp) > 1)
            for ($i = 0; $i < count($tmp); $i++){
                $str = "%";

                for ($z = 0; $z < count($tmp[$i]); $z++)
                    $str .= $tmp[$i][$z]."%";

                array_push($parsed, $str);
                array_push($parsed, $str);
                array_push($parsed, $str);
            }
        else{
            array_push($parsed, "%".$tmp[0]."%");
            array_push($parsed, "%".$tmp[0]."%");
            array_push($parsed, "%".$tmp[0]."%");
        }
            
        return $parsed;
    }
    
    private function permureParametersForClient($parameters){
        $tmp = $this->permutation(explode(" ", $parameters));
        $parsed = [];
        
        if (count($tmp) > 1)
            for ($i = 0; $i < count($tmp); $i++){
                $str = "%";

                for ($z = 0; $z < count($tmp[$i]); $z++)
                    $str .= $tmp[$i][$z]."%";

                array_push($parsed, $str);
                array_push($parsed, $str);
                array_push($parsed, $str);
                array_push($parsed, $str);
            }
        else{
            array_push($parsed, "%".$tmp[0]."%");
            array_push($parsed, "%".$tmp[0]."%");
            array_push($parsed, "%".$tmp[0]."%");
            array_push($parsed, "%".$tmp[0]."%");
        }
            
        return $parsed;
    }
    
    private function permutation($arr) {
        if(is_array($arr)&&count($arr)>1) { 
            foreach($arr as $k=>$v) {
                $answer[][]=$v;
            }
            do {
                foreach($arr as $k=>$v) { 
                    foreach($answer as $key=>$val) {
                        if(!in_array($v,$val)) {
                            $tmpArr[]=array_merge(array($v),$val); 
                        }
                    }
                }
                $answer=$tmpArr;
                unset($tmpArr);
            }while(count($answer[0])!=count($arr));
            return $answer;
        }else
            $answer=$arr;
        return $answer;
    }
    
    public function exportToCSV($properties, $clients){
        global $property_form_data, $client_form_data, $currency, $agency;
        $permission = new Permission();
        
        if ($properties != null){
            $properties_csv_name = "user_".$_SESSION["user"]."_properties.csv";
            $properties_csv = fopen(dirname(dirname(__FILE__))."/storage/".$properties_csv_name,"wb");
            $properties_decoded = json_decode($properties);
            
            $property = Property::load($properties_decoded[0]);
            $object = get_object_vars($property);
            $object_keys = [];
            
            foreach ($object as $key => $val){ // перебираем поля недвижимости 
                switch ($key) {
                    case "free_number":
                        array_push($object_keys, "Order number");
                    break;
                    case "country":
                        array_push($object_keys, "Country");
                    break;
                    case "city":
                        array_push($object_keys, "City");
                    break;
                    case "neighborhood":
                        array_push($object_keys, "Hood");
                    break;
                    case "street":
                        array_push($object_keys, "Street");
                    break;
                    case "ascription":
                        array_push($object_keys, "Ascription");
                    break;
                    case "statuses":
                        array_push($object_keys, "Status");
                    break;
                    case "furniture_flag":
                        array_push($object_keys, "Furniture");
                    break;
                    case "types":
                        array_push($object_keys, "Property");
                    break;
                    case "price":
                        array_push($object_keys, "Price");
                    break;
                    case "currency_id":
                        array_push($object_keys, "Currency");
                    break;
                    case "age":
                        array_push($object_keys, "Built");
                    break;
                    case "floor_from":
                        array_push($object_keys, "Floor from");
                    break;
                    case "floors_count":
                        array_push($object_keys, "Floors");
                    break;
                    case "rooms_count":
                        array_push($object_keys, "Rooms");
                    break;
                    //case "project_id": // здесь ошибка экспорта
                        //array_push($object_keys, "Project");
                    //break;
                    case "parking_flag":
                        array_push($object_keys, "Parking");
                    break;
                    case "air_cond_flag":
                        array_push($object_keys, "Air cond.");
                    break;
                    case "elevator_flag":
                        array_push($object_keys, "Elevator");
                    break;
                    case "facade_flag":
                        array_push($object_keys, "Facade");
                    break;
                    case "last_floor_flag":
                        array_push($object_keys, "Last floor");
                    break;
                    case "ground_floor_flag":
                        array_push($object_keys, "Ground floor");
                    break;
                    case "home_dims":
                        array_push($object_keys, "Home dimensions");
                    break;
                    case "lot_dims":
                        array_push($object_keys, "Lot dimensions");
                    break;
                    case "house_number":
                        array_push($object_keys, "House N");
                    break;
                    case "flat_number":
                        array_push($object_keys, "Flat N");
                    break;
                    case "home_size":
                        array_push($object_keys, "Home size");
                    break;
                    case "lot_size":
                        array_push($object_keys, "Lot size");
                    break;
                    case "views":
                        array_push($object_keys, "View");
                    break;
                    case "free_from":
                        array_push($object_keys, "Free");
                    break;
                    case "directions":
                        array_push($object_keys, "Directions");
                    break;
                    case "name":
                        array_push($object_keys, "Name");
                    break;
                    case "email":
                        array_push($object_keys, "e-Mail");
                    break;
                    case "contact1":
                        array_push($object_keys, "Phone 1");
                    break;
                    case "contact2":
                        array_push($object_keys, "Phone 2");
                    break;
                    case "contact3":
                        array_push($object_keys, "Phone 3");
                    break;
                    case "contact4":
                        array_push($object_keys, "Phone 4");
                    break;
                    case "remarks_text":
                        array_push($object_keys, "Remarks");
                    break;
                    case "last_updated":
                        array_push($object_keys, "Last updated");
                    break;
                }
            }
                
            //fputcsv($properties_csv, $object_keys);
            $array = str_replace('"', '', $object_keys);
            fputs($properties_csv, implode($object_keys, ';')."\n");
                
            for ($i = 0; $i < count($properties_decoded); $i++){
                $property = Property::load($properties_decoded[$i]);
                $object = get_object_vars($property);
                $object_vals = [];
                
                if ($object["stock"] == 1 && $object["agency"] != $agency->getId()){
                    continue;
                }
                
                foreach ($object as $key => $val){ // перебираем поля недвижимости 
                    switch ($key) {
                        case "free_number":
                            array_push($object_vals, $val);//?
                        break;
                        case "country_text":
                            array_push($object_vals, $val);//?
                        break;
                        case "city_text":
                            array_push($object_vals, $val);//?
                        break;
                        case "neighborhood_text":
                            array_push($object_vals, $val);//?
                        break;
                        case "street_text":
                            array_push($object_vals, $val);//?
                        break;
                        case "ascription":
                            array_push($object_vals, $property_form_data["ascription"][$val]);
                        break;
                        case "statuses":
                            array_push($object_vals, $property_form_data["status"][$val]);
                        break;
                        case "furniture_flag":
                            if ($val == 1){
                                array_push($object_vals, "Yes");
                            }
                            else if ($val == 0){
                                array_push($object_vals, "No");
                            }
                            else if ($val == 3){
                                array_push($object_vals, "Partial");
                            }
                            else if ($val == 4){
                                array_push($object_vals, "Optional");
                            }
                            else{ 
                                array_push($object_vals, "");
                            }
                        break;
                        case "types":
                            if ($val != "" && $val != null){
                                $parsed = json_decode($val);
                                $string = "\"";

                                for ($z = 0; $z < count($parsed); $z++)
                                    $string .= ($z !== 0 ? "," : "").$property_form_data["property_type"][$parsed[$z]];

                                $string .= "\"";
                                array_push($object_vals, $string);
                            }
                            else array_push($object_vals, "");
                        break;
                        case "price":
                            array_push($object_vals, $val);
                        break;
                        case "currency_id":
                            array_push($object_vals, $val != "" && $val != null ? $currency->getSymbolCode($val) : "");
                        break;
                        case "age":
                            array_push($object_vals, $val);
                        break;
                        case "floor_from":
                            array_push($object_vals, $val);
                        break;
                        case "floors_count":
                            array_push($object_vals, $val);
                        break;
                        case "rooms_count":
                            array_push($object_vals, $val);
                        break;
                        //case "project_id": // здесь ошибка экспорта
                            //array_push($object_vals, $val != "" && $val != null ? $agency->getProjectName($val) : "");
                        //break;
                        case "parking_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "air_cond_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "elevator_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "facade_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "last_floor_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "ground_floor_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "home_dims":
                            array_push($object_vals, $val != "" && $val != null ? $property_form_data["dimension"][$val] : "");
                        break;
                        case "lot_dims":
                            array_push($object_vals, $val != "" && $val != null ? $property_form_data["dimension"][$val] : "");
                        break;
                        case "house_number":
                            array_push($object_vals, $val);
                        break;
                        case "flat_number":
                            array_push($object_vals, $val);
                        break;
                        case "home_size":
                            array_push($object_vals, $val);
                        break;
                        case "lot_size":
                            array_push($object_vals, $val);
                        break;
                        case "views":
                            if ($val != "" && $val != null){
                                $parsed = json_decode($val);
                                $string = "\"";

                                for ($z = 0; $z < count($parsed); $z++)
                                    $string .= ($z !== 0 ? "," : "").$property_form_data["view"][$parsed[$z]];

                                $string .= "\"";
                                array_push($object_vals, $string);
                                //array_push($object_vals, $property_form_data["view"][$val]);
                            }
                            else{
                                array_push($object_vals, "");
                            }
                        break;
                        case "free_from":
                            if ($val != 0 && $val != "" && $val != null)
                                array_push($object_vals, date('d/m/Y', $val));
                            else array_push($object_vals, "");
                        break;
                        case "directions":
                            if ($val != "" && $val != null){
                                $parsed = json_decode($val);
                                $string = "\"";

                                for ($z = 0; $z < count($parsed); $z++)
                                    $string .= ($z !== 0 ? "," : "").$property_form_data["direction"][$parsed[$z]];

                                $string .= "\"";
                                array_push($object_vals, $string);
                            }
                            else array_push($object_vals, "");
                        break;
                        case "name":
                            array_push($object_vals, $val);
                        break;
                        case "email":
                            array_push($object_vals, $val);
                        break;
                        case "contact1":
                            array_push($object_vals, $val);
                        break;
                        case "contact2":
                            array_push($object_vals, $val);
                        break;
                        case "contact3":
                            array_push($object_vals, $val);
                        break;
                        case "contact4":
                            array_push($object_vals, $val);
                        break;
                        case "remarks_text":
                            array_push($object_vals, '"'.$val.'"');
                        break;
                        case "last_updated":
                            array_push($object_vals, date('d/m/Y', $val));//?
                        break;
                    }
                }    
                //fputcsv($properties_csv, $object_vals);
                $array = str_replace('"', '', $object_vals);
                fputs($properties_csv, implode($object_vals, ';')."\n");
            }
            
            fclose($properties_csv);
        }
        
        if ($clients != null){
            $clients_csv_name = "user_".$_SESSION["user"]."_clients.csv";
            $clients_csv = fopen(dirname(dirname(__FILE__))."/storage/".$clients_csv_name,"wb");
            $clients_decoded = json_decode($clients);
            
            $client = Client::load($clients_decoded[0]);
            $object = get_object_vars($client);
            $object_keys = [];
            
            foreach ($object as $key => $val) // перебираем поля недвижимости 
                switch ($key) {
                    case "country":
                        array_push($object_keys, "Country");
                    break;
                    case "city":
                        array_push($object_keys, "City");
                    break;
                    case "neighborhood":
                        array_push($object_keys, "Hood");
                    break;
                    case "street":
                        array_push($object_keys, "Streets");
                    break;
                    case "ascription":
                        array_push($object_keys, "Ascription");
                    break;  
                    case "status":
                        array_push($object_keys, "Status");
                    break;
                    case "furniture_flag":
                        array_push($object_keys, "Furniture");
                    break;
                    case "property_types":
                        array_push($object_keys, "Properties");
                    break;
                    case "price_from":
                        array_push($object_keys, "Price from");
                    break;
                    case "price_to":
                        array_push($object_keys, "Price to");
                    break;
                    case "currency_id":
                        array_push($object_keys, "Currency");
                    break;
                    case "age_from":
                        array_push($object_keys, "Built");
                    break;
                    case "floor_from":
                        array_push($object_keys, "Floor from");
                    break;
                    case "floor_to":
                        array_push($object_keys, "Floor to");
                    break;
                    case "rooms_from":
                        array_push($object_keys, "Rooms from");
                    break;
                    case "rooms_to":
                        array_push($object_keys, "Rooms to");
                    break;
                    case "rooms_type":
                        array_push($object_keys, "Rooms type");
                    break;
                    //case "project_id": // здесь ошибка экспорта
                        //array_push($object_keys, "Project");
                    //break;
                    case "parking_flag":
                        array_push($object_keys, "Parking");
                    break;
                    case "air_cond_flag":
                        array_push($object_keys, "Air cond.");
                    break;
                    case "elevator_flag":
                        array_push($object_keys, "Elevator");
                    break;
                    case "front_flag":
                        array_push($object_keys, "Facade");
                    break;
                    case "no_last_floor_flag":
                        array_push($object_keys, "No last floor");
                    break;
                    case "no_ground_floor_flag ":
                        array_push($object_keys, "No ground floor");
                    break;
                    case "home_size_dims":
                        array_push($object_keys, "Home size dimensions");
                    break;
                    case "home_size_from":
                        array_push($object_keys, "Home size from");
                    break;
                    case "home_size_to":
                        array_push($object_keys, "Home size to");
                    break;
                    case "lot_size_dims":
                        array_push($object_keys, "Lot size dimensions");
                    break;
                    case "lot_size_from":
                        array_push($object_keys, "Lot size from");
                    break;
                    case "lot_size_to":
                        array_push($object_keys, "Lot size to");
                    break;
                    case "free_from":
                        array_push($object_keys, "Free from");
                    break;
                    case "name":
                        array_push($object_keys, "Name");
                    break;
                    case "email":
                        array_push($object_keys, "e-Mail");
                    break;
                    case "contact1":
                        array_push($object_keys, "Phone 1");
                    break;
                    case "contact2":
                        array_push($object_keys, "Phone 2");
                    break;
                    case "contact3":
                        array_push($object_keys, "Phone 3");
                    break;
                    case "contact4":
                        array_push($object_keys, "Phone 4");
                    break;
                    case "remarks_text":
                        array_push($object_keys, "Remarks");
                    break;
                    case "details":
                        array_push($object_keys, "Details");
                    break;
                }
                
            //fputcsv($clients_csv, $object_keys);
            $array = str_replace('"', '', $object_keys);
            fputs($clients_csv, implode($object_keys, ';')."\n");
            
            for ($i = 0; $i < count($clients_decoded); $i++){
                $client = Client::load($clients_decoded[$i]);
                $object = get_object_vars($client);
                $object_vals = [];
                
                foreach ($object as $key => $val){ // перебираем поля недвижимости 
                    switch ($key) {
                        case "country_text":
                            array_push($object_vals, $val);
                        break;
                        case "city_text":
                            array_push($object_vals, $val);
                        break;
                        case "neighborhood_text":
                            array_push($object_vals, $val);
                        break;
                        case "street_text":
                            if ($val != "[]" && $val != "null" && $val != null){
                                $decoded = json_decode($val);
                                $concated = "";

                                for ($v = 0; $v < count($decoded); $v++){
                                    $concated .= $decoded[$v].($v < count($decoded)-1 ? ";" : "");
                                }

                                array_push($object_vals, '"'.$concated.'"');
                            }
                            else{
                                array_push($object_vals, "");
                            }
                        break;
                        case "ascription":
                            array_push($object_vals, $client_form_data["ascription"][$val]);
                        break;  
                        case "status":
                            array_push($object_vals, $client_form_data["status"][$val]);
                        break;
                        case "furniture_flag":
                            if ($val == 1){
                                array_push($object_vals, "Yes");
                            }
                            else if ($val == 0){
                                array_push($object_vals, "No");
                            }
                            else if ($val == 3){
                                array_push($object_vals, "Partial");
                            }
                            else if ($val == 4){
                                array_push($object_vals, "Optional");
                            }
                            else{ 
                                array_push($object_vals, "");
                            }
                        break;
                        case "property_types":
                            if ($val != "" && $val != null){
                                $parsed = json_decode($val);
                                $string = "\"";

                                for ($z = 0; $z < count($parsed); $z++)
                                    $string .= ($z !== 0 ? "," : "").$client_form_data["property_type"][$parsed[$z]];

                                $string .= "\"";
                                array_push($object_vals, $string);
                            }
                            else array_push($object_vals, "");
                        break;
                        case "price_from":
                            array_push($object_vals, $val);
                        break;
                        case "price_to":
                            array_push($object_vals, $val);
                        break;
                        case "currency_id":
                            array_push($object_vals, $val != "" && $val != null ? $currency->getSymbolCode($val) : "");
                        break;
                        case "age_from":
                            array_push($object_vals, $val);
                        break;
                        case "floor_from":
                            array_push($object_vals, $val);
                        break;
                        case "floor_to":
                            array_push($object_vals, $val);
                        break;
                        case "rooms_from":
                            array_push($object_vals, $val);
                        break;
                        case "rooms_to":
                            array_push($object_vals, $val);
                        break;
                        case "rooms_type":
                            if ($object["rooms_from"] != null && $object["rooms_to"] != null){
                                array_push($object_vals, $val == 1 ? "Rooms" : "Bedrooms");
                            }
                            else{
                                array_push($object_vals, "");
                            }
                        break;
                        //case "project_id":
                            //array_push($object_vals, $val != "" && $val != null ? $agency->getProjectName($val) : "");
                        //break;
                        case "parking_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "air_cond_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "elevator_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "front_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "no_last_floor_flag":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "no_ground_floor_flag ":
                            array_push($object_vals, $val == 1 ? "Yes" : "No");
                        break;
                        case "home_size_dims":
                            array_push($object_vals, $val != "" && $val != null ? $client_form_data["dimension"][$val] : "");
                        break;
                        case "home_size_from":
                            array_push($object_vals, $val);
                        break;
                        case "home_size_to":
                            array_push($object_vals, $val);
                        break;
                        case "lot_size_dims":
                            array_push($object_vals, $val != "" && $val != null ? $client_form_data["dimension"][$val] : "");
                        break;
                        case "lot_size_from":
                            array_push($object_vals, $val);
                        break;
                        case "lot_size_to":
                            array_push($object_vals, $val);
                        break;
                        case "free_from":
                            if ($val != 0 && $val != "" && $val != null)
                                array_push($object_vals, date('d/m/Y', $val));
                            else array_push($object_vals, "");
                        break;
                        case "name":
                            array_push($object_vals, $val);
                        break;
                        case "email":
                            array_push($object_vals, $val);
                        break;
                        case "contact1":
                            array_push($object_vals, $val);
                        break;
                        case "contact2":
                            array_push($object_vals, $val);
                        break;
                        case "contact3":
                            array_push($object_vals, $val);
                        break;
                        case "contact4":
                            array_push($object_vals, $val);
                        break;
                        case "remarks_text":
                            array_push($object_vals, '"'.$val.'"');
                        break;
                        case "details":
                            array_push($object_vals, '"'.$val.'"');
                        break;
                    }
                }    
                //fputcsv($clients_csv, $object_vals);
                $array = str_replace('"', '', $object_vals);
                fputs($clients_csv, implode($object_vals, ';')."\n");
            }
            
            fclose($clients_csv);        
        }
        
        try{
            if (!$permission->is("export")){
                throw new Exception("Exporting cards forbidden!", 501);
            }
            
            $response = ["properties" => $properties != null ? $properties_csv_name : null, "clients" => $clients != null ? $clients_csv_name : null];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function createCheckByPhone($object_type, $object_id){
        global $agency, $defaults;
        $phones = [];
        
        switch ($object_type){
            case "property":
                $property_id = intval($object_id);
                $object = Property::load($property_id);
            break;

            case "client":
                $client_id = intval($object_id);
                $object = Client::load($client_id);
            break;
        }
        
        if ($object->contact1 != "" && $object->contact1 != null)
            array_push($phones, $object->contact1);
        
        if ($object->contact2 != "" && $object->contact2 != null)
            array_push($phones, $object->contact2);
        
        if ($object->contact3 != "" && $object->contact3 != null)
            array_push($phones, $object->contact3);
        
        if ($object->contact4 != "" && $object->contact4 != null)
            array_push($phones, $object->contact4);
        
        $new_search = $this->create([
            "author" => $_SESSION["user"], 
            "agency" => $agency->getId(),
            "type" => 2,
            "stock" => $defaults->getStock(),
            "special_by" => 5,
            "special_argument" => json_encode([
                "object_type" => $object_type, 
                "object_id" => $object_id,
                "phones" => $phones
            ])
        ]);
        
        $new_search = $new_search->save();
        $result = $this->query($new_search);
        
        if (count($result["properties"]) == 0 && count($result["clients"]) == 0){
            return 0;
        }
        else{
            return $new_search;
        }
    }
    
    public function saveSelectedOnMap($data, $reduced){
        global $agency;
        $reduced = intval($reduced);
        
        $selected_property = Selected::create([
            "agent" => $_SESSION["user"], 
            "data" => $data,
            "reduced" => $reduced,
            "timestamp" => time()
        ]);
        return $selected_property->save();
    }
    
    public function getSelectedOnMap($id){
        global $agency;
        
        $id = intval($id);
        $selected = Selected::load($id);
        
        try{
            if ($selected->agent != $_SESSION["user"]){
                throw new Exception("Access to selected list forbidden", 501);
            }
            
            $response = $selected;
        }  
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function toggleStock($value){
        global $defaults;
        
        $agent_defaults = $defaults->get();
        $agent_defaults->search_stock = intval($value);
        $agent_defaults->save();
        
        return $value;
    }
    
    private function containsLocation($contour, $lat, $lng){ // определяет, попала ли точка в полигон
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
    
    public function addSort($search_id, $by){ // добавляет сортировку на уровне сервера
        $search = $this->load($search_id);
        $search->sort_by = $by;
        $search->sort_desc = $search->sort_desc == null || $search->sort_desc == 0 ? 1 : 0;
        return $search->save();
    }
    
    protected function getStreetByPlaceId($place_id){
        global $googleac;
    
        $query = DB::createQuery()->select('short_name')->where('placeid = ? AND locale = "en"'); 
        $places = $googleac->getList($query, [$place_id]);

        if (count($places) > 0){
            return strtolower(json_encode($places[0]->short_name));
        }

        $jsonUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=".$place_id."&language=en&key=AIzaSyB9Wn9uRK8mlCHzA20yrPJzJzTVsz3mws0";

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        
        /* logging maps */
        Log::i("Search.class.php, getStreetByPlaceId(), place", $place_id);
        /****************/
        
        curl_close($geocurl);
        $decoded = json_decode($geofile, true);

        return strtolower($decoded["result"]["address_components"][0]["short_name"]);
    }
    
    public function getResultsCount($search_id){
        $search = $this->load(intval($search_id));    
        
        return $search->last_finded;
    }
    
    public function clearing(){
        global $agency, $stock;
        
        $query = DB::createQuery()->select('id')->where("stock = 1 AND statuses = 9 AND deleted = 0 AND temporary = 0 AND agency = ? AND last_updated < ?"); 
        $property_list = Property::getList($query, [$agency->getId(), time()-5184000]);
        
        for ($z = 0; $z < count($property_list); $z++){
            $property = Property::load($property_list[$z]->id);
            $property_id = $property_list[$z]->id;
            
            if ($property->stock_changed != 0){ // если есть копии
                $my_copy = $stock->getDataOnly($property_id);
                $newobject_props = get_object_vars($my_copy);

                foreach ($newobject_props as $key => $value){
                    if (
                            $key != "id" && 
                            $key != "stock" && 
                            $key != "stock_id" && 
                            $key != "stock_changed"
                    ){
                        $property->$key = $value;
                    }
                }

                $property->stock = 0;
                $property->stock_changed = 0;
                $stock->removeAll($property_id);
                $stock->copyHistoryToOriginal($property_id);
                // copying photos
                $query = DB::createQuery()->select('*')->where('property=?'); 
                $response = Photo::getList($query, [$property_id]);

                for ($i = 0; $i < count($response); $i++){
                    $photo = get_object_vars($response[$i]);  
                    $photo["property"] = $new_property_id;
                    $newphoto = Photo::create(array_slice($photo, 1));
                    $newphoto->save();
                }

                // copying docs
                $query = DB::createQuery()->select('*')->where('property=?'); 
                $response = PropertyDoc::getList($query, [$property_id]);

                for ($i = 0; $i < count($response); $i++){
                    $doc = get_object_vars($response[$i]);  
                    $doc["property"] = $new_property_id;
                    $newdoc = PropertyDoc::create(array_slice($doc, 1));
                    $newdoc->save();
                }
            }
            
            $property->save();
        }
    }
    
    public function tryExportContours($password, $contours){
        $admin_password = "a67553f97e572bd07aaf200c94af032a";
        
        if ($password === $admin_password){
            $csv_name = "contours_".$_SESSION["user"]."_export.csv";
            $csv = fopen(dirname(dirname(__FILE__))."/storage/".$csv_name,"wb");
            $contours_decoded = json_decode($contours);
            
            $object_keys = [];
            array_push($object_keys, "title");
            array_push($object_keys, "data");
                
            $array = str_replace('"', '', $object_keys);
            fputs($csv, implode($object_keys, ';')."\n");
                
            for ($i = 0; $i < count($contours_decoded); $i++){
                $contour = Contour::load($contours_decoded[$i]);
                $object = get_object_vars($contour);
                $object_vals = [];
                
                foreach ($object as $key => $val){ // перебираем поля недвижимости 
                    switch ($key) {
                        case "title":
                            array_push($object_vals, $val);//?
                        break;
                        case "data":
                            array_push($object_vals, $val);//?
                        break;
                    }
                }    
                
                $array = str_replace('"', '', $object_vals);
                fputs($csv, implode($object_vals, ';')."\n");
            }
            
            fclose($csv);
            
            return $csv_name;
        }
        else{
            return -1;
        }
    }
    
    public function tryImportContours($password){
        $admin_password = "a67553f97e572bd07aaf200c94af032a";
        
        if ($password === $admin_password){
            return 0;
        }
        else{
            return -1;
        }
    }
    
    public function getEmpty(){
        global $defaults, $search_response;
        
        $last_search = $search_response->getLast();
        
        if ($last_search){ // если есть последний поиск, даем его
            $default_search = $defaults->getSearch();
            $empty_search = Search::load($last_search);
            $empty_search->currency = $default_search->currency;
            $empty_search->object_dimensions = $default_search->object_dimensions;
            
            return $empty_search;
        }
        else{ // иначе даем дифолтный
            return $defaults->getSearch();
        }
    }
}
