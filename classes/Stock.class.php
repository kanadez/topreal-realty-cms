<?php

use Database\TinyMVCDatabase as DB;

class Stock extends Database\TinyMVCDatabaseObject{
    const tablename  = 'stock_changed';
    
    public function checkPayed(){ // проверяет, куплен ли сток у агентства
        global $agency;
        
        $agency_to_check = $agency->get();
        return $agency_to_check->stock;
    }
    
    public function setPayed($agency, $stock_value){
        global $defaults;
        
        $query = DB::createQuery()->select('id')->where('agency = ?'); 
	$agent_defaults = $defaults->getList($query, [intval($agency)]);
        
        for ($i = 0; $i < count($agent_defaults); $i++){
            $agent_default = $defaults->load($agent_defaults[$i]->id);
            $agent_default->search_stock = $stock_value;
            $agent_default->save();
        }
    }
    
    public function createNew($property_id, $property_data){
        global $agency, $synonim;
        
        $object = json_decode($property_data, true);       
	$property = $this->create();
        
        foreach ($object as $key => $val) {
            if ($key == "types"){
                $property->type1 = $val[0];
                $property->type2 = $val[1];
                $property->type3 = $val[2];
                $property->type4 = $val[3];
            }
            
            if (is_array($val)){
                $val = json_encode($val);
            }
            
            if (
                    $key != "new_street_synonim" && 
                    $key != "new_hood_synonim" &&
                    $key != "stock_type"
            ){
                $property->$key = $val;
            }
        }
        
        if ($object["new_street_synonim"] != null){
            $property->street = $synonim->createNew($object["new_street_synonim"]);
            $property->lat = 0;
            $property->lng = 0;
        }
        else{
            $latlng = Geo::getTrueLocation($property->street, $property->house_number, $property->statuses);
            $property->lat = $latlng["lat"];
            $property->lng = $latlng["lng"];
        }
        
        if ($object["new_hood_synonim"] != null){
            $property->neighborhood = $synonim->createNew($object["new_hood_synonim"]);
        }
        
        $property->street_text = $property->street != null ? Geo::getFullAddress($property->street) : null;
        $property->neighborhood_text = $property->neighborhood != null ? Geo::getFullAddress($property->neighborhood) : null;
        $property->city_text = $property->city != null ? Geo::getFullAddress($property->city) : null;
        $property->region_text = $property->region != null ? Geo::getFullAddress($property->region) : null;
        $property->country_text = $property->country != null ? Geo::getFullAddress($property->country) : null;
        
        $property->stock_id = intval($property_id);
        $property->agency = $agency->getId();
        $property->agent_id = $_SESSION["user"];
        $property->agent_editing = -1;
        $property->temporary = 0; 
        $property->timestamp = time(); 
        $property->last_updated = time(); 
        $response = $property->save();
        $this->removeHistory($property_id, $response);
        
        return $response;
    }
    
    public function set($property_data, $stock_id){ // сохраняет изменненый сток. property_id - ИД изменного стока, property_data - сами данные недвижимости  и stock_id - ИД стока
        global $synonim, $agency;
        
        $object = json_decode($property_data, true);
        $query = DB::createQuery()->select('*')->where('stock_id=? AND agency=?'); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
        $property = $properties[0];
        
        $this->savePriceHistory(intval($stock_id), $object["price"], $property->price, $property->currency_id);
        
        foreach ($object as $key => $val) {
            if ($key == "types"){
                $property->type1 = $val[0];
                $property->type2 = $val[1];
                $property->type3 = $val[2];
                $property->type4 = $val[3];
            }
            
            if (is_array($val)){
                $val = json_encode($val);
            }
            
            if (
                    $key != "new_street_synonim" && 
                    $key != "new_hood_synonim" &&
                    $key != "stock_type"
            ){
                $property->$key = $val;
            }
        }
        
        if ($object["new_street_synonim"] != null){
            $property->street = $synonim->createNew($object["new_street_synonim"]);
            $property->lat = 0;
            $property->lng = 0;
        }
        else{
            $latlng = Geo::getTrueLocation($property->street, $property->house_number, $property->statuses);
            $property->lat = $latlng["lat"];
            $property->lng = $latlng["lng"];
        }
        
        if ($object["new_hood_synonim"] != null){
            $property->neighborhood = $synonim->createNew($object["new_hood_synonim"]);
            //$property->lat = 0;
            //$property->lng = 0;
        }
        
        $property->street_text = $property->street != null ? Geo::getFullAddress($property->street) : null;
        $property->neighborhood_text = $property->neighborhood != null ? Geo::getFullAddress($property->neighborhood) : null;
        $property->city_text = $property->city != null ? Geo::getFullAddress($property->city) : null;
        $property->region_text = $property->region != null ? Geo::getFullAddress($property->region) : null;
        $property->country_text = $property->country != null ? Geo::getFullAddress($property->country) : null;
        
        $property->agent_editing = -1;
        $property->temporary = 0;
        $property->deleted = 0;
        
        if ($agency->getId() != 1){ // если не первое агентство
            $property->last_updated = time();
        }
        
        return $property->save(); 
    }
    
    public function getDataOnly($stock_id){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('stock_id=? AND deleted=0 AND agency=? AND temporary=0'); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
        
        if (count($properties) > 0){
            return $properties[0];
        }
        else{
            return FALSE;
        }
    }
    
    public function getIDonly($stock_id){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('stock_id=? AND deleted=0 AND agency=? AND temporary=0')->order("timestamp DESC"); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
        
        if (count($properties) > 0){
            return $properties[0]->id;
        }
        else{
            return 0;
        }
    }
    
    public function getChanged($stock_id){ //  отдает именно проекцию стока, без подмены данных
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('stock_id=? AND deleted=0 AND agency=? AND temporary=0')->order("timestamp DESC"); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
        
        if (count($properties) > 0){
            return $this->load($properties[0]->id);
        }
        else{
            return FALSE;
        }
    }
    
    public function exist($stock_id){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('stock_id=? AND deleted=0 AND agency=? AND temporary=0'); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
        
        if (count($properties) > 0){
            return TRUE;
        }
        else{
            return FALSE;
        }
    }
    
    public function get($stock_id){ // $stock_changed_id - id проекции, $stock_id - id оригинала
        global $agency;
        
        $query = DB::createQuery()->select('*')->where('stock_id=? AND deleted=0 AND agency=? AND temporary=0'); 
	$properties = $this->getList($query, [intval($stock_id), $agency->getId()]);
	$property = $properties[0];
        
        $property->id = intval($stock_id);
        $property->history = $this->getHistory(intval($stock_id));
        $property->photos = $this->getPhotos(intval($stock_id));
        $property->docs = $this->getDocs(intval($stock_id));
        $property->last_propose = $this->getLastPropose(intval($stock_id));
        $property->price_before = $this->getPriceBefore(intval($stock_id));
        
        return $property;
    }
    
    public function getHistory($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $stock_changed_id = $this->getIDOnly($property_id);
        
        $query = DB::createQuery()->select('a.*, b.name')->join('inner', 'user', 'a.user=b.id')->where('a.deleted = 0 AND stock=1 AND stock_changed=? AND object_id=? AND object_type=1 AND changes<>"{}"')->order("timestamp DESC LIMIT 20"); 
	$history = History::getList($query, [$stock_changed_id, intval($property_id)]);
        
        try{
            if (count($history) === 0){
                throw new Exception("Property has no history", 502);
            }
            
            $response = $history;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getPhotos($property_id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        $query = DB::createQuery()->select('*')->where('stock=1 AND property=? AND stock_changed=? AND deleted=0'); 
	$photos = Photo::getList($query, [intval($property_id), $stock_changed_id]);
        
        try{
            if (count($photos) === 0){
                throw new Exception("Property has no photos", 502);
            }
            
            $response = $photos;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getDocs($property_id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        $query = DB::createQuery()->select('*')->where('stock=1 AND property=? AND stock_changed=? AND deleted=0'); 
	$docs = PropertyDoc::getList($query, [intval($property_id), $stock_changed_id]);
        
        try{
            if (count($docs) === 0){
                throw new Exception("Property has no docs", 502);
            }
            
            $response = $docs;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function resetDocs($property_id){ // вытаскивает из таблицы доки стока и кладет в проекцию при ее создании
        $query = DB::createQuery()->select('*')->where('stock=0 AND property=? AND deleted=0'); 
	$docs = PropertyDoc::getList($query, [intval($property_id)]);
        
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        for ($i = 0; $i < count($docs); $i++){
            $doc = PropertyDoc::load($docs[$i]->id);
            $doc->stock = 1;
            $doc->stock_changed = $stock_changed_id;
            $doc->save();
        }
    }
    
    public function resetPhotos($property_id){ // вытаскивает из таблицы фотки стока и копирует в проекцию при ее создании
        $query = DB::createQuery()->select('*')->where('stock=0 AND property=? AND deleted=0'); 
	$photos = Photo::getList($query, [intval($property_id)]);
        
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        for ($i = 0; $i < count($photos); $i++){
            $photo = Photo::load($photos[$i]->id);
            $new_photo = Photo::create([
                "stock" => 1, 
                "stock_changed" => $stock_changed_id,
                "image" => $photo->image,
                "type" => $photo->type,
                "property" => $photo->property
            ]);
            $new_photo->save();
        }
    }
    
    private function getLastPropose($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        $query = DB::createQuery()->select('agreement, timestamp')->where('stock=1 AND property=? AND stock_changed=? AND deleted=0')->order("timestamp DESC"); 
	$propose_list = Propose::getList($query, [intval($property_id), $stock_changed_id]);
        
        try{
            if (count($propose_list) === 0){
                throw new Exception("Property was not proposed anytime", 502);
            }
            
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
    
    private function getPriceBefore($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $stock_changed_id = $this->getIDOnly(intval($property_id));
        
        $query = DB::createQuery()->select('price, currency, timestamp')->where('stock=1 AND property=? AND stock_changed=?')->order("timestamp DESC"); 
	$price_list = Price::getList($query, [intval($property_id), $stock_changed_id]);
        
        try{
            if (count($price_list) === 0){
                throw new Exception("Property has no price history", 502);
            }
            
            $response = $price_list[0];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    private function savePriceHistory($property, $new_price, $old_price, $currency){
        $stock_changed_id = $this->getIDOnly(intval($property));
        
        if ($new_price != $old_price){
            $price_parameters = [
                "property" => $property,
                "price" => $old_price,
                "currency" => $currency,
                "timestamp" => time(),
                "stock" => 1,
                "stock_changed" => $stock_changed_id
            ];
            $price = Price::create($price_parameters); 
            $price->save();
        }
    }
    
    public function removeAll($stock_id){
        $query = DB::createQuery()->select('id')->where('stock_id=? AND deleted=0 AND temporary=0'); 
	$properties = $this->getList($query, [intval($stock_id)]);
        
        for ($i = 0; $i < count($properties); $i++){
            $property = $this->load($properties[$i]->id);
            $property->deleted = 1;
            $property->save();
        }
    }
    
    private function removeHistory($property, $stock_changed){
        $query = DB::createQuery()->select('id')->where('object_type = 1 AND object_id = ? AND stock = 0 AND user = ?'); 
	$history_rows = History::getList($query, [$property, $_SESSION["user"]]);
        
        for ($i = 0; $i < count($history_rows); $i++){
            $row = History::load($history_rows[$i]->id);
            //$row->deleted = 1;
            $row->stock = 1;
            $row->stock_changed = $stock_changed;
            $row->save();
        }
    }
    
    public function copyHistoryToOriginal($property){
        $query = DB::createQuery()->select('id')->where('object_type = 1 AND object_id = ? AND stock = 1 AND user = ?'); 
	$history_rows = History::getList($query, [$property, $_SESSION["user"]]);

        for ($i = 0; $i < count($history_rows); $i++){
            $row = History::load($history_rows[$i]->id);
            $row->stock = 0;
            $row->stock_changed = 0;
            $row->save();
        }
    }
}
