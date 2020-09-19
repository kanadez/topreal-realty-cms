<?php

use Database\TinyMVCDatabase as DB;

class Tools{// extends Database\TinyMVCDatabaseObject{
    //const tablename  = 'locale';
    
    public function getStockCounter(){
        global $agency;
        
        $query = DB::createQuery()->select('id')->where('country = ? AND deleted = 0 AND temporary = 0 AND stock = 1');
        return count(Property::getList($query, [$agency->getCountry()]));
    }
    
    public function getOfficeInfo(){
        global $agency, $subscription, $subscription_expired;
        
        $agency_object = $agency->get();
        $agency_object->country = $agency_object->country;
        $agency_object->main_agent_name = $agency->getAgentName($agency_object->main_agent);
        $agency_object->main_agent_email = $agency->getAgentEmail($agency_object->main_agent);
        $agency_object->agents_total = $agency->getAgentsTotal();
        $agency_object->days_left = $subscription->checkRemainingNoAlert();
        $agency_object->payments_days_left = $subscription->getPaymentsLeftData();
        
        $query = DB::createQuery()->select('id')->where('agency=? AND deleted = 0 AND temporary = 0 AND ascription = 0'); 
        $property_sale_cards_list = Property::getList($query, [$agency->getId()]);
        $agency_object->property_sale_cards_total = count($property_sale_cards_list);
        
        $query = DB::createQuery()->select('id')->where('agency=? AND deleted = 0 AND temporary = 0 AND ascription = 1'); 
        $property_rent_cards_list = Property::getList($query, [$agency->getId()]);
        $agency_object->property_rent_cards_total = count($property_rent_cards_list);
        
        $query = DB::createQuery()->select('id')->where('agency=? AND deleted = 0 AND temporary = 0 AND ascription = 0'); 
        $client_sale_cards_list = Client::getList($query, [$agency->getId()]);
        $agency_object->client_sale_cards_total = count($client_sale_cards_list);
        
        $query = DB::createQuery()->select('id')->where('agency=? AND deleted = 0 AND temporary = 0 AND ascription = 1'); 
        $client_rent_cards_list = Client::getList($query, [$agency->getId()]);
        $agency_object->client_rent_cards_total = count($client_rent_cards_list);
        
        $query = DB::createQuery()->select('id')->where('lastseen > ? AND agency=? AND deleted = 0 AND temporary = 0'); 
        $agents_in_work = User::getList($query, [time()-40, $agency->getId()]);
        $agency_object->agents_in_work = count($agents_in_work);
        
        $query = DB::createQuery()->select('id')->where('country = ? AND deleted = 0 AND temporary = 0 AND stock = 1');
        $stock_cards_total_list = Property::getList($query, [$agency->getCountry()]);
        $agency_object->stock_cards_total = count($stock_cards_total_list);
        
        $subsc = $subscription->loadByRow("agency", $agency->getId());
        $query = DB::createQuery()->select('id')->where('agent_id = ? AND deleted = 0 AND temporary = 0 AND stock = 1 AND timestamp > ?');
        $stock_cards_subsc_list = Property::getList($query, [$_SESSION["user"], $subsc->from_timestamp]);
        $agency_object->stock_cards_subsc = count($stock_cards_subsc_list);
        
        $agency_object->new_subsc_bought = $subscription_expired->checkExisting();
        
        $collectors = "";
        
        if ($agency_object->c1 != null && $agency_object->c1 != 0){
            $c = Collector::load($agency_object->c1);
            $collectors .= $c->title;
        }
        
        if ($agency_object->c2 != null && $agency_object->c2 != 0){
            $c = Collector::load($agency_object->c2);
            $collectors .= ", ".$c->title;
        }
        
        if ($agency_object->c3 != null && $agency_object->c3 != 0){
            $c = Collector::load($agency_object->c3);
            $collectors .= ", ".$c->title;
        }
        
        $agency_object->collectors = strlen($collectors) > 0 ? $collectors : "No";
        
        return $agency_object;
    }
    
