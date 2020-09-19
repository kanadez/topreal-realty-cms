<?php

include(dirname(__FILE__).'/Client.data.php');

use Database\TinyMVCDatabase as DB;

class Client extends Database\TinyMVCDatabaseObject{
    const tablename  = 'client';
    
    public function setHistory($client_id, $history_data){
        $client_id = intval($client_id);
        $parameters = [
            "object_type" => 2,
            "object_id" => $client_id,
            "changes" => $history_data,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ];
        $object = History::create($parameters); 
        return $object->save();       
    }
    
    public function set($id, $data){
        $client_id = intval($id);
        $object = json_decode($data, true);       
	$client = $this->load($client_id);
        
        //$this->savePriceHistory($property_id, $object["price"], $property->price, $property->currency_id);
        
        foreach ($object as $key => $val) {
            if (is_array($val))
                $val = json_encode($val);
            
            $client->$key = $val; 
        }
        
        if ($client->street != null){
            $street_decoded = json_decode($client->street);
            $street_text = [];

            for ($i = 0; $i < count($street_decoded); $i++){
                array_push($street_text, Geo::getFullAddress($street_decoded[$i]));
            }

            $client->street_text = json_encode($street_text, JSON_UNESCAPED_UNICODE);
        }

        $client->neighborhood_text = $client->neighborhood != null ? Geo::getFullAddress($client->neighborhood) : null;
        $client->city_text = $client->city != null ? Geo::getFullAddress($client->city) : null;
        $client->region_text = $client->region != null ? Geo::getFullAddress($client->region) : null;
        $client->country_text = $client->country != null ? Geo::getFullAddress($client->country) : null;
        
        $client->agent_editing = -1;
        $client->last_updated = time(); 
        return $client->save();        
    }
    
    public function createNew($client_id, $client_data){
        global $agency;
        
        $client_id = intval($client_id);
        $object = json_decode($client_data, true);       
	$client = $this->load($client_id);
        //$permission = new Permission($client);
        
        //if (!$permission->canWrite())
                //throw new Exception("Creating new client forbidden!", 500);
        
        foreach ($object as $key => $val) {
            if (is_array($val))
                $val = json_encode($val);
            
            $client->$key = $val; 
        }
        
        //$property->agent_editing = -1;
        
        if ($client->street != null){
            $street_decoded = json_decode($client->street);
            $street_text = [];

            for ($i = 0; $i < count($street_decoded); $i++){
                array_push($street_text, Geo::getFullAddress($street_decoded[$i]));
            }

            $client->street_text = json_encode($street_text, JSON_UNESCAPED_UNICODE);
        }

        $client->neighborhood_text = $client->neighborhood != null ? Geo::getFullAddress($client->neighborhood) : null;
        $client->city_text = $client->city != null ? Geo::getFullAddress($client->city) : null;
        $client->region_text = $client->region != null ? Geo::getFullAddress($client->region) : null;
        $client->country_text = $client->country != null ? Geo::getFullAddress($client->country) : null;
        
        $client->agency = $agency->getId(); 
        $client->temporary = 0; 
        $client->timestamp = time(); 
        $client->last_updated = time(); 
        $this->setHistory($client_id, '{"created":{"old":'.time().',"new":'.time().'}}');
        return $client->save();            
    }
    
