<?php

use Database\TinyMVCDatabase as DB;

class Registration{
    //const tablename  = 'user';
    const DEFAULT_SEARCH_PRICE_FROM = 600000;
    const DEFAULT_SEARCH_PRICE_TO = 1800000;
    const DEFAULT_SEARCH_CURRENCY = 1;
    const DEFAULT_SEARCH_OBJECT_DIMENSIONS = 5;
    
    public function createTemporary($pricing, $registration, $locale){
        global $agency;
        $response = TRUE;
        $token = rand(1000, 9999);
        $pricing_parsed = json_decode($pricing, true);
        $registration_parsed = json_decode($registration, true);
        
        try{
            $new_user = User::create([ // create main agent
                "type" => 2, 
                //"username" => $registration_parsed["username"],
                "status" => 3,
                "password" => $registration_parsed["password"],
                "token" => $token,
                "name" => $registration_parsed["name"],
                "email" => $registration_parsed["email"],
                "phone" => $registration_parsed["phone"],
                "address" => $registration_parsed["street"],
                "temporary" => 1
            ]);
            $user_created_id = $new_user->save();
            //$user_created_id = User::loadByRow("email", $registration_parsed["email"]);

            $new_agency = AgencyORM::create([ // create agency
                "title" => $registration_parsed["office_name"], 
                "country" => $registration_parsed["country"],
                "region" => $registration_parsed["region"],
                "city" => $registration_parsed["city"],
                "address" => $registration_parsed["street"],
                "zipcode" => $registration_parsed["zipcode"],
                "users" => $pricing_parsed["agents"], 
                "main_agent" => $user_created_id,//$registration_parsed["phone"],
                "email" => $registration_parsed["email"],
                "phone" => $registration_parsed["phone"]
            ]);
            $agency_id = $new_agency->save();

            $user_again = User::load($user_created_id); // update agency for new user
            $user_again->agency = $agency_id;
            $user_again->save();

            $new_user_permission = PermissionORM::create([ // create defaults for main agent
                "user" => $user_created_id,
                "agency" => $agency_id,
                "delete_card" => 1,
                "new_card" => 1,
                "edit" => 1,
                "export" => 1,
                "edit_another_card" => 1,
                "edit_agent" => 1,
                "use_data_collecting" => 1,
                "projects" => 1,
                "delete_document" => 1,
                "delete_picture" => 1,
                "delete_agreement" => 1
            ]);
            $new_user_permission->save();

            /*$new_default_search = Search::create([ // creating default search
                "type" => 1, 
                "title" => $registration_parsed["name"]." default search",
                "country" => $registration_parsed["country"],
                "city" => $registration_parsed["city"],
                "lat" => $registration_parsed["lat"],
                "lng" => $registration_parsed["lng"],
                "mode" => 1,
                "temporary" => 0,
                "agency" => $agency_id,
                "author" => $user_created_id,
                "deleted" => 0,
                "default_search" => 1
            ]);

            $new_default_search->save();*/

            $new_user_search = Search::create([ // create defaults for main agent
                "author" => $user_created_id,
                "agency" => $agency_id,
                "country" => $registration_parsed["country"],
                "city" => $registration_parsed["city"],
                "lat" => $registration_parsed["lat"],
                "lng" => $registration_parsed["lng"],
                "history_type" => 0,
                "history_from" => time() - 2592000, // текущее время минус 2 недели
                "history_to" => time(),
                "history_interval" => 2592000,
                "price_from" => self::DEFAULT_SEARCH_PRICE_FROM,
                "price_to" => self::DEFAULT_SEARCH_PRICE_TO,
                "currency" => self::DEFAULT_SEARCH_CURRENCY,
                "object_dimensions" => self::DEFAULT_SEARCH_OBJECT_DIMENSIONS,
                "status" => '["0"]',
                "property" => '["0"]',
                "ascription" => 0,
                "type" => 1,
                "title" => "Default for ".$registration_parsed["name"],
                "temporary" => 0,
                "default_search" => 1,
                "timestamp" => time()
            ]);
            $default_search = $new_user_search->save();

            $new_user_default = Defaults::create([ // create defaults for main agent
                "user" => $user_created_id,
                "agency" => $agency_id,
                "country" => $registration_parsed["country"],
                "city" => $registration_parsed["city"],
                "lat" => $registration_parsed["lat"],
                "lng" => $registration_parsed["lng"],
                "locale" => $locale,
                "search" => $default_search
            ]);
            $new_user_default->save();

            $email_send_result = sendConfirmationMail($registration_parsed["email"], $token, $locale);
            
            if ($email_send_result == false){
                throw new Exception("Something wrong with GMail", 401);
            }

            $response = ["user" => $user_created_id, "agency" => $agency_id];
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function createAgentsAtFirst($agency_id){
        $agency = AgencyORM::load($agency_id);
        $query = DB::createQuery()->select('id')->where('agency=? AND id <> ? AND temporary = 1'); 
        $agents = User::getList($query, [$agency->id, $agency->main_agent]); // уже существующие все агенты
        $defaults = Defaults::loadByRow("agency", $agency->id);
        $query = DB::createQuery()->select('id')->where('agency=? AND id <> ? AND temporary = 0'); 
        $agents_not_tmp = User::getList($query, [$agency->id, $agency->main_agent]); // уже существующие активыне агенты
        
        for ($i = 0; $i < count($agents); $i++){
                $agent_for_delete = User::load($agents[$i]->id);
                $agent_for_delete->deleted = 1;
                $agent_for_delete->save();
        }
        
        for ($i = 0; $i < $agency->users-count($agents_not_tmp); $i++){
            $new_agent = User::create([ // create agents for agency
                "agency" => $agency->id,
                "status" => 3,
                "type" => 3,
                "name" => "Agent ".$i,
                "address" => $agency->address,
                "temporary" => 1
            ]);
            $new_agent_id = $new_agent->save();

            $new_user_permission = PermissionORM::create([ // create defaults for main agent
                "user" => $new_agent_id,
                "agency" => $agency->id
            ]);
            $new_user_permission->save();

            $new_user_search = Search::create([ // create defaults for main agent
                "author" => $new_agent_id,
                "agency" => $agency->id,
                "country" => $agency->country,
                "city" => $agency->city,
                "lat" => $defaults->lat,
                "lng" => $defaults->lng,
                "history_type" => 0,
                "history_from" => time() - 1209600, // текущее время минус 2 недели
                "history_to" => time(),
                "history_interval" => 1209600,
                "price_from" => self::DEFAULT_SEARCH_PRICE_FROM,
                "price_to" => self::DEFAULT_SEARCH_PRICE_TO,
                "currency" => self::DEFAULT_SEARCH_CURRENCY,
                "object_dimensions" => self::DEFAULT_SEARCH_OBJECT_DIMENSIONS,
                "type" => 1,
                "title" => "Default for Agent ".$i,
                "temporary" => 0,
                "default_search" => 1,
                "timestamp" => time()
            ]);
            $default_search = $new_user_search->save();

            $new_user_default = Defaults::create([ // create defaults for main agent
                "user" => $new_agent_id,
                "agency" => $agency->id,
                "country" => $agency->country,
                "city" => $agency->city,
                "lat" => $defaults->lat,
                "lng" => $defaults->lng,
                "locale" => "en",
                "search" => $default_search
            ]);
            $new_user_default->save();
        }

        return 0;
    }
    
    public function checkCode($user_id, $code){
        $user = User::load(intval($user_id)); // update agency for new user
        if ($user->token == intval($code)){
            return 1;
        }
        else{
            return 0;
        }
    }
    
    public function delete($clients){
        $object = json_decode($clients, true);
        
        try{
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
    
    public function checkDuplicate($data_type, $data_value){
        try{
            switch ($data_type){
                case "agency_title":
                    $query = DB::createQuery()->select('id')->where('title=? AND main_agent_deleted=0'); 
                    $agencies = AgencyORM::getList($query, [$data_value]);
                    
                    if (count($agencies) > 0){
                        $response = ["exist" => 1, "data_type" => $data_type];
                    }
                    else{
                        $response = ["exist" => 0, "data_type" => $data_type];
                    }
                break;
                case "email":
                    $query = DB::createQuery()->select('id')->where('email=? AND deleted=0'); 
                    $users = User::getList($query, [$data_value]);
                    
                    if (count($users) > 0){
                        $response = ["exist" => 1, "data_type" => $data_type];
                    }
                    else{
                        $response = ["exist" => 0, "data_type" => $data_type];
                    }
                break;
            }
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return json_encode($response);
    }
    
    public function getReCaptchaResponse($client_response){ // получает от клиента ответ капчи и отдает результат
        $jsonUrl = "https://www.google.com/recaptcha/api/siteverify";

        $captchacurl = curl_init();
        curl_setopt($captchacurl, CURLOPT_URL, $jsonUrl);
        curl_setopt($captchacurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($captchacurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($captchacurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($captchacurl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($captchacurl, CURLOPT_POSTFIELDS, [
            "secret" => "6LefRCYTAAAAAMutU8zQMC0itXTq7xLPWzIpH2N0",
            "response" => $client_response
        ]);

        $result = curl_exec($captchacurl);
        curl_close($result);
        return json_decode($result, true);
    }
    
    public function getDirectData($payment_id){
        $payment = Payment::load(intval($payment_id));
        $subsc = Subscription::loadByRow("agency", $payment->agency);
        
        try{
            if ($payment->temporary == 0){
                throw new Exception("Access forbidden", 501);
            }
            
            $agency = AgencyORM::load($payment->agency);
            $user = User::load($agency->main_agent);
            
            $response = [
                "total" => $payment->total,
                "monthly" => $subsc->monthly,
                "period" => $subsc->period,
                "name" => $user->name,
                "users" => $agency->users,
                "c1" => $agency->c1,
                "c2" => $agency->c2,
                "c3" => $agency->c3,
                "stock" => $agency->stock,
                "city" => $agency->city,
                "zipcode" => $agency->zipcode,
                "country" => $agency->country,
                "phone" => $agency->phone,
                "email" => $agency->email
            ];
            
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getPaymentData($payment_id){
        $payment = Payment::load(intval($payment_id));
        $subsc = Subscription::loadByRow("agency", $payment->agency);
        
        try{
            if ($payment->temporary == 0){
                throw new Exception("Access forbidden", 501);
            }
            
            $agency = AgencyORM::load($payment->agency);
            $user = User::load($agency->main_agent);
            
            $response = [
                "total" => $payment->total,
                "monthly" => $subsc->monthly,
                "period" => $subsc->period,  //$subsc->period-$subsc->period_payed,
                "name" => $user->name,
                "agency" => $agency->title,
                "address" => $agency->address,
                "users" => $agency->users,
                "c1" => $agency->c1,
                "c2" => $agency->c2,
                "c3" => $agency->c3,
                "stock" => $agency->stock,
                "voip" => $agency->voip,
                "city" => $agency->city,
                "zipcode" => $agency->zipcode,
                "country" => $agency->country,
                "region" => $agency->region,
                "phone" => $agency->phone,
                "email" => $agency->email,
                "payment_type" => $payment->payment_type
            ];
            
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function changeData($payment_id, $input_id, $input_value){
        global $agency, $agency_orm, $user, $payment;
        
        $payment_to_change = $payment->load($payment_id);
        $agency_to_change = $agency_orm->load($payment_to_change->agency);
        $user_to_change = $user->load($agency_to_change->main_agent);
        
        switch ($input_id){
            case "full_name_input":
                $user_to_change->name = strval($input_value);
                $user_to_change->save();
            break;
            case "office_name_input":
                $query = DB::createQuery()->select('id')->where('title = ? AND main_agent_deleted = 0 AND id = ?'); 
                $same_name_agencies = $agency_orm->getList($query, [$input_value, $agency_to_change->id]); // уже существующие все агенты
                
                if (count($same_name_agencies) === 0){
                    $agency_to_change->title = strval($input_value);
                    $agency_to_change->save();
                }
            break;
            case "country":
                $agency_to_change->country = strval($input_value);
                $agency_to_change->save();
            break;
            case "zipcode":
                $agency_to_change->zipcode = strval($input_value);
                $agency_to_change->save();
            break;
            case "region":
                $agency_to_change->region = strval($input_value);
                $agency_to_change->save();
            break;
            case "city":
                $agency_to_change->city = strval($input_value);
                $agency_to_change->save();
            break;
            case "street":
                $agency_to_change->address = strval($input_value);
                $agency_to_change->save();
            break;
            case "phone_input":
                $agency_to_change->phone = strval($input_value);
                $agency_to_change->save();
            break;
            case "email_input":
                $query = DB::createQuery()->select('id')->where('email = ? AND deleted = 0 AND id = ?'); 
                $same_email_users = $user->getList($query, [$input_value, $agency_to_change->main_agent]); // уже существующие все агенты
                
                if (count($same_email_users) === 0){
                    $user_to_change->email = strval($input_value);
                    $user_to_change->save();
                }
            break;
        }
        
        return 0;
    }
    
    public function directSendEmail($payment_id){
        global $payment, $agency_orm, $user;
        
        try{
            $payment_to_get = $payment->load($payment_id);
            
            if ($payment_to_get == FALSE){
                throw new Exception("Payment not exist", 401);
            }
            
            $agency = $agency_orm->load($payment_to_get->agency);
            $registered_user = $user->load($agency->main_agent);
            $response = sendDirectMail($registered_user->email, $payment_to_get->total); 
        }
        catch(Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function updateStockAtSearches($agency_id, $stock_value){
        $query = DB::createQuery()->select('id')->where('agency=?'); 
        $searches = Search::getList($query, [intval($agency_id)]);
        
        for ($i = 0; $i < count($searches); $i++){
            $search = Search::load($searches[$i]->id);
            $search->stock = intval($stock_value);
            $search->save();
        }
    }
    
    public function changePrice($order_id, $price, $password){
        $hash = "1f7241fce265714b171743b54fe54aac";
        $hashed = md5($password);
        
        if ($hash !== $hashed){
            throw new Exception("Access denied", 501);
        }
        
        $payment_to_change = Payment::load(intval($order_id));
        $payment_to_change->total = $price;
        return $payment_to_change->save();
    }
}