    public function setOfficeInfoParameter($parameter, $value){
        global $agency;
        $parameter = strval($parameter);
        $value = strval($value);
        $agency_object = $agency->get();
        
        try{
            if ($agency_object === FALSE){
                throw new Exception("access_forbidden_label", 501);
            }
            
            if ($agency->getMainAgent() != $_SESSION["user"]){
                throw new Exception("access_forbidden_label", 501);
            }
            
            switch ($parameter){
                case "agency_name":
                    $agency_object->title = $value;
                    $agency_object->save();
                    $response = $agency_object->save();
                break;
                case "main_agent_email":
                    $main_agent = User::load($agency_object->main_agent);
                    $main_agent->email = $value;
                    $main_agent->save();
                    $response = $main_agent->save();
                break;
                case "agency_phone":
                    $agency_object->phone = $value;
                    $agency_object->save();
                    $response = $agency_object->save();
                break;
                case "agency_email":
                    $agency_object->email = $value;
                    $agency_object->save();
                    $response = $agency_object->save();
                break;
                case "agency_address" : 
                    $agency_object->address = $value;
                    $agency_object->save();
                    $response = $agency_object->save();
                break;
                case "main_agent_fullname" : 
                    $main_agent = User::load($agency_object->main_agent);
                    $main_agent->name = $value;
                    $main_agent->save();
                    $response = $main_agent->save();
                break;
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }    
    
    public function setOfficeInfoAgentName($agent_id, $agent_name){
        global $agency;
        $agent_id = intval($agent_id);
        $agent_name = strval($agent_name);
        
        $agent = User::load($agent_id);
        
        try{
            if ($agent === FALSE)
                throw new Exception("Agent not exists at all", 401);
            elseif ($agent->agency != $agency->getId()) 
                throw new Exception("Agent not exists in agency", 401);
            
            $agent->name = $agent_name;
            $agent->save();
            
            $response = ["parameter" => "main_agent_fullname", "value" => $agent_name];
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function checkUserCountry(){
        return "IL";//geoip_country_code_by_name($_SERVER["HTTP_X_REAL_IP"]);
    }
    
    public function getAgencySearches(){
        global $agency;
        
        try{
            $query = DB::createQuery()->select('id, title')->where('agency=? AND deleted = 0'); 
            $response = Property::getList($query, [$agency->getId()]);    
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function checkGuestPropertiesCount($email_address){ // проверяет, сколько уже было создано карточек текущим гостем
        global $email, $property;
        $user = $email->loadByRow("email", strval($email_address));
        
        try{
            if ($user != FALSE){
                $query = DB::createQuery()->select('id')->where('email = ?'); 
                $property_list = $property->getList($query, [strval($email_address)]);
                
                if (count($property_list) == 5){
                    throw new Exception("Cards limit", 401);
                }
                else{
                    $response = $user;
                }
            }
            else{
                $user_new = $email->create([
                    "email" => strval($email_address),
                    "code" => 1234
                ]);
                $response = $user_new->save();
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function saveTryNowEmail($email_address, $locale){
        global $email, $property;
        $user = $email->loadByRow("email", strval($email_address));
        
        try{
            if ($user != FALSE){
                $query = DB::createQuery()->select('id')->where('email = ?'); 
                $property_list = $property->getList($query, [strval($email_address)]);
                
                if (count($property_list) == 5){
                    throw new Exception("Cards limit", 401);
                }
                
                $user->code = rand(1000, 9999);
                sendTryNowConfirmationMail(strval($email_address), $user->code, $locale);
                $response = $user->save();
            }
            else{
                $user_new = $email->create([
                    "email" => strval($email_address),
                    "code" => rand(1000, 9999)
                ]);
                sendTryNowConfirmationMail(strval($email_address), $user_new->code, $locale);
                $response = $user_new->save();
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function checkTryNowCode($email_address, $code){
        global $email;
        $user = $email->loadByRow("email", strval($email_address));
        
        try{
            if ($user != FALSE){
                if ($user->code != intval($code)){
                    throw new Exception("Wrong code", 401);
                }
                
                $response = $user->code;
            }
            else{
                throw new Exception("E-Mail not exist", 401);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function saveTryNowEnterEmail($email_address, $name, $phone, $city, $locale){
        global $user;
        $guest = $user->loadByRow("email", strval($email_address));
        
        try{
            if ($guest != FALSE){
                return 0;
            }
            else{
                $user_new = $user->create([
                    "type" => 4,
                    "email" => strval($email_address),
                    "name" => strval($name),
                    "phone" => strval($phone),
                    "city" => strval($city),
                    "token" => rand(1000, 9999)
                ]);
                
                sendTryNowConfirmationMail(strval($email_address), $user_new->token, $locale);
                $response = $user_new->save();
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function checkTryNowEnterCode($email_address, $code){
        global $user;
        $guest = $user->loadByRow("email", strval($email_address));
        
        try{
            if ($guest != FALSE){
                if ($guest->token != intval($code)){
                    throw new Exception("Wrong code", 401);
                }
                
                $response = $guest->token;
                sendTryNowAdminNotifyMail($email_address);
            }
            else{
                throw new Exception("E-Mail not exist", 401);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getAgencyCollectors(){
        global $agency;
        $permission = new Permission();
        $response = [];
        
        try{
            if (!$permission->is("use_data_collecting")){
                throw new Exception("cant_use_data_collecting", 501);
            }
            
            $agency_object = AgencyORM::load($agency->getId());
            array_push($response, $agency_object->c1 != 0 ? Collector::load($agency_object->c1) : 0);
            array_push($response, $agency_object->c2 != 0 ? Collector::load($agency_object->c2) : 0);
            array_push($response, $agency_object->c3 != 0 ? Collector::load($agency_object->c3) : 0);
            
            if (
                    ($agency_object->c1 == 0 && 
                    $agency_object->c2 == 0 && 
                    $agency_object->c3 == 0) ||
                    ($agency_object->c1 == null && 
                    $agency_object->c2 == null && 
                    $agency_object->c3 == null)
            ){
                throw new Exception("agency_no_collectors", 401);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
}