    public function createTemporary(){
        global $agency;
        $permission = new Permission();
        
        try{
            if (!$permission->is("new_card")){
                throw new Exception("Creating card forbidden!", 501);
            }
            
            $new_client = $this->create(["agent_id" => $_SESSION["user"], "agency" => $agency->getId()]);
            $response = $new_client->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getFormOptions(){
        global $client_form_data;
        
        $client_form_data["currency"] = Currency::getList();
        $client_form_data["dimension"] = Dimensions::getList();
        return $client_form_data;
    }
    
    public function get($id){
        global $agency;
        
        $client_id = intval($id);
	$client = $this->load($client_id);
        
        try{
            if ($client === FALSE){
                throw new Exception("Client not exists at all", 503);
            }
            
            if ($agency->getId() != $client->agency){ // чужой клиент
                throw new Exception("Client not belongs your agency", 503);
            }
            
            $client->history = $this->getHistory($client_id);
            $client->docs = $this->getDocs($client_id);
            $client->last_propose = $this->getLastPropose($client_id);
            $response = $client;
            $response->im_editor = $response->agent_editing == $_SESSION["user"] ? true : false;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function tryEdit($id){
        $client_id = intval($id);
	$client = $this->load($client_id);
        $permission = new Permission();
        
        try{
            if ($client === FALSE)
                throw new Exception("Client not exists at all", 503);
            
            if (!$permission->is("edit")){
                throw new Exception("Editing client forbidden!", 501);
            }
            
            if (!$permission->is("edit_another_card") && $_SESSION["user"] != $property->agent_id){
                throw new Exception("Editing foreign client forbidden!", 501);
            }
            
            if ($client->agent_editing != -1 && $client->agent_editing != $_SESSION["user"]){
                $user_id = intval($client->agent_editing);
                $user = User::load($user_id);
                throw new Exception("Client is editing by ".$user->name." now", 505);
            }
            
            $client->agent_editing = $_SESSION["user"];
            $client->save();
            $response = 1;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function unlock($id){
	$client = $this->load(intval($id));
        
        if ($client->agent_editing == $_SESSION["user"]){
            $client->agent_editing = -1;
            $response = $client->save();
        }
        else $response = 0;
        
        return $response;
    }
    
    public function saveContactRemark($client_id, $parameter, $value){
        global $agency;
        
        try{
            $client = $this->load(intval($client_id));
            
            if ($client->agency != $agency->getId()){
                throw new Exception("Access forbidden for saving contact remark", 501);
            }
            
            $client->$parameter = $value;
            $response =  $client->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;     
    }
    
    public function getHistory($client_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $client_id = intval($client_id);
        $query = DB::createQuery()->select('a.*, b.name')->join('inner', 'user', 'a.user=b.id')->where('a.deleted = 0 AND object_id=? AND object_type=2 AND changes<>"{}"')->order("timestamp DESC LIMIT 20"); 
	$history = History::getList($query, [$client_id]);
        
        try{
            if (count($history) === 0)
                throw new Exception("Client has no history", 502);
            
            $response = $history;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getDocs($client_id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $client_id = intval($client_id);
        $query = DB::createQuery()->select('*')->where('client=? AND deleted=0')->order("id DESC"); 
	$docs = ClientDoc::getList($query, [$client_id]);
        
        try{
            if (count($docs) === 0)
                throw new Exception("Client has no docs", 502);
            
            $response = $docs;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function restoreDoc($id){ 
        $id = intval($id);
        $doc = ClientDoc::load($id);
        $permission = new Permission();
        
        try{
            if (!$permission->is("delete_document")){
                throw new Exception("Removing document forbidden!", 501);
            }
            
            if ($doc == FALSE)
                throw new Exception("Document not exists", 503);
            
            if ($doc->agreement != null){
                if (!$permission->is("delete_agreement")){
                    throw new Exception("Removing agreement forbidden!", 501);
                }
                
                $agreement = Propose::load($doc->agreement);
                $agreement->deleted = 0;
                $agreement->save();
            }
            
            $doc->deleted = 0; 
            $response = $doc->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function propose($client_id, $agreement_num){
        global $agency;
        $client_id = intval($client_id);
        $agreement_num = intval($agreement_num);
        $parameters = [
            "client" => $client_id,
            "agreement" => uniqid(), // в старом коде именно $agreement_num клался сюда
            "user" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "timestamp" => time()
        ];
        $object = Propose::create($parameters); 
        $history_data = json_encode(["last_proposed" => ["old" => [$object->timestamp, $object->agreement], "new" => ""]]);
        $this->setHistory($property_id, $history_data);
        return $object->save();       
    }
    
    public function checkAgreement($agreement){
        global $agency;
        $agreement = intval($agreement);
	$query = DB::createQuery()->select('id')->where("agreement = ? AND agency = ? AND deleted = 0"); 
        $response = Propose::getList($query, [$agreement, $agency->getId()]);
        
        return count($response);
    }
    
    private function getLastPropose($client_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $client_id = intval($client_id);
        $query = DB::createQuery()->select('agreement, timestamp')->where('client=? AND deleted=0')->order("timestamp DESC"); 
	$propose_list = Propose::getList($query, [$client_id]);
        
        try{
            if (count($propose_list) === 0)
                throw new Exception("Client was not proposed anytime", 502);
            
            $response = [
                "timestamp" => $propose_list[0]->timestamp,
                "from" => count($propose_list),
                "agreement" => $propose_list[0]->agreement
            ];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function removeDoc($id){ 
        $id = intval($id);
        $doc = ClientDoc::load($id);
        $permission = new Permission();
        
        try{
            if (!$permission->is("delete_document")){
                throw new Exception("Removing document forbidden!", 501);
            }
            
            if ($doc == FALSE)
                throw new Exception("Document not exists", 503);
            
            if ($doc->agreement != null){
                if (!$permission->is("delete_agreement")){
                    throw new Exception("Removing agreement forbidden!", 501);
                }
                
                $agreement = Propose::load($doc->agreement);
                
                if ($agreement != FALSE){
                    $agreement->deleted = 1;
                    $agreement->save();
                }
            }
            
            $doc->deleted = 1; 
            $response = $doc->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getListByProperty($property_id, $mode = null, $from = null){
        global $agency, $currency, $dimensions, $defaults, $stock, $propertycomplist, $propertycomp, $utils;
        
        $property = Property::load(intval($property_id));
        
        if ($property->stock == 1 && $property->stock_changed != 0){
            $stock_changed = $stock->getDataOnly(intval($property_id));
            $property = $stock_changed != FALSE ? $stock_changed : $property;
        }
        
        if ($propertycomplist->getLastDate($property_id) != null && $mode != "new"){ // type = last, получаем сохраненный ранее список сопоставления
            return $propertycomplist->getProperties($property_id);
        }
        
        $object = get_object_vars($property);
        $property_types = json_decode($object["types"]);
        $property_ascription = json_decode($object["ascription"]);
        $property_street = $object["street"];
        $property_street_text = $object["street_text"];
        $property_lat = $object["lat"];
        $property_lng = $object["lng"];
        $property_price = $object["price"];
        $property_currency = $object["currency_id"];
        $property_home_size = $object["home_size"];
        $property_home_dims = $object["home_dims"];
        $property_lot_size = $object["lot_size"];
        $property_lot_dims = $object["lot_dims"];
        $complete = [];
        $timestamp_offset = 0; // смещение времени назад для фильра по $from
        $from_parsed = null; // обработанное значение $from
        
        if ($from === null){ // если лимит по времени не задан
            if ($property_ascription == 0){ // if sale
                $from_parsed = "2_months"; // 2 months
            }
            elseif ($property_ascription == 1){ // if rent
                $from_parsed = "month"; // 1 month
            }
        }
        else{
            $from_parsed = $from;
        }
        
        switch ($from_parsed){
            case "today":
                $timestamp_offset = time()-86400;
            break;
            case "week":
                $timestamp_offset = time()-86400*7;
            break;
            case "2_weeks":
                $timestamp_offset = time()-86400*14;
            break;
            case "month":
                $timestamp_offset = time()-86400*31;
            break;
            case "2_months":
                $timestamp_offset = time()-86400*31*2;
            break;
            case "3_months":
                $timestamp_offset = time()-86400*31*3;
            break;
            case "4_months":
                $timestamp_offset = time()-86400*31*4;
            break;
            case "5_months":
                $timestamp_offset = time()-86400*31*5;
            break;
            case "6_months":
                $timestamp_offset = time()-86400*31*6;
            break;
            case "7_months":
                $timestamp_offset = time()-86400*31*7;
            break;
            case "8_months":
                $timestamp_offset = time()-86400*31*8;
            break;
            case "9_months":
                $timestamp_offset = time()-86400*31*9;
            break;
            case "10_months":
                $timestamp_offset = time()-86400*31*10;
            break;
            case "11_months":
                $timestamp_offset = time()-86400*31*11;
            break;
            case "12_months":
                $timestamp_offset = time()-86400*31*12;
            break;
        }
        
        try{
            if (!is_array($object)){
                throw new Exception("Wrong query parameters", 500);
            }

            $parsed = $this->parseComparisonForProperty($object);

            $query = DB::createQuery()->select('*')->where("deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." AND status = 0 ".$parsed["query"]." AND timestamp > ".$timestamp_offset)->order("timestamp DESC"); 
            $response = $this->getList($query, $parsed["parameters"]); // первый шаг поиска
            $property_parsed = []; // массив для второго шага
            
            if ($property_lat != null && $property_lng != null){ // отсев по контуру
                for ($i = 0; $i < count($response); $i++){
                    if ($response[$i]->contour != null){
                        $contour = Contour::load($response[$i]->contour);

                        if (
                            $property_lat > 0 &&
                            $property_lng > 0 &&
                            Geo::containsLocation($contour->data, $property_lat, $property_lng)
                        ){
                            array_push($property_parsed, $response[$i]);
                        }
                    }
                    else{
                        array_push($property_parsed, $response[$i]);
                    }
                }

                $response = $property_parsed;
                $property_parsed = [];
            }
            
            if ($property_price != null && $property_currency != null){ // поиск по цене (с конвертацией валюты) (обязательно)
                $ratio1 = $currency->getRatio($property_currency);

                for ($i = 0; $i < count($response); $i++){
                    $price_from = $response[$i]->price_from;
                    $price_to = $response[$i]->price_to;
                    $ratio2 = $currency->getRatio($response[$i]->currency_id);
                    $price_from_converted = round($price_from/$ratio2*$ratio1);
                    $price_to_converted = round($price_to/$ratio2*$ratio1);
                    //return $price_converted;
                    //array_push($debuga, ["price_from" => $search->price_from, "price" => $price, "price_converted" => $price_converted, "currency" => $property_list[$i]->currency_id]);

                    if ($price_from_converted <= $property_price && $price_to_converted >= $property_price){
                        array_push($property_parsed, $response[$i]);
                    }
                }

                $response = $property_parsed;
                $property_parsed = [];
            }
            else{
                throw new Exception("Wrong price or currency", 402);
            }
            
            for ($i = 0; $i < count($response); $i++){ // отсев по типам (обязательно)
                $types_fit = 0;
                $street_fits = 0;
                $tmp_object = get_object_vars($response[$i]);
                $tmp_property_types = json_decode($tmp_object["property_types"]);
                $client_streets = json_decode($tmp_object["street"]);
                $client_streets_text = json_decode($tmp_object["street_text"]);
                
                for ($z = 0; $z < count($tmp_property_types); $z++){
                    $type = $tmp_property_types[$z];
                    
                    for ($c = 0; $c < count($property_types); $c++)
                        if ($property_types[$c] == $type)
                            $types_fit++;
                }
                
                for ($m = 0; $m < count($client_streets); $m++){
                    if ($property_street == $client_streets[$m] || Utils::isStringsSimilar($property_street_text, $client_streets_text[$m])){
                        $street_fits++;
                    }
                }
                
                if (
                    count($client_streets) === 0 || 
                    $tmp_object["street"] == "[]" || 
                    $tmp_object["street"] == null || 
                    $tmp_object["street"] == ""
                ){
                    $street_fits++;
                }
                
                if ($types_fit > 0 && $street_fits > 0){ //##############
                    array_push($property_parsed, $response[$i]);
                }
            }
            
            $response = $property_parsed;
            $property_parsed = [];
            
            if ($property_home_size != null && $property_home_dims != null){ // поиск по dimensions (с конвертацией) (не обязательно)
                $ratio1 = $dimensions->getRatio($property_home_dims);
                //$property_list2 = count($property_parsed) > 0 ? $property_parsed : $response;

                if (count($response) > 0){
                    $property_parsed = [];

                    for ($i = 0; $i < count($response); $i++){
                        if ($response[$i]->home_size_dims != null){
                            $home_size_from = $response[$i]->home_size_from;
                            $home_size_to = $response[$i]->home_size_to;
                            $home_ratio2 = $dimensions->getRatio($response[$i]->home_size_dims);
                            $home_size_from_converted = round($home_size_from/$ratio1*$home_ratio2);
                            $home_size_to_converted = round($home_size_to/$ratio1*$home_ratio2);
                            //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);

                            if ($home_size_from_converted <= $property_home_size && $home_size_to_converted >= $property_home_size){
                                array_push($property_parsed, $response[$i]);
                            }
                        }
                        else{
                            array_push($property_parsed, $response[$i]);
                        }
                    }

                    $response = $property_parsed;
                    $property_parsed = [];
                }
            }
            
            if ($property_lot_size != null && $property_lot_dims != null){ // поиск по dimensions (с конвертацией) (не обязательно)
                $ratio1 = $dimensions->getRatio($property_lot_dims);
                //$property_list2 = count($property_parsed) > 0 ? $property_parsed : $response;

                if (count($response) > 0){
                    $property_parsed = [];

                    for ($i = 0; $i < count($response); $i++){
                        if ($response[$i]->lot_size_dims != null){
                            $lot_size_from = $response[$i]->lot_size_from;
                            $lot_size_to = $response[$i]->lot_size_to;
                            $lot_ratio2 = $dimensions->getRatio($response[$i]->lot_size_dims);
                            $lot_size_from_converted = round($lot_size_from/$ratio1*$lot_ratio2);
                            $lot_size_to_converted = round($lot_size_to/$ratio1*$lot_ratio2);
                            //array_push($debuga, ["home_size_from" => $search->object_size_from, "home_size" => $home_size, "home_size_converted" => $home_size_converted, "home_dimension" => $property_list2[$i]->home_dims]);

                            if ($lot_size_from_converted <= $property_lot_size && $lot_size_to_converted >= $property_lot_size){
                                array_push($property_parsed, $response[$i]);
                            }
                        }
                        else{
                            array_push($property_parsed, $response[$i]);
                        }
                    }

                    $response = $property_parsed;
                    $property_parsed = [];
                }
            }
            
            $total_response_count = count($response);
            
            if (count($response) > 200){
                $response = array_slice($response, 0, 200);
            }
            
            $propertycomp->removeDeleted($property_id);
            $propertycomplist->createNew($property_id, $response);
            $response = [
                "data" => $response, 
                "total" => $total_response_count,
                "type" => "new"
            ];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    protected function parseComparisonForProperty($object){ // $object = property fields array
        $sql_query = "";
        $query_parameters = [];
        
        foreach ($object as $key => $val){ // перебираем поля недвижимости 
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
                        $sql_query .= " AND (neighborhood = ? OR neighborhood_text = ? OR neighborhood IS NULL)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["neighborhood_text"]);
                    break;
                    /*case "street": // улиц в клиенте может быть много. здесь нужен отдельный подход
                        $sql_query .= " AND street = ?";
                        array_push($query_parameters, $val);
                    break;*/
                    case "ascription":
                        $sql_query .= " AND ascription = ?";
                        array_push($query_parameters, $val);
                    break;
                    /*case "status": //нужно добавить поле status в клиента прежде чем искать
                        $val = json_decode(stripcslashes($val), true);
                        $sql_query .= " AND (statuses = ?";
                        array_push($query_parameters, $val[0]);

                        if (count($val) > 1)
                            for ($i = 1; $i < count($val); $i++){
                                array_push($query_parameters, $val[$i]);
                                $sql_query .= " OR statuses = ?";
                            }

                        $sql_query .= ")";
                    break;*/
                    case "status":
                        $sql_query .= " AND statuses = ?";
                        array_push($query_parameters, $val);
                    break;
                    case "furniture_flag"://##############
                        if ($val == 1){ // у недвижимости мебель есть
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag IS NULL OR furniture_flag = 2)";
                        }
                        if ($val == 3){ // мебель частично есть
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag IS NULL OR furniture_flag = 2)";
                        }
                        if ($val == 4){ // мебели опционально есть
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag = 0 OR furniture_flag IS NULL OR furniture_flag = 2)";
                        }
                        elseif ($val == 0){ // мебели нет
                            $sql_query .= " AND (furniture_flag = 0 OR furniture_flag IS NULL OR furniture_flag = 2)";
                        }
                        //array_push($query_parameters, $val);
                    break;
                    /*case "property": // нужен отдельный подход
                        $val = json_decode(stripcslashes($val), true);
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

                        $sql_query .= ")";
                    break;*/
                    /*case "price": // нужно делать через конвертацию валют на втором шаге
                        $sql_query .= " AND ? >= price_from AND ? <= price_to";  
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $val);
                    break;
                    case "currency_id":
                        $sql_query .= " AND currency_id = ?";
                        array_push($query_parameters, $val);
                    break;*/
                    /*case "history_type": // нужно разбираться, как эти поля сходятся на клиенте и проперти
                        if ($val == 0){ // 1 - last update, 2 - free from
                            $sql_query .= " AND (last_updated BETWEEN ? AND ? OR timestamp BETWEEN ? AND ?)";
                            array_push($query_parameters, $object["history_from"]);
                            array_push($query_parameters, $object["history_to"]);
                            array_push($query_parameters, $object["history_from"]);
                            array_push($query_parameters, $object["history_to"]);
                        }
                        elseif ($val == 1){ 
                            $sql_query .= " AND free_from BETWEEN ? AND ?";
                            array_push($query_parameters, $object["history_from"]);
                            array_push($query_parameters, $object["history_to"]);
                        }
                    break;
                    case "object_type":
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
                    case "age":
                        $sql_query .= " AND (? >= age_from OR age_from IS NULL)";
                        array_push($query_parameters, $val);
                    break;
                    case "floor_from":
                        $sql_query .= " AND ((? >= floor_from AND ? <= floor_to) OR (floor_from IS NULL AND floor_to IS NULL) OR (floor_from = 0 AND floor_to = 0))";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $val);
                    break;
                    case "rooms_count":
                        if ($object["bedrooms_count"] != null){
                            $sql_query .= " AND ((? >= rooms_from AND ? <= rooms_to) OR (rooms_from IS NULL AND rooms_to IS NULL) OR (rooms_from = 0 AND rooms_to = 0))";
                        }
                        else{
                            $sql_query .= " AND ((? >= rooms_from AND ? <= rooms_to AND rooms_type = 1) OR (rooms_from IS NULL AND rooms_to IS NULL) OR (rooms_from = 0 AND rooms_to = 0))";
                        }
                            
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $val);
                    break;
                    case "bedrooms_count":
                        if ($object["rooms_count"] != null){
                            $sql_query .= " AND ((? >= rooms_from AND ? <= rooms_to) OR (rooms_from IS NULL AND rooms_to IS NULL) OR (rooms_from = 0 AND rooms_to = 0))";
                        }
                        else{
                            $sql_query .= " AND ((? >= rooms_from AND ? <= rooms_to AND rooms_type = 2) OR (rooms_from IS NULL AND rooms_to IS NULL) OR (rooms_from = 0 AND rooms_to = 0))";
                        }
                        
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $val);
                    break;
                    case "project_id":
                        $sql_query .= " AND (project_id = ? OR project_id IS NULL OR project_id = 0)";
                        array_push($query_parameters, $val);
                    break;
                    case "parking_flag":
                        if ($val == 0)
                            $sql_query .= " AND parking_flag <> 1";
                    break;
                    case "air_cond_flag":
                        if ($val == 0)
                            $sql_query .= " AND air_cond_flag <> 1";
                    break;
                    case "elevator_flag":
                        if ($val == 0)
                            $sql_query .= " AND elevator_flag <> 1";
                    break;
                    case "facade_flag":
                        if ($val == 0)
                            $sql_query .= " AND front_flag <> 1";
                    break;
                    case "last_floor_flag":
                        if ($val == 1)
                            $sql_query .= " AND no_last_floor_flag <> 1";
                    break;
                    case "ground_floor_flag":
                        if ($val == 1)
                            $sql_query .= " AND no_ground_floor_flag <> 1";
                    break;
                    /*case "home_dims":
                        $sql_query .= " AND (home_size_dims IS NOT NULL AND home_size_dims = ? AND home_size_from <= ? AND home_size_to >= ?)";
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["home_size"]);
                        array_push($query_parameters, $object["home_size"]);
                    break;
                    case "lot_dims":
                        if ($object["home_dims"] != NULL)
                            $sql_query .= " OR lot_size_dims IS NOT NULL AND lot_size_dims = ? AND lot_size_from <= ? AND lot_size_to >= ?";
                        else $sql_query .= " AND lot_size_dims = ? AND lot_size_from <= ? AND lot_size_to >= ?";
                        
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["lot_size"]);
                        array_push($query_parameters, $object["lot_size"]);
                    break;*///##############
                }
            }
        } 
        
        return ["query" => $sql_query, "parameters" => $query_parameters];
    }
    
    public function getPlaceByPlaceId($place_id){
        $jsonUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='.$place_id.'&key=AIzaSyDfK77teqImteAigaPtfkNZ6CG8kh9RX2g';
        $geocurl = curl_init();
        
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $response = curl_exec($geocurl);
        
        /* logging maps */
        Log::i("Client.class.php, getPlaceByPlaceId(), place", $place_id);
        /****************/
        
        curl_close($geocurl);
        $decoded = json_decode($response, true);

        return json_encode($decoded["result"]["address_components"][0]["long_name"]);
    }
    
    public function delete($clients){
        $object = json_decode($clients, true);
        $permission = new Permission();
        
        try{
            if (!$permission->is("delete_card")){
                throw new Exception("Deleting cards forbidden!", 501);
            }
            
            for ($i = 0; $i < count($object); $i++){       
                $client = $this->load($object[$i]["card"]);
                
                if ($_SESSION["user"] != 1){ // здесть надо будет переписать на редактирование по типу АДМИН а не по id админа
                    throw new Exception("Access forbidden", 501);
                }
                    
                $client->deleted = 1;
                $client->save();
            }
            
            $response = 0;
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getPropositions($id){
        $id = intval($id);
        $query = DB::createQuery()->select('*')->where('client=? AND deleted=0'); 
        return Propose::getList($query, [$id]);
    }
}
