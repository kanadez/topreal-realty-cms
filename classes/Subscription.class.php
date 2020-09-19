<?php

use Database\TinyMVCDatabase as DB;

class Subscription extends Database\TinyMVCDatabaseObject{
    const tablename  = 'subscription';
    const week = 1209600; // 604800; // secs in 1 week => увеличено до 2 недель
    const five_days = 432000; // secs in 5 days
    const two_months = 5356800; // secs in 2 months
    const day = 86400; // secs in 1 day
    const month = 2678400; // secs in 1 month

    public function get(){
        global $agency;
        
        $query = DB::createQuery()->select('*')->where("suspended = 0 AND agency = ?"); 
        $subs_list = $this->getList($query, [$agency->getId()]);
        
        if (count($subs_list) > 0){
            return $subs_list[0];
        }
        else{
            return null;
        }
    }
    
    public function checkRemaining(){
        global $agency, $subscription_expired;
        
        $subscr = $this->loadByRow("agency", $agency->getId());
        $to_timestamp = $subscr->free_period != null && $subscr->free_period != 0 ? $subscr->free_period : $subscr->to_timestamp;
        
        if (
                $subscr->period == $subscr->period_payed && 
                $to_timestamp - time() < self::week &&
                $subscription_expired->checkExisting() === null
        ){
            return ["status" => 1, "days_left" => round(($to_timestamp - time())/self::day)];
        }
        else{
            return ["status" => 0];
        }
    }
    
    public function checkRemainingNoAlert(){ // остаток дней подписки для Офис Инфо
        global $agency;
        
        $subscr = $this->loadByRow("agency", $agency->getId());
        $to_timestamp = $subscr->free_period != null && $subscr->free_period != 0 ? $subscr->free_period : $subscr->to_timestamp;
        
        if ($subscr->period == $subscr->period_payed){
            return $to_timestamp;
        }
        else{
            return $subscr->free_period != null && $subscr->free_period != 0 ? $subscr->free_period : $to_timestamp+($subscr->period-$subscr->period_payed)*self::month;
        }
    }
    
    public function getPaymentsLeftData(){
        global $agency;
        
        $subscr = $this->loadByRow("agency", $agency->getId());
        
        return ["from" => $subscr->from_timestamp, "period" => $subscr->period];
    }
    
    public function checkPassed(){
        global $agency, $subscription_expired;
        
        $subscr = $this->loadByRow("agency", $agency->getId());
        $time_passed = time() - ($subscr->free_period != null && $subscr->free_period != 0 ? $subscr->free_period : $subscr->to_timestamp);
        
        if ($subscr->period > $subscr->period_payed && $time_passed > 0 && $time_passed < self::five_days){ // если просрочено меньше 5 дней
            $cancel_payments_result = $this->cancelPayments();
            header("Location: balance?status=1&remaining=".round((self::five_days-$time_passed)/self::day)."&passed=".round($time_passed/self::day)."&cancel=".$cancel_payments_result);
        }
        elseif ($subscr->period > $subscr->period_payed && $time_passed > self::five_days && $time_passed < self::two_months){ // если просрочено больше 5 дней, но меньше 2 мес
            $cancel_payments_result = $this->cancelPayments();
            header("Location: balance?status=2&remaining=".round((self::two_months-$time_passed)/self::day)."&passed=".round($time_passed/self::day)."&cancel=".$cancel_payments_result);
        }
        elseif ($subscr->period == $subscr->period_payed && $time_passed > 0){ // если закончилась подписка полностью
            if ($subscription_expired->apply() === null){
                header("Location: balance?status=3&remaining=".round((self::two_months-$time_passed)/self::day));
            }
            else{
                header("Location: query");
            }
        }
    }
    
    public function createTemporary($agency_id, $monthly, $period){
        $subscr = $this->loadByRow("agency", $agency_id);
        
        if ($subscr == FALSE){
            $new_subscr = $this->create([
                "agency" => $agency_id, 
                "period" => $period,
                "from_timestamp" => time(),
                "period_payed" => 0,
                "monthly" => $monthly
                //"to" => $monthly == 1 ? time()+self::month : time()+self::month*$period,
                //"period_payed" => $monthly == 1 ? 1 : $period
            ]);
            $response = $new_subscr->save();
        }
        else{
            $subscr->period = $period;
            $subscr->period_payed = 0;
            $subscr->monthly = $monthly;
            $subscr->from_timestamp = time();
            $response = $subscr->save();
            //$subscr->to = $monthly == 1 ? time()+self::month : time()+self::month*$period;
            //$subscr->period_payed = $monthly == 1 ? $subscr->monthly++ : $period;
        }
        
        return $response;
    }
    
