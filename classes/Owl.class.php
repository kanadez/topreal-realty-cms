<?php

use Database\TinyMVCDatabase as DB;

class Owl extends Database\TinyMVCDatabaseObject{
    const tablename  = 'owl';
    
    public function saveSession($event_type, $subject_type, $card, $subject_name, $subject_contact, $subject_remark, $duration, $timestamp){
        global $agency;
        
        $parameters = [
            "agent" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "event_type" => strval($event_type),
            "subject_type" => strval($subject_type), 
            "card" => intval($card), 
            "subject_name" => strval($subject_name),
            "subject_contact" => strval($subject_contact),
            "subject_remark" => strval($subject_remark),
            "duration" => intval($duration),
            "timestamp" => intval($timestamp)
        ];
        $newsession = $this->create($parameters);
        return $newsession->save();
    }
    
    public function createSession($event_type, $subject_type, $card, $subject_name, $subject_contact, $sms_text){
        global $agency, $fcm;
        
        $parameters = [
            "agent" => $_SESSION["user"],
            "agency" => $agency->getId(),
            "event_type" => strval($event_type),
            "subject_type" => strval($subject_type), 
            "card" => intval($card), 
            "subject_name" => strval($subject_name)
        ];
        $newsession = $this->create($parameters);
        $session_id = $newsession->save();
        
        switch ($event_type){
            case "call-out":
                $fcm->send("call_number", json_encode(["contact" => strval($subject_contact), "session" => $session_id]));
            break;
            case "sms-out":
                $fcm->send("send_sms", json_encode(["contact" => strval($subject_contact), "session" => $session_id, "sms_text" => strval($sms_text)]));
            break;
        }
        
        return $session_id;
    }
    
    public function setAppCallInEvent($event, $data){
        global $agency, $utils;
        $parameters_property = [];
        //$parameters_client = [];
        
        $data_decoded = json_decode($data, true);
        $phone_number = $data_decoded["number"];
        $call_start = $data_decoded["start"]/1000;
        $call_end = $data_decoded["end"]/1000;
        //$card_id = $data_decoded["card"];
        $phone_exploded = $utils->explodePhoneWithoutCountryCode($phone_number);
        array_push($parameters_property, $agency->getId());
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        /*array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);*/
        $query_part .= "contact1 REGEXP ? "
        . "OR contact2 REGEXP ? "
        . "OR contact3 REGEXP ? "
        . "OR contact4 REGEXP ?";

        $query_property = DB::createQuery()->select('id, name')->where("(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0"
            . " AND agency = ?"
            . " AND (".$query_part.")")->order("timestamp DESC");
        $response = Property::getList($query_property, $parameters_property);
       
        if (count($response) > 0){
            //$card_id = $response[0]->id;
            //$card_name = $response[0]->name != null ? $response[0]->name : "";
            $parameters = [
                "agent" => $_SESSION["user"],
                "agency" => $agency->getId(),
                "event_type" => strval($event),
                "subject_type" => "property", 
                //"card" => $card_id, 
                //"subject_name" => $card_name,
                "subject_contact" => strval($phone_number),
                "subject_remark" => "",
                "duration" => $call_end-$call_start,
                "timestamp" => $call_start,
                "temporary" => 0
            ];
            $newsession = $this->create($parameters);
            return $newsession->save();
        }
        /*$query_client = DB::createQuery()->select('*')->where(
            "deleted = 0 AND temporary = 0 AND id <> ".$object_id
            . " AND agency = ".$agency->getId()
            . " AND (".$query_part.")");*/
	
    }
    
    public function setAppCallOutEvent($event, $data){
        $data_decoded = json_decode($data, true);
        $phone_number = $data_decoded["number"];
        $call_start = $data_decoded["start"]/1000;
        $call_end = $data_decoded["end"]/1000;
        $session_id = $data_decoded["session"];
        
        $session = $this->load($session_id);
        $session->subject_contact = strval($phone_number);
        $session->duration = $call_end-$call_start;
        $session->timestamp = $call_start;
        $session->temporary = 0;

        return $session->save();
    }
    
    public function setAppSmsInEvent($event, $data){
        global $agency, $utils;
        $parameters_property = [];
        
        $data_decoded = json_decode($data, true);
        $phone_number = $data_decoded["number"];
        $sms_time = $data_decoded["time"]/1000;
        $sms_text = $data_decoded["content"];
        $phone_exploded = $utils->explodePhoneWithoutCountryCode($phone_number);
        array_push($parameters_property, $agency->getId());
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        array_push($parameters_property, $phone_exploded);
        /*array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);
        array_push($parameters_client, $phone_exploded);*/
        $query_part .= "contact1 REGEXP ? "
        . "OR contact2 REGEXP ? "
        . "OR contact3 REGEXP ? "
        . "OR contact4 REGEXP ?";

        $query_property = DB::createQuery()->select('id, name')->where("(stock = 0 OR stock = 1 AND stock_changed = 0) AND deleted = 0 AND temporary = 0"
            . " AND agency = ?"
            . " AND (".$query_part.")")->order("timestamp DESC");
        $response = Property::getList($query_property, $parameters_property);
       
        if (count($response) > 0){
            //$card_id = $response[0]->id;
            //$card_name = $response[0]->name != null ? $response[0]->name : "";
            $parameters = [
                "agent" => $_SESSION["user"],
                "agency" => $agency->getId(),
                "event_type" => strval($event),
                "subject_type" => "property", 
                //"card" => $card_id, 
                //"subject_name" => $card_name,
                "subject_contact" => strval($phone_number),
                "subject_remark" => "",
                "timestamp" => $sms_time,
                "temporary" => 0
            ];
            $newsession = $this->create($parameters);
            return $newsession->save();
        }
        /*$query_client = DB::createQuery()->select('*')->where(
            "deleted = 0 AND temporary = 0 AND id <> ".$object_id
            . " AND agency = ".$agency->getId()
            . " AND (".$query_part.")");*/
    }
    
    public function setAppSmsOutEvent($event, $data){
        $data_decoded = json_decode($data, true);
        
        try{
            if (strlen($data_decoded["number"]) === 0 || strlen($data_decoded["session"]) == 0){
                throw new Exception("Empty arguments", 402);
            }
            
            $phone_number = $data_decoded["number"];
            $session_id = $data_decoded["session"];
            $contact_filtered = str_replace(" ", "", $phone_number);
            $contact_filtered_again = str_replace("-", "", $contact_filtered);

            $session = $this->load($session_id);
            $session->subject_contact = strval($contact_filtered_again);
            $session->timestamp = time();
            $session->temporary = 0;
            
            $response = $session->save();
        }
         catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getSessions(){
	$query = DB::createQuery()->select('*')->where('agent = ? AND temporary = 0')->order("timestamp DESC"); 
	return $this->getList($query, [$_SESSION["user"]]);
    }
    
    public function getSessionsForAll(){
        global $agency;
        
	$query = DB::createQuery()->select('*')->where('agent = ? AND temporary = 0')->order("timestamp DESC"); 
	return $this->getList($query, [$agency->getId()]);
    }
    
    public function initCardButtons(){
        global $agency;
        
        $agency_data = $agency->get();
        $user_data = User::load($_SESSION["user"]);
        
        if ($agency_data->voip == 1){ // телефония куплена
            if ($user_data->has_smartphone == 1){ // есть смартфон
                if (isset($user_data->fcm_token_id) && strlen($user_data->fcm_token_id) > 0){ // приложение установлено
                    return "mobile_client";
                }
                else{
                    return "app_install";
                }
            }
            else{
                return "std_owl";
            }
        }
        else{
            return "std_owl";
        }
    }
    
    public function setNoSmart(){
        $user = User::load($_SESSION["user"]);
        $user->has_smartphone = 0;
        $user->save();
    }
    
    public function createCheckByPhone($phone, $object_id, $object_type){
        global $agency, $defaults, $search;
        $phones = [];
        
        array_push($phones, $phone);
        
        $new_search = $search->create([
            "author" => $_SESSION["user"], 
            "agency" => $agency->getId(),
            "type" => 2,
            "stock" => $defaults->getStock(),
            "special_by" => 5,
            "special_argument" => json_encode([
                "object_id" => $object_id,
                "object_type" => $object_type,
                "phones" => $phones
            ])
        ]);
        
        $new_search_id = $new_search->save();
        $result = $search->query($new_search_id);
        
        if (count($result["properties"]) == 0 && count($result["clients"]) == 0){
            return 0;
        }
        else{
            return $new_search_id;
        }
    }
    
    public function unsetTemporary($event_id){
        $event = $this->load($event_id);
        $event->temporary = 0;
        $event->save();
    }
}