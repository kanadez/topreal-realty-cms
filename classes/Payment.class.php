<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/
use Database\TinyMVCDatabase as DB;

class Payment extends Database\TinyMVCDatabaseObject{
    const tablename  = 'payment';
    protected $paypal_email = "host@topreal.top"; // в продакшне должно быть host@topreal.top
    
    public function createTemporary($agency_id, $total, $monthly, $period, $users, $c1, $c2, $c3, $stock_value, $voip){
        global $subscription, $registration, $stock;
        
        $new_tmp_payment = $this->create([ // create main agent
            "agency" => intval($agency_id), 
            "total" => floatval($total),
            "timestamp" => time(),
            "payment_type" => intval($payment_type)
        ]);
        
        $agency = AgencyORM::load(intval($agency_id));
        $agency->users = intval($users);
        $agency->c1 = intval($c1);
        $agency->c2 = intval($c2);
        $agency->c3 = intval($c3);
        $agency->stock = intval($stock_value);
        $agency->voip = intval($voip);
        $agency->save();
        
        $subscription->createTemporary($agency->id, intval($monthly), intval($period));
        $registration->createAgentsAtFirst($agency->id);
        $registration->updateStockAtSearches($agency->id, $stock_value);
        
        $stock->setPayed($agency->id, $agency->stock);
        
        return $new_tmp_payment->save();
    }
    
    public function updateTemporary($id, $total, $monthly, $period, $users, $c1, $c2, $c3, $stock_value, $voip){
        global $subscription, $registration, $stock;
        $tmp_payment = $this->load(intval($id));
        
        if ($tmp_payment->temporary == 1){
            $tmp_payment->total = floatval($total);
            $tmp_payment->timestamp = time();
            $tmp_payment->payment_type = intval($payment_type);
        }
        
        $agency = AgencyORM::load(intval($tmp_payment->agency));
        $agency->users = intval($users);
        $agency->c1 = intval($c1);
        $agency->c2 = intval($c2);
        $agency->c3 = intval($c3);
        $agency->stock = intval($stock_value);
        $agency->voip = intval($voip);
        $agency->save();
        
        $subscription->createTemporary($agency->id, intval($monthly), intval($period));
        $registration->createAgentsAtFirst($agency->id);
        $registration->updateStockAtSearches($agency->id, $stock_value);
        
        $stock->setPayed($agency->id, $agency->stock);
        
        return $tmp_payment->save();
    }
    
    public function createProlong(){
        global $subscription, $agency;
        
        $new_tmp_payment = $this->create([ // create main agent
            "agency" => $agency->getId(), 
            "total" => $this->calculateProlong(), //  надо посчитать
            "timestamp" => time(), // не нужен
            "payment_type" => 0 //intval($payment_type) // не нужен, берется из формы продления
        ]);
        
        return $new_tmp_payment->save();
    }
    
    protected function calculateProlong(){
        global $subscription, $agency, $pricing;
        $prices = $pricing->get();
        $base = $prices->base;
        $agent = $prices->user;
        $collector = ["1" => $prices->collector_yad2, "2" => $prices->collector_winwin];
        $phone = $prices->voip;
        $instalments_ratio = 1+$prices->installments/100;
        $booking = $prices->booking;
        $paypal = $prices->paypal/100;
        $stock = $prices->stock;
        
        $agency = $agency->get();
        $subscription = $subscription->loadByRow("agency", $agency->getId());
        $months = $subscription->period-$subscription->period_payed;
        $sum = $base+$agent*$agency->users;
        
        if ($agency->c1 != null && $agency->c1 != 0){
            $sum += $collector[$agency->c1];
        }
        
        if ($agency->c2 != null && $agency->c2 != 0){
            $sum += $collector[$agency->c2];
        }
        
        if ($agency->c3 != null && $agency->c3 != 0){
            $sum += $collector[$agency->c3];
        }
        
        if ($agency->stock == 1){
            $sum += $stock;
        }
        
        $sum *= $months;
        
        if ($subscription->monthly == 1){
            $sum *= $instalments_ratio; // временно сумму умножаем на 10% годовых. после подключения платежей станет яснее эта часть формуылы
            $sum += $booking;
            $sum += $sum*$paypal;
            $monthly = round($sum/$months, 2);
        }
        else{
            //sum *= instalments_ratio; // временно сумму умножаем на 10% годовых. после подключения платежей станет яснее эта часть формуылы
            $sum += $booking;
            $sum += $sum*$paypal;
            $monthly = round($sum/$months, 2);
        }
        
        return $subscription->monthly == 1 ? $monthly : $sum;
    }
    
    protected function calculateExpired(){
        global $subscription, $agency, $pricing;
        $prices = $pricing->get();
        $base = $prices->base;
        $agent = $prices->user;
        $collector = ["1" => $prices->collector_yad2, "2" => $prices->collector_winwin];
        $phone = $prices->voip;
        $instalments_ratio = 1+$prices->installments/100;
        $booking = $prices->booking;
        $paypal = $prices->paypal/100;
        $stock = $prices->stock;
        
        $agency = $agency->get();
        $subscription = $subscription->loadByRow("agency", $agency->getId());
        $months = 12;//$subscription->period;
        $sum = $base+$agent*$agency->users;
        
        if ($agency->c1 != null && $agency->c1 != 0){
            $sum += $collector[$agency->c1];
        }
        
        if ($agency->c2 != null && $agency->c2 != 0){
            $sum += $collector[$agency->c2];
        }
        
        if ($agency->c3 != null && $agency->c3 != 0){
            $sum += $collector[$agency->c3];
        }
        
        if ($agency->stock == 1){
            $sum += $stock;
        }
        
        $sum *= $months;
        
        if ($subscription->monthly == 1){
            $sum *= $instalments_ratio; // временно сумму умножаем на 10% годовых. после подключения платежей станет яснее эта часть формуылы
            $sum += $booking;
            $sum += $sum*$paypal;
            $monthly = round($sum/$months, 2);
        }
        else{
            //sum *= instalments_ratio; // временно сумму умножаем на 10% годовых. после подключения платежей станет яснее эта часть формуылы
            $sum += $booking;
            $sum += $sum*$paypal;
            $monthly = round($sum/$months, 2);
        }
        
        return $subscription->monthly == 1 ? $monthly : $sum;
    }


    public function updateProlong($id){
        
    }
    
    public function createExpired(){
        global $subscription, $agency;
        
        $new_tmp_payment = $this->create([ // create main agent
            "agency" => $agency->getId(), 
            "total" => $this->calculateExpired(), //  надо посчитать
            "timestamp" => time(), // не нужен
            "payment_type" => 0 //intval($payment_type) // не нужен, берется из формы продления
        ]);
        
        return $new_tmp_payment->save();
    }
    
    public function createImprove($total, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock){ // создает платеж и закакз для расширения аккаунта
        global $subscription_improve, $agency;
        
        $new_tmp_payment = $this->create([
            "agency" => $agency->getId(), 
            "total" => floatval($total),
            "timestamp" => time(), // не нужен
            "payment_type" => 0 //intval($payment_type) // не нужен, берется из формы продления
        ]);
        
        $payment_id = $new_tmp_payment->save();
        $improve_id = $subscription_improve->createOrder($agency->getId(), $payment_id, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock);
        
        return ["payment" => $payment_id, "improve" => $improve_id];
    }
    
    public function updateImprove($id, $improve_id, $total, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock, $voip){ // обновляет платеж и закакз для расширения аккаунта
        global $subscription_improve, $agency, $registration;
        $tmp_payment = $this->load(intval($id));
        
        if ($tmp_payment->temporary == 1){
            $tmp_payment->total = floatval($total);
            $tmp_payment->timestamp = time();
            $tmp_payment->payment_type = 0;
        }
        
        $subscription_improve->updateOrder($improve_id, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock, $voip);
        
        return $tmp_payment->save();
    }
    
     public function updateExpired($id, $total, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock){ // обновляет платеж и закакз для расширения аккаунта
        global $subscription_expired;
        $tmp_payment = $this->load(intval($id));
        
        if ($tmp_payment->temporary == 1){
            $tmp_payment->total = floatval($total);
            $tmp_payment->timestamp = time();
            $tmp_payment->payment_type = 0;
        }
        
        $subscription_expired->createOrder($id, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock);
        
        return $tmp_payment->save();
    }
    
    public function fulfill($receiver_email, $txn_id, $mc_gross, $payment_status, $invoice){
        global $subscription, $subscription_improve;
        $tmp_payment = $this->load(intval($invoice));
        $payment_by_txn = $this->loadByRow("txn_id", $txn_id);
        
        if ($receiver_email == $this->paypal_email && $payment_by_txn == FALSE && $payment_status == "Completed" && number_format($tmp_payment->total, 2, '.', '') == $mc_gross){
            if ($tmp_payment->status == "Completed"){
                $new_payment = $this->create([
                    "payment_type" => 0,
                    "agency" => $tmp_payment->agency,
                    "total" => $tmp_payment->total,
                    "timestamp" => time()
                ]);
                
                $new_payment_id = $new_payment->save();
                $tmp_payment = $this->load($new_payment_id);
            }
            
            $tmp_payment->temporary = 0;
            $tmp_payment->status = "Completed";
            $tmp_payment->txn_id = $txn_id;
            
            // расширение аккаунта, если -1, то нет заказа на расширение
            if ($subscription_improve->tryTo(intval($invoice)) == -1){
                $subscription->update($tmp_payment->agency); // продление подписки в случае успешной оплаты
            }
        }
        else{
            $tmp_payment->temporary = 1;
            $tmp_payment->status = $payment_status;
            $tmp_payment->txn_id = $txn_id;
        }
        
        $tmp_payment->save();
        return number_format($tmp_payment->total, 2, '.', '')." ".$this->paypal_email." ".var_dump($payment_by_txn);
    }
    
    public static function createMissedPay($invoice){
        $payment_by_invoice = self::load($invoice);
        
        $new_tmp_payment = self::create([
            "agency" => $payment_by_invoice->agency, 
            "total" => $payment_by_invoice->total,
            "status" => "Missed",
            "timestamp" => time(),
            "payment_type" => 0,
            "temporary" => 0
        ]);
        
        return $new_tmp_payment->save();
    }
    
    public function get($payment_id){
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
                "period" => $subsc->period-$subsc->period_payed,
                "period_full" => $subsc->period,
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
}