    public function update($agency_id){
        $subscr = $this->loadByRow("agency", $agency_id);
        
        try{
            if ($subscr != FALSE){
                $subscr->to_timestamp = $subscr->monthly == 1 ? time()+self::month : time()+self::month*$subscr->period;
                $subscr->period_payed = $subscr->monthly == 1 ? $subscr->period_payed+1 : $subscr->period;
                $subscr->suspended = 0;
                $subscr->cancelled = 0;
                $response = $subscr->save();
            }
            else{
                throw new Exception("Subscription not exist", 401);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
        
    }
    
    public function getMonthly(){
        global $agency;
        $subscr = $this->loadByRow("agency", $agency->getId());
        return $subscr->monthly;
    }
    
    public function cancelPayments(){
        /*
        ini_set('display_errors',1);
        ini_set('display_startup_errors',1);
        error_reporting(-1);
        */
        global $utils, $agency, $user;
        
        $subscr = $this->get();
        
        if ($subscr == null || $agency->getMainAgent() != $_SESSION["user"]){
            return "Failure";
        }
        
        $jsonUrl = "https://api-3t.paypal.com/nvp";
        $params  = [
            "METHOD" => "TransactionSearch",
            "STARTDATE" => date('Y-m-d', $subscr->from_timestamp)."T00:01:01Z", // здесь вствляем дату начала подписки
            "EMAIL" => $user->getContactEmail(), // здесь почту хозяина офиса
            "USER" => "host_api1.topreal.top", # Get USER, PWD, and SIGNATURE from your Paypal's account preferences
            "PWD" => "7XVBHNTKJZC8VDPR",
            "SIGNATURE" => "AyFrZzfVX7qm66wMTKY7z4OJHsIGA0je.DwWbiQd3dd4J76lfNvqCuKG",
            "VERSION" => "54.0"
        ];
        
        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl."?".http_build_query($params));
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        curl_close($geocurl);

        $array = $utils->parseURLencoded($geofile);
        $status = null;
        $profile_id = null;

        for ($i = 0; $i < count($array); $i++){
            $exploded = explode("=", $array[$i]);

            if ($exploded[1] === "Created"){
                $status = $exploded[0];
                break;
            }
        }

        if ($status === null){
            return "Failure";
        }

        $transaction_num = explode("L_STATUS", $status)[1];

        for ($i = 0; $i < count($array); $i++){
            $exploded = explode("=", $array[$i]);

            if ($exploded[0] === "L_TRANSACTIONID".$transaction_num){
                $profile_id = $exploded[1];
            }
        }

        //echo $profile_id;
        
        $params  = [
            "METHOD" => "ManageRecurringPaymentsProfileStatus",
            "PROFILEID" => $profile_id, //"I-CF3X7XANSCV9", # put your subscription ID here
            "ACTION" => "cancel",
            "USER" => "host_api1.topreal.top", # Get USER, PWD, and SIGNATURE from your Paypal's account preferences
            "PWD" => "7XVBHNTKJZC8VDPR",
            "SIGNATURE" => "AyFrZzfVX7qm66wMTKY7z4OJHsIGA0je.DwWbiQd3dd4J76lfNvqCuKG",
            "VERSION" => "54.0"
        ];
        $geocurl = curl_init();
        curl_setopt($geocurl, CURLOPT_URL, $jsonUrl."?".http_build_query($params));
        curl_setopt($geocurl, CURLOPT_HEADER,0); //Change this to a 1 to return headers
        curl_setopt($geocurl, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
        curl_setopt($geocurl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($geocurl, CURLOPT_RETURNTRANSFER, 1);

        $geofile = curl_exec($geocurl);
        curl_close($geocurl);

        $array = $utils->parseURLencoded($geofile);
        $status = null;

        for ($i = 0; $i < count($array); $i++){
            $exploded = explode("=", $array[$i]);

            if ($exploded[0] === "ACK"){
                $status = $exploded[1];
                break;
            }
        }
        
        if ($status === "Success"){
            $tmp = $this->load($subscr->id);
            $tmp->cancelled = 1;
            $tmp->save();
        }

        return $status;
    }
    
    public function checkCancelled(){
        global $agency;
        
        $subscr = $this->loadByRow("agency", $agency->getId());
        
        return $subscr->cancelled;
    }
    
    public function getVoipByUserId($id){
        $user = User::load($id);
        $agency = AgencyORM::load($user->agency);
        
        return $agency->voip;
    }
}