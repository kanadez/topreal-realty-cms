<?php

use Database\TinyMVCDatabase as DB;

class SubscriptionExpired extends Database\TinyMVCDatabaseObject{
    const tablename  = 'subscription_expired';
    const week = 1209600; // 604800; // secs in 1 week => увеличено до 2 недель
    const five_days = 432000; // secs in 5 days
    const two_months = 5184000; // secs in 2 months
    const day = 86400; // secs in 1 day
    const month = 2592000; // secs in 1 month
    
    public function createOrder($payment, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock_value){ // создает закакз для расширения подпискаи. выполнится полсе оплаты
        global $stock, $agency;
        
        $new_order = $this->create([
            "agency" => $agency->getId(),
            "payment" => $payment,
            "monthly" => intval($monthly),
            "period" => intval($period),
            "agents_add" => intval($agents_add),
            "agents_remove" => strval($agents_remove),
            "c1" => intval($c1),
            "c2" => intval($c2),
            "c3" => intval($c3),
            "stock" => intval($stock_value),
            "timestamp" => time()
        ]);
        
        $stock->setPayed(intval($agency), intval($stock_value));
        
        return $new_order->save();
    }
    
    public function updateOrder($id, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock_value){ // обновляет заказ для расширения подписки (создание выцше)
        global $stock;
        
        $order = $this->load(intval($id));
        $order->monthly = intval($monthly);
        $order->period = intval($period);
        $order->agents_add = intval($agents_add);
        $order->agents_remove = $agents_remove;
        $order->c1 = intval($c1);
        $order->c2 = intval($c2);
        $order->c3 = intval($c3);
        $order->stock = intval($stock_value);
        
        $stock->setPayed($order->agency, intval($stock_value));
        
        return $order->save();
    }
    
    public function apply(){
        global $agency;
        
        $query = DB::createQuery()->select('id, payment')->where('agency = ? AND applied = 0 AND deleted = 0'); 
        $response = $this->getList($query, [$agency->getId()]);
        
        $order = null;
        
        for ($i = 0; $i < count($response); $i++){
            $payment = Payment::load($response[$i]->payment);
            
            if ($payment->status === "Completed"){
                $order = $this->load($response[$i]->id);
            }
        }
        
        if ($order != null){
            $subsc_to_update = Subscription::loadByRow("agency", $order->agency);
            $subsc_to_update->monthly = $order->monthly;
            $subsc_to_update->period = (int) $order->period;
            $subsc_to_update->from_timestamp = time();
            $subsc_to_update->to_timestamp = $order->monthly == 1 ? time()+self::month : time()+self::month*$order->period;
            $subsc_to_update->period_payed = $order->monthly == 1 ? 1 : $order->period;
            $subsc_to_update->save();
            
            $agency_to_update = AgencyORM::load(intval($order->agency));
            $agency_to_update->c1 = $order->c1;
            $agency_to_update->c2 = $order->c2;
            $agency_to_update->c3 = $order->c3;
            $agency_to_update->stock = $order->stock;
            
            if ($order->agents_add > 0){
                Agency::addAgents($order->agency, $order->agents_add);
                $agency_to_update->users += $order->agents_add;
            }
            
            $agents_remove = json_decode($order->agents_remove);
            
            for ($i = 0; $i < count($agents_remove); $i++){
                $agency->removeAgent($agents_remove[$i]);
            }
            
            $agency_to_update->save();
            $agency->updateAgentsCount();
            
            $order->deleted = 1;
            $order->applied = 1;
            $order->save();
            
            return $order->id;
        }
        else{
            return null;
        }
    }
    
    public function checkExisting(){
        global $agency;
        
        $query = DB::createQuery()->select('id, payment')->where('agency = ? AND applied = 0 AND deleted = 0'); 
        $response = $this->getList($query, [$agency->getId()]);
        
        $order = null;
        
        for ($i = 0; $i < count($response); $i++){
            $payment = Payment::load($response[$i]->payment);
            
            if ($payment->status === "Completed"){
                $order = $this->load($response[$i]->id);
            }
        }
        
        return $order;
    }
}