<?php

include(dirname(__FILE__).'/Property.data.php');
include(dirname(__FILE__).'/Search.data.php');

use Database\TinyMVCDatabase as DB;

class Property extends Database\TinyMVCDatabaseObject{
    const tablename  = 'property';
    
    function save( $dsn='default' )
    {
   	$db = DB::getInstance($dsn); 
        $id = $db->storeObject( $this );
        
        ContourProperty::addByProperty($id);
        
	return $id; 
    }
    
    public function createNew($property_id, $property_data){
        global $agency, $synonim;
        
        $property_id = intval($property_id);
        $object = json_decode($property_data, true);       
	$property = $this->load($property_id);
        
        foreach ($object as $key => $val) {
            if ($key == "types"){
                $property->type1 = $val[0];
                $property->type2 = $val[1];
                $property->type3 = $val[2];
                $property->type4 = $val[3];
            }
            
            if (is_array($val))
                $val = json_encode($val);
            
            if (
                    $key != "new_street_synonim" && 
                    $key != "new_hood_synonim" &&
                    $key != "stock_type"
            ){
                $property->$key = $val;
            }
        }
        
        if ($object["stock_type"] != null){
            $property->statuses = $object["stock_type"];
        }
        
        if ($object["new_street_synonim"] != null){
            $property->street = $synonim->createNew($object["new_street_synonim"], $property->city);
            $property->lat = 0;
            $property->lng = 0;
        }
        else{
            $latlng = Geo::getTrueLocation($property->street, $property->house_number, $property->statuses);
            $property->lat = $latlng["lat"];
            $property->lng = $latlng["lng"];
        }
        
        if ($object["new_hood_synonim"] != null){
            $property->neighborhood = $synonim->createNew($object["new_hood_synonim"], $property->city);
        }
        
        $property->street_text = $property->street != null ? Geo::getFullAddress($property->street) : null;
        $property->neighborhood_text = $property->neighborhood != null ? Geo::getFullAddress($property->neighborhood) : null;
        $property->city_text = $property->city != null ? Geo::getFullAddress($property->city) : null;
        $property->region_text = $property->region != null ? Geo::getFullAddress($property->region) : null;
        $property->country_text = $property->country != null ? Geo::getFullAddress($property->country) : null;
        
        $property->agency = $agency->getId(); 
        $property->agent_id = $_SESSION["user"];
        $property->agent_editing = -1;
        $property->temporary = 0; 
        
        $property->timestamp = time(); 
        $property->last_updated = time(); 
        $this->setHistory($property_id, '{"created":{"old":'.time().',"new":'.time().'}}');
        return $property->save();            
    }
    
    public function createTemporary(){
        global $agency;
        $permission = new Permission();
        
        try{
            if (!$permission->is("new_card")){
                throw new Exception("Creating card forbidden!", 501);
            }
            
            $new_property = $this->create(["agent_id" => $_SESSION["user"], "agency" => $agency->getId()]);
            $response = $new_property->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function set($property_id, $property_data, $collected){
        global $synonim, $stock, $agency;
        $first_stock_changing = 0; // флаг создания первой проекции карточки при переводе в сток
        
        $property_id = intval($property_id);
        $object = json_decode($property_data, true);
	$property = $this->load($property_id);
        
        if ($agency->getId() != 1){ // если НЕ первое агентство
            if ($property->stock == 1 && $object["stock"] == 0 && $property->statuses != 0){ // если удаляем сток и статус != актуально
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
                    $query = DB::createQuery()->select('*')->where('stock_changed = ?'); 
                    $response = Photo::getList($query, [$my_copy->id]);

                    for ($i = 0; $i < count($response); $i++){
                        $photo = get_object_vars($response[$i]);  
                        $photo["property"] = $property_id;
                        $newphoto = Photo::create(array_slice($photo, 1));
                        $newphoto->stock = 0;
                        $newphoto->stock_changed = 0;
                        $newphoto->save();
                    }

                    // copying docs
                    $query = DB::createQuery()->select('*')->where('stock_changed = ?'); 
                    $response = PropertyDoc::getList($query, [$my_copy->id]);

                    for ($i = 0; $i < count($response); $i++){
                        $doc = get_object_vars($response[$i]);  
                        $doc["property"] = $property_id;
                        $newdoc = PropertyDoc::create(array_slice($doc, 1));
                        $newdoc->stock = 0;
                        $newdoc->stock_changed = 0;
                        $newdoc->save();
                    }
                } 
                else{ // если нет копий
                    
                }
            }
            elseif ($property->stock == 1 && $object["stock"] == 0 && $property->statuses == 0){ // если статус == акутально то пропускаем
                return $property->id;
            }
            elseif ($property->stock == 1 && $property->stock_changed == 0 && $collected == 0){ // забрасываем в cток, причем НЕ из коллектора
                $stock->createNew($property_id, $property_data);
                $property->stock_changed = 1;
                return $property->save();
            }
            elseif ($property->stock == 1 && $property->stock_changed != 0){ // модифицируем копию стока
                if (!$stock->exist($property_id)){
                    $stock->createNew($property_id, $property_data);
                }
                else{
                    $stock->set($property_data, $property_id);
                }

                return $property->save();
            }
            elseif ($property->stock == 0 && $object["stock"] == 1){ // если перебрасыаем в сток, может даже из коллектора
                $stock->createNew($property_id, $property_data);
                $first_stock_changing = 1;
                $property->stock_changed = 1;
                $object["statuses"] = $object["stock_type"];
            }
        }
        else{
            unset($object["agent_id"]);
            
            if ($property->stock == 1 && $stock->exist($property_id)){ 
                return $stock->set($property_data, $property_id);
            }
        }
        
        $this->savePriceHistory($property_id, $object["price"], $property->price, $property->currency_id);
        
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
            $property->street = $synonim->createNew($object["new_street_synonim"], $property->city);
            $property->lat = 0;
            $property->lng = 0;
        }
        else{
            $latlng = Geo::getTrueLocation($property->street, $property->house_number, $property->statuses);
            $property->lat = $latlng["lat"];
            $property->lng = $latlng["lng"];
        }
        
        if ($object["new_hood_synonim"] != null){
            $property->neighborhood = $synonim->createNew($object["new_hood_synonim"], $property->city);
            //$property->lat = 0;
            //$property->lng = 0;
        }
        
        if ($first_stock_changing === 1){
            $property->free_number = null;
            $stock->resetDocs($property->id);
            $stock->resetPhotos($property->id);
        }
        
        if ($property->external_id != null){
            PropertyExternal::createLink($property, $property->external_id);
        }
        
        if ($property->external_id_hex != null){
            PropertyExternal::createLink($property, $property->external_id_hex);
        }
        
        if ($property->external_id_winwin != null){
            PropertyExternal::createLink($property, $property->external_id_winwin);
        }
        
        $property->street_text = $property->street != null ? Geo::getFullAddress($property->street) : null;
        $property->neighborhood_text = $property->neighborhood != null ? Geo::getFullAddress($property->neighborhood) : null;
        $property->city_text = $property->city != null ? Geo::getFullAddress($property->city) : null;
        $property->region_text = $property->region != null ? Geo::getFullAddress($property->region) : null;
        $property->country_text = $property->country != null ? Geo::getFullAddress($property->country) : null;
        
        $property->agent_editing = -1;
        //$property->agent_id = $_SESSION["user"];
        $property->temporary = 0;
        
        if ($agency->getId() != 1){ // если не первое агентство
            $property->last_updated = time();
        }
        return $property->save();        
    }

    public function get($property_id, $mode = null){
        global $stock, $agency, $property_event;
        
        $property_id = intval($property_id);
	$property = $this->load($property_id);
        
        try{
            if ($property === FALSE){
                throw new Exception("Property not exists at all", 503);
            }
            
            if ($property->stock == 0 && $agency->getId() != $property->agency){ // чужая, не сток
                throw new Exception("Property not belongs your agency", 503);
            }
            
            if ($property->stock == 1 && $mode == "view_stock"){
                $property->history = $this->getHistory($property_id);
                $property->photos = $this->getPhotos($property_id);
                $property->price_before = $this->getPriceBefore($property_id);
                
                $response = $property;
            }
            elseif ($property->stock == 1 && $property->stock_changed != 0 && $stock->exist($property_id)){ // если сток(свой или чужой), своя копия
                $stock_changed = $stock->get($property_id);
                $stock_changed->stock_is_actual = $property->statuses == 0 ? 1 : 0;
                $stock_changed->foreign_stock_changed = $property->agency != $agency->getId() ? 1 : 0;
                //$stock_changed->foreign_stock = 0;
                /*$stock_changed->history = $stock->getHistory($property_id);
                $stock_changed->photos = $this->getPhotos($property_id);
                $stock_changed->docs = $this->getDocs($property_id);
                $stock_changed->last_propose = $this->getLastPropose($property_id);
                $stock_changed->price_before = $this->getPriceBefore($property_id);*/
                $response = $stock_changed;
            }
            else{ // своя, не сток, просто недвижимость
                $property->history = $this->getHistory($property_id);
                $property->photos = $this->getPhotos($property_id);
                $property->docs = $this->getDocs($property_id);
                $property->last_propose = $this->getLastPropose($property_id);
                $property->price_before = $this->getPriceBefore($property_id);
                //$property->foreign_stock = 1;
                $response = $property;
            }
            
            if ($response->stock == 1 && $agency->getId() != $response->agency){ // если чужой сток
                $response->foreign_stock = 1;
                
                if ($response->statuses == 7 || $response->statuses == 5){
                    $response->house_number = null;
                    $response->flat_number = null;
                    $response->contact1 = $agency->getPhone($response->agency);
                    $response->contact1_remark = null;
                    $response->contact2 = null;
                    $response->contact2_remark = null;
                    $response->contact3 = null;
                    $response->contact3_remark = null;
                    $response->contact4 = null;
                    $response->contact4_remark = null;
                }
            }
            else{
                $response->foreign_stock = 0;
            }
            
            $response->im_editor = $response->agent_editing == $_SESSION["user"] ? true : false;
            $response->agents_list = $agency->getAgentsList();
            $response->external_new = $this->getExternalNew($response);
            $response->events = $property_event->getAll($property_id);
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function copy($property_id, $ascription){
        global $stock, $agency;
        
        $property_id = intval($property_id);
        $ascription = intval($ascription);
	$property = $this->load($property_id);
        
        if ($property->stock == 1 && $property->stock_changed != 0){
            $stock_changed = $stock->getDataOnly($property_id);
            $property = $stock_changed != FALSE ? $stock_changed : $property;
        }
         
        $newobject_props = get_object_vars($property);
        $newobject_props["agent_id"] = $_SESSION["user"];
        $newobject_props["agency"] = $agency->getId();
        $newobject_props["ascription"] = $ascription;
        $newobject_props["last_updated"] = time();
        $newobject_props["timestamp"] = time();
        $newobject_props["temporary"] = 1;
        $newobject_props["price"] = 0;
        $newobject = $this->create(array_slice($newobject_props, 3));
        $new_property_id = $newobject->save();
        
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
        
        return $new_property_id;
    }
    
    public function tryEdit($property_id){
        global $stock, $agency;
        
        $property_id = intval($property_id);
	$property = $this->load($property_id);
        
        if ($property->stock == 1 && $property->stock_changed != 0){
            $stock_changed = $stock->getDataOnly($property_id);
            $property = $stock_changed != FALSE ? $stock_changed : $property;
        }
        
        $permission = new Permission();
        
        try{
            if ($property === FALSE){
                throw new Exception("Property not exists at all", 503);
            }
            
            if ($property->agency != $agency->getId() && $property->stock == 0){
                throw new Exception("Property is from foreign agency, editing forbidden!", 503);
            }
            
            if (!$permission->is("edit")){
                throw new Exception("Editing property forbidden!", 501);
            }
            
            if (!$permission->is("edit_another_card") && $_SESSION["user"] != $property->agent_id){
                throw new Exception("Editing foreign property forbidden!", 501);
            }
            
            if ($property->agent_editing != -1 && $property->agent_editing != $_SESSION["user"]){
                $user_id = intval($property->agent_editing);
                $user = User::load($user_id);
                throw new Exception("Property is editing by ".$user->name." now", 505);
            }
            
            if ($property->stock == 0 || $stock_changed != FALSE){
                $property->agent_editing = $_SESSION["user"];
                $property->save();
            }
            
            $response = 1;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function unlock($property_id){
        global $stock;
        
	$property = $this->load(intval($property_id));
        
        if ($property->stock == 1 && $property->stock_changed != 0){
            $stock_changed = $stock->getDataOnly(intval($property_id));
            $property = $stock_changed != FALSE ? $stock_changed : $property;
        }
        
        if ($property->agent_editing == $_SESSION["user"]){
            $property->agent_editing = -1;
            $property->save();
            $response = 1;
        }
        else $response = 0;
        
        return $response;
    }
    
    public function saveContactRemark($property_id, $parameter, $value){
        global $agency, $stock;
        
        try{
            $property = $this->load(intval($property_id));
            
            if ($property->agency != $agency->getId() && !$stock->exist($property->id)){
                throw new Exception("Access forbidden for saving contact remark", 501);
            }
            
            if ($stock->exist($property->id)){
                $stock_changed = $stock->getChanged($property->id);
                $stock_changed->$parameter = $value;
                $response = $stock_changed->save();
            }
            else{
                $property->$parameter = $value;
                $response = $property->save();
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;          
    }

    public function savePriceHistory($property, $new_price, $old_price, $currency){
        if ($new_price != $old_price){
            $price_parameters = [
                "property" => $property,
                "price" => $old_price,
                "currency" => $currency,
                "timestamp" => time()
            ];
            $price = Price::create($price_parameters); 
            $price->save();
        }
    }
    
    private function getPriceBefore($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $property_id = intval($property_id);
        $query = DB::createQuery()->select('price, currency, timestamp')->where('stock=0 AND property=?')->order("timestamp DESC"); 
	$price_list = Price::getList($query, [$property_id]);
        
        try{
            if (count($price_list) === 0)
                throw new Exception("Property has no price history", 502);
            
            $response = $price_list[0];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }

    public function propose($property_id, $agreement_num){
        global $agency, $stock;
        
        $stock_changed_id = $stock->getIDOnly(intval($property_id));
        $property_object = $this->load($property_id);
        //$agreement_num = intval($agreement_num);
        $parameters = [
            "property" => intval($property_id),
            "agreement" => uniqid(), // в старом коде именно $agreement_num клался сюда
            "user" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "timestamp" => time(),
            "stock" => $property_object->stock,
            "stock_changed" => $stock_changed_id
        ];
        $object = Propose::create($parameters); 
        $history_data = json_encode(["last_proposed" => ["old" => [$object->timestamp, $object->agreement], "new" => ""]]);
        $this->setHistory(intval($property_id), $history_data);
        return $object->save();       
    }
    
    private function getLastPropose($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $property_id = intval($property_id);
        $query = DB::createQuery()->select('agreement, timestamp')->where('stock=0 AND property=? AND deleted=0')->order("timestamp DESC"); 
	$propose_list = Propose::getList($query, [$property_id]);
        
        try{
            if (count($propose_list) === 0)
                throw new Exception("Property was not proposed anytime", 502);
            
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
    
    public function setHistory($property_id, $history_data){
        global $stock;
        
        $property_object = $this->load(intval($property_id));
        $stock_changed = $stock->getIDonly(intval($property_id));
        $parameters = [
            "object_type" => 1,
            "stock" => $property_object->stock,
            "stock_changed" => $stock_changed,
            "object_id" => $property_id,
            "changes" => $history_data,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ];
        $object = History::create($parameters); 
        return $object->save();       
    }
    
    public function setStockHistory($property_id, $history_data){
        $property_object = $this->load(intval($property_id));
        $parameters = [
            "object_type" => 1,
            "object_id" => $property_id,
            "changes" => $history_data,
            "user" => $_SESSION["user"],
            "timestamp" => time()
        ];
        $object = History::create($parameters); 

        return $object->save();       
    }
    
    public function getHistory($property_id){ // вытаскивает из таблицы history все записи истории по Id объекта недвижимости
        $property_id = intval($property_id);
        $query = DB::createQuery()->select('a.*, b.name')->join('inner', 'user', 'a.user=b.id')->where('a.deleted = 0 AND stock=0 AND object_id=? AND object_type=1 AND changes<>"{}"')->order("timestamp DESC LIMIT 20"); 
	$history = History::getList($query, [$property_id]);
                    
        try{
            if (count($history) === 0)
                throw new Exception("Property has no history", 502);
            
            $response = $history;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getHistoryAjax($property_id){
        global $stock, $agency;
        $property = $this->load(intval($property_id));
        
        try{
            if ($property === FALSE){
                throw new Exception("Property not exists at all", 503);
            }
            
            if ($property->stock == 0 && $agency->getId() != $property->agency){ // чужая, не сток
                throw new Exception("Property not belongs your agency", 503);
            }
            
            if ($property->stock == 1 && $property->stock_changed != 0 && $stock->exist($property_id)){ // если сток(свой или чужой), своя копия
                $response = $stock->getHistory($property_id);
            }
            else{ // своя, не сток, просто недвижимость
                $response = $this->getHistory($property_id);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getDocs($property_id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $property_id = intval($property_id);
        $query = DB::createQuery()->select('*')->where('stock=0 AND property=? AND deleted=0')->order("id DESC"); 
	$docs = PropertyDoc::getList($query, [$property_id]);
        
        try{
            if (count($docs) === 0)
                throw new Exception("Property has no docs", 502);
            
            $response = $docs;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getPhotos($property_id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $property_id = intval($property_id);
        $query = DB::createQuery()->select('*')->where('stock=0 AND property=? AND deleted=0')->order("id DESC"); 
	$photos = Photo::getList($query, [$property_id]);
        
        try{
            if (count($photos) === 0)
                throw new Exception("Property has no photos", 502);
            
            $response = $photos;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function removePhoto($id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $id = intval($id);
        $photo = Photo::load($id);
        $permission = new Permission();
        
        try{
            if (!$permission->is("delete_picture")){
                throw new Exception("Removing picture forbidden!", 501);
            }
            
            if ($photo == FALSE)
                throw new Exception("Photo not exists", 503);
            
            $photo->deleted = 1; 
            $photo->save();
            $response = $photo->image;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function removeDoc($id){ 
        $id = intval($id);
        $doc = PropertyDoc::load($id);
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
                $agreement->deleted = 1;
                $agreement->save();
            }
            
            $doc->deleted = 1; 
            $response = $doc->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function restorePhoto($id){ // вытаскивает из таблицы photo фотки недвижмости по его ID
        $id = intval($id);
        $photo = Photo::load($id);
        $permission = new Permission();
        
        try{
            if (!$permission->is("delete_picture")){
                throw new Exception("Removing picture forbidden!", 501);
            }
            
            if ($photo == FALSE)
                throw new Exception("Photo not exists", 503);
            
            $photo->deleted = 0; 
            $response = $photo->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function restoreDoc($id){ 
        $id = intval($id);
        $doc = PropertyDoc::load($id);
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
    
    public function search($search_id){
        // здесь будет код, который по строковому шаблону имени из параметра и пользователю из сессии выдирает из базы все поиски
        global $property_data;
        global $search_data;
        global $query_form_data;
        global $currency_data;
        
        for ($i = 0; $i < count($property_data); $i++){
            $property_data[$i]["aPhotos"] = $this->getPhotos($i);
        }
        
        $response = [
            "aPropertyList" => $property_data,
            "aSearchConditions" => [
                "aPropertyTypes" => $search_data[$search_id]["aPropertyTypes"],
                "iRoomsFrom" => $search_data[$search_id]["iRoomsFrom"],
                "iRoomsTo" => $search_data[$search_id]["iRoomsTo"],
                "iHomeSizeFrom" => $search_data[$search_id]["iHomeSizeFrom"],
                "iHomeSizeTo" => $search_data[$search_id]["iHomeSizeTo"],
                "sCity" => $search_data[$search_id]["_sCityTitle"],
                "iLat" => $search_data[$search_id]["_iLat"],
                "iLng" => $search_data[$search_id]["_iLng"],
                "iPriceTo" => $search_data[$search_id]["iPriceTo"],
                "iCurrencyId" => $search_data[$search_id]["iCurrencyId"]
            ],
            "aPropertyTypes" => $query_form_data["property_type"],
            "aCurrencyList" => $currency_data
        ];
        
        return $response;
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
        Log::i("Property.class.php, getPlaceByPlaceId(), place", $place_id);
        /****************/
        
        curl_close($geocurl);
        $decoded = json_decode($response, true);

        return json_encode($decoded["result"]["address_components"][0]["long_name"]);
    }
    
    public function getPlaceIdByAddress($address){
        $jsonUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&sensor=false";

        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        
        /* logging maps */
        Log::i("Property.class.php, getPlaceIdByAddress(), geocode", $address);
        /****************/

        return $geofile;
    }

    public function getFormOptions(){
        global $property_form_data;
        
        $property_form_data["currency"] = Currency::getList();
        $property_form_data["dimension"] = Dimensions::getList();
        return $property_form_data;
    }
    
    public function getListByClient($client_id, $mode = null, $from = null){
        global $agency, $currency, $dimensions, $defaults, $stock, $clientcomplist, $clientcomp, $utils;
        
        $client_id = intval($client_id);
        
        if ($clientcomplist->getLastDate($client_id) != null && $mode != "new"){ // type = last, получаем сохраненный ранее список сопоставления
            return $clientcomplist->getProperties($client_id);
        }
        
        $client = Client::load($client_id);    
        $object = get_object_vars($client);
        $client_property_types = json_decode($object["property_types"]);
        $client_ascription = json_decode($object["ascription"]);
        $client_streets = json_decode($object["street"]);
        $client_streets_text = json_decode($object["street_text"]);
        $client_contour = $object["contour"];
        $client_price_from = $object["price_from"];
        $client_price_to = $object["price_to"];
        $client_currency = $object["currency_id"];
        $client_home_size_from = $object["home_size_from"];
        $client_home_size_to = $object["home_size_to"];
        $client_home_size_dims = $object["home_size_dims"];
        $client_lot_size_from = $object["lot_size_from"];
        $client_lot_size_to = $object["lot_size_to"];
        $client_lot_size_dims = $object["lot_size_dims"];
        $agent_defaults = $defaults->get();
        $complete = [];
        $timestamp_offset = 0; // смещение времени назад для фильра по $from
        $from_parsed = null; // обработанное значение $from
        
        if ($from === null){ // если лимит по времени не задан
            if ($client_ascription == 0){ // if sale
                $from_parsed = "2_months"; // 2 months
            }
            elseif ($client_ascription == 1){ // if rent
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
            if (!is_array($object))
                throw new Exception("Wrong query parameters", 500);

            $parsed = $this->parseComparisonForClient($object); // распарсили лкиента и сформировали запрос
            // берем всю свою (и сток и не сток):
            $query = DB::createQuery()->select('*')->where("(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0 AND agency = ".$agency->getId()." AND statuses = 0 ".$parsed["query"]." AND timestamp > ".$timestamp_offset)->order("timestamp DESC");
            $response = $this->getList($query, $parsed["parameters"]); // выбрали по запросу
            // и проекции стока:
            $query = DB::createQuery()->select('*')->where("deleted = 0 AND agency = ".$agency->getId()." AND statuses = 0 AND temporary = 0 ".$parsed["query"]." AND timestamp > ".$timestamp_offset)->order("timestamp DESC");
            $stock_changed_properties = $stock->getList($query, $parsed["parameters"]); // выбрали по запросу
            
            for ($i = 0; $i < count($stock_changed_properties); $i++){
                $stock_changed_properties[$i]->id = $stock_changed_properties[$i]->stock_id;
            }

            $response = array_merge($response, $stock_changed_properties);
            // теперь берем все существ. стоки, если это включено(и оплачено):
            if ($agent_defaults->search_stock == 1){
                $query = DB::createQuery()->select('*')->where("stock = 1 AND deleted = 0 AND agency <> ".$agency->getId()." AND statuses = 0 AND temporary = 0 ".$parsed["query"]." AND timestamp > ".$timestamp_offset)->order("timestamp DESC");
                $stock_list = $this->getList($query, $parsed["parameters"]); // выбрали по запросу
                $response = array_merge($response, $stock_list);
            }
            
            $property_parsed = [];
            
            if ($client_price_from != null && $client_price_to != null && $client_currency != null){ // поиск по цене (с конвертацией валюты)
                $ratio1 = $currency->getRatio($client_currency);

                for ($i = 0; $i < count($response); $i++){
                    $price = $response[$i]->price;
                    $ratio2 = $currency->getRatio($response[$i]->currency_id);
                    $price_converted = round($price/$ratio2*$ratio1);
                    
                    if ($client_price_from <= $price_converted && $client_price_to >= $price_converted){
                        array_push($property_parsed, $response[$i]);
                    }
                }

                $response = $property_parsed;
            }
            else{
                throw new Exception("Wrong price or currency", 402);
            }
            
            if ($client_contour != null){ // отсев по контуру
                if (count($response) > 0){
                    $property_parsed = [];

                    for ($i = 0; $i < count($response); $i++){ // отсев по типам (обязательно)
                        $contour = Contour::load($client_contour);
                        $tmp_object = get_object_vars($response[$i]);
                        $tmp_property_lat = $tmp_object["lat"];
                        $tmp_property_lng = $tmp_object["lng"];

                        if (
                            $tmp_property_lat != null &&
                            $tmp_property_lng != null &&
                            $tmp_property_lat > 0 &&
                            $tmp_property_lng > 0 &&
                            Geo::containsLocation($contour->data, $tmp_property_lat, $tmp_property_lng)
                        ){
                            array_push($property_parsed, $response[$i]);
                        }
                    }

                    $response = $property_parsed;
                }
            }
            
            if (count($response) > 0){
                $property_parsed = [];

                for ($i = 0; $i < count($response); $i++){ // второй шаг поиска, отсев по улицам и типам недвижимости
                    $types_fit = 0;
                    $street_fits = 0;
                    $tmp_object = get_object_vars($response[$i]); // получаем переменные найденного объекта
                    $tmp_property_types = json_decode($tmp_object["types"]); // парсим его типы недвиж
                    $property_street = $tmp_object["street"]; // бере улицу
                    $property_street_text = $tmp_object["street_text"];

                    for ($z = 0; $z < count($tmp_property_types); $z++){ 
                        $type = $tmp_property_types[$z];

                        for ($c = 0; $c < count($client_property_types); $c++){
                            if ($client_property_types[$c] == $type){
                                $types_fit++;
                            }
                        }
                    }

                    if (count($client_streets) > 0 && $client_contour == null){ //  проверка на наличие улиц в клиенте вообще
                        for ($m = 0; $m < count($client_streets); $m++){
                            if ($property_street == $client_streets[$m] || Utils::isStringsSimilar($property_street_text, $client_streets_text[$m])){
                                $street_fits++;
                            }
                        }
                    }
                    else{ // если улиц нет и/или задан контур
                        $street_fits++;
                    }

                    if ($street_fits > 0 && $types_fit > 0){
                        array_push($property_parsed, $response[$i]);
                    }
                }

                $response = $property_parsed;
            }
            
            if ($client_home_size_from != null && $client_home_size_dims != null && $client_home_size_to != null){ // поиск по dimensions (с конвертацией) (не обязательно)
                $ratio1 = $dimensions->getRatio($client_home_size_dims);

                if (count($response) > 0){
                    $property_parsed = [];

                    for ($i = 0; $i < count($response); $i++){
                        if ($response[$i]->home_dims != null){
                            $home_size = $response[$i]->home_size;
                            $home_ratio2 = $dimensions->getRatio($response[$i]->home_dims);
                            $home_size_converted = round($home_size/$ratio1*$home_ratio2);
                            
                            if ($home_size_converted <= $client_home_size_to && $home_size_converted >= $client_home_size_from){
                                array_push($property_parsed, $response[$i]);
                            }
                        }
                        else{
                            array_push($property_parsed, $response[$i]);
                        }
                    }

                    $response = $property_parsed;
                }
            }
            
            if ($client_lot_size_from != null && $client_lot_size_dims != null && $client_lot_size_to != null){ // поиск по dimensions (с конвертацией) (не обязательно)
                $ratio1 = $dimensions->getRatio($client_lot_size_dims);

                if (count($response) > 0){
                    $property_parsed = [];

                    for ($i = 0; $i < count($response); $i++){
                        if ($response[$i]->lot_dims != null){
                            $lot_size = $response[$i]->lot_size;
                            $lot_ratio2 = $dimensions->getRatio($response[$i]->lot_dims);
                            $lot_size_converted = round($lot_size/$ratio1*$lot_ratio2);
                            
                            if ($lot_size_converted <= $client_lot_size_to && $lot_size_converted >= $client_lot_size_from){
                                array_push($property_parsed, $response[$i]);
                            }
                        }
                        else{
                            array_push($property_parsed, $response[$i]);
                        }
                    }

                    $response = $property_parsed;
                }
            }
            
            $response = $utils->removeDuplicatesFromAssocArray($response, "id");
            
            for ($i = 0; $i < count($response); $i++){ // разделение по своим и чужим стокам
                if ($response[$i]->stock == 1 && $response[$i]->agency != $agency->getId()){
                    $response[$i]->foreign_stock = 1;
                }
                else{
                    $response[$i]->foreign_stock = 0;
                }
            }
            
            $total_response_count = count($response);
            
            if (count($response) > 200){
                $response = array_slice($response, 0, 200);
            }
            
            $clientcomp->removeDeleted($client_id);
            $clientcomplist->createNew($client_id, $response);
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
    
    protected function parseComparisonForClient($object){ // $object = property fields array
        $sql_query = "";
        $query_parameters = [];
        
        foreach ($object as $key => $val){ // перебираем поля клиента
            if ($val != NULL){
                switch ($key) {
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
                    case "furniture_flag":
                        if ($val == 1){
                            $sql_query .= " AND (furniture_flag = 1 OR furniture_flag = 3 OR furniture_flag = 4)";
                        }
                        if ($val == 3){
                            $sql_query .= " AND furniture_flag = 3";
                        }
                        if ($val == 4){
                            $sql_query .= " AND furniture_flag = 4";
                        }
                        elseif ($val == 0){
                            $sql_query .= " AND (furniture_flag = 0 OR furniture_flag = 4)";
                        }
                    break;
                    /*case "price_from":
                        $sql_query .= " AND ? <= price AND ? >= price";  
                        array_push($query_parameters, $val);
                        array_push($query_parameters, $object["price_to"]);
                    break;
                    case "currency_id":
                        $sql_query .= " AND currency_id = ?";
                        array_push($query_parameters, $val);
                    break;*/
                    case "age_from":
                        $sql_query .= " AND ? <= age";
                        array_push($query_parameters, $val);
                    break;
                    case "floor_from":
                        if ($val != 0){
                            $sql_query .= " AND ? <= floor_from AND ? >= floor_from";
                            array_push($query_parameters, $val);
                            array_push($query_parameters, $object["floor_to"]);
                        }
                    break;
                    case "rooms_from":
                        if ($object["rooms_type"] == 1){
                            if ($val != 0){
                                $sql_query .= " AND ? <= rooms_count AND ? >= rooms_count";
                                array_push($query_parameters, $val);
                                array_push($query_parameters, $object["rooms_to"]);
                            }
                        }
                        elseif ($object["rooms_type"] == 2){
                            if ($val != 0){
                                $sql_query .= " AND ? <= bedrooms_count AND ? >= bedrooms_count";
                                array_push($query_parameters, $val);
                                array_push($query_parameters, $object["rooms_to"]);
                            }
                        }
                    break;
                    case "project_id":
                        if ($val != 0){
                            $sql_query .= " AND project_id = ?";
                            array_push($query_parameters, $val);
                        }
                    break;
                    case "parking_flag":
                        if ($val == 1)
                            $sql_query .= " AND parking_flag = 1";
                    break;
                    case "air_cond_flag":
                        if ($val == 1)
                            $sql_query .= " AND air_cond_flag = 1";
                    break;
                    case "elevator_flag":
                        if ($val == 1)
                            $sql_query .= " AND elevator_flag = 1";
                    break;
                    case "front_flag":
                        if ($val == 1)
                            $sql_query .= " AND facade_flag = 1";
                    break;
                    case "no_last_floor_flag":
                        if ($val == 1)
                            $sql_query .= " AND last_floor_flag <> 1";
                    break;
                    case "no_ground_floor_flag":
                        if ($val == 1)
                            $sql_query .= " AND ground_floor_flag <> 1";
                    break;
                    /*case "home_size_dims":
                        if ($val != 0){
                            $sql_query .= " AND home_dims = ? AND home_size >= ? AND home_size <= ?";
                            array_push($query_parameters, $val);
                            array_push($query_parameters, $object["home_size_from"]);
                            array_push($query_parameters, $object["home_size_to"]);
                        }
                    break;
                    case "lot_size_dims":
                        if ($val != 0){
                            $sql_query .= " AND lot_dims = ? AND lot_size >= ? AND lot_size <= ?";
                            array_push($query_parameters, $val);
                            array_push($query_parameters, $object["lot_size_from"]);
                            array_push($query_parameters, $object["lot_size_to"]);
                        }
                    break;*/
                    case "free_from":
                        if ($val != 0){
                            $sql_query .= " AND free_from <= ?";
                            array_push($query_parameters, $val);
                        }
                    break;
                }
            }
        }
        
        return ["query" => $sql_query, "parameters" => $query_parameters];
    }
    
    public function checkAgreement($agreement){
        global $agency;
        $agreement = intval($agreement);
	$query = DB::createQuery()->select('id')->where("agreement = ? AND agency = ? AND deleted = 0"); 
        $response = Propose::getList($query, [$agreement, $agency->getId()]);
        
        return count($response);
    }
    
    public function delete($properties){
        global $stock, $agency, $user;
        
        $object = json_decode($properties, true);
        $permission = new Permission();
        $deleted_array = [];
        $agency_admin = $user->getMyType() == 2 ? true : false; // 2 = Хозяин агентства
        
        try{
            if (!$permission->is("delete_card")){
                throw new Exception("Deleting cards forbidden!", 501);
            }
            
            for ($i = 0; $i < count($object); $i++){       
                $property = $this->load($object[$i]["card"]);
                
                //if ($_SESSION["user"] != 1){ // здесть надо будет переписать на редактирование по типу АДМИН а не по id админа
                    //throw new Exception("Access forbidden", 501);
                //}
                
                if ($property->stock == 1 && $property->stock_changed == 1){ // если сток и есть копии
                    $query = DB::createQuery()->select('id')->where("stock_id = ? AND agency = ? AND deleted = 0"); // берем ИД нашей копии 
                    $response = $stock->getList($query, [$property->id, $agency->getId()]); // получаем наши копии
                    
                    if (count($response) > 0){ // если есть наши копии
                        $stock_changed = $stock->load($response[0]->id);
                        
                        if (!$agency_admin && $stock_changed->agent_id != $_SESSION["user"]){
                            continue;
                        }
                        
                        $stock_changed->deleted = 1;
                        array_push($deleted_array, $stock_changed->stock_id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $stock_changed->save();
                    }
                }
                elseif ($property->stock == 0){ // если не сток
                    if ($property->agency == $agency->getId()){
                        if (!$agency_admin && $property->agent_id != $_SESSION["user"]){
                            continue;
                        }
                        
                        $property->deleted = 1;
                        array_push($deleted_array, $property->id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $property->save();
                    }
                }
            }
            
            $response = $deleted_array;
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function deleteStock($properties, $remove_mode){
        global $stock, $agency, $user;
        
        $object = json_decode($properties, true);
        $permission = new Permission();
        $deleted_array = [];
        $topreal_admin = $_SESSION["user"] == 1 ? true : false; // 2 = Хозяин агентства
        
        try{
            for ($i = 0; $i < count($object); $i++){       
                $property = $this->load($object[$i]["card"]);
                
                if ($property->stock == 1 && $property->stock_changed == 1){ // если сток и есть копии
                    if ($topreal_admin && $remove_mode == "changed"){
                        $query = DB::createQuery()->select('id')->where("stock_id = ? AND deleted = 0"); 
                        $changed_response = $stock->getList($query, [$property->id]);
                        
                        for ($d = 0; $d < count($changed_response); $d++){
                            $stock_changed = $stock->load($changed_response[$d]->id);
                            $stock_changed->statuses = 8;
                            array_push($deleted_array, $stock_changed->stock_id); // кладем в массив удаленных эту карточку для отправки на клиента
                            $stock_changed->save();
                        }
                        
                        $property->statuses = 8;
                        array_push($deleted_array, $property->id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $property->save();
                    }
                    elseif ($topreal_admin && $remove_mode == "original"){
                        $property->statuses = 8;
                        array_push($deleted_array, $property->id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $property->save();
                    }
                }
                elseif ($property->stock == 1 && $property->stock_changed == 0){ // если сток и нет копий
                    if ($topreal_admin){
                        $property->statuses = 8;
                        array_push($deleted_array, $property->id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $property->save();
                    }
                }
                else{ // если не сток
                    if ($topreal_admin){
                        $property->statuses = 8;
                        array_push($deleted_array, $property->id); // кладем в массив удаленных эту карточку для отправки на клиента
                        $property->save();
                    }
                }
            }
            
            $response = $deleted_array;
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getPropositions($id){
        $id = intval($id);
        $query = DB::createQuery()->select('*')->where('property=? AND deleted = 0'); 
        return Propose::getList($query, [$id]);
    }
    
    private function getExternalNew($property_data){
        $id1 = $property_data->external_id != null ? "%".$property_data->external_id."%" : "null";
        $id2 = $property_data->external_id_hex != null ? "%".$property_data->external_id_hex."%" : "null";
        $id3 = $property_data->external_id_winwin != null ? "%".$property_data->external_id_winwin."%" : "null";
        $query = DB::createQuery()->select('last_updated, query')->where("external_id LIKE ? OR external_id LIKE ? OR external_id LIKE ?"); 
        $response = PropertyExternal::getList($query, [$id1, $id2, $id3]);
        
        if (count($response) > 0){
            return [$response[0]->last_updated, $response[0]->query];
        }
        else{
            return null;
        }
    }
    
    public function getExternal($id){
        $property = $this->load($id);
        $id1 = $property->external_id != null ? "%".$property->external_id."%" : "null";
        $id2 = $property->external_id_hex != null ? "%".$property->external_id_hex."%" : "null";
        $id3 = $property->external_id_winwin != null ? "%".$property->external_id_winwin."%" : "null";
        
        $query = DB::createQuery()->select('*')->where("external_id LIKE ? OR external_id LIKE ? OR external_id LIKE ?"); 
        $response = PropertyExternal::getList($query, [$id1, $id2, $id3]);
        
        if (count($response) > 0){
            return $response[0];
        }
        else{
            return null;
        }
    }
    
    public function updateFromExternal($property_id, $external_id){
        $property = $this->load($property_id);
        $property_external = PropertyExternal::load($external_id);
        
        if ($property_external->source == "yad2"){
            $exploded = explode("_", $property_external->external_id);
            $new_external_id = end($exploded);
        }
        else{
            $new_external_id = $property_external->external_id;
        }
        
        $property->price = $property_external->price;
        $property->last_updated = $property_external->last_updated;
        $property->external_id = $new_external_id;
        
        PropertyExternal::createLink($property, $property_external->external_id);
        
        return $property->save();
    }
}
