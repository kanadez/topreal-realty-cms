<?php

use Database\TinyMVCDatabase as DB;

class SubscriptionImprove extends Database\TinyMVCDatabaseObject{
    const tablename  = 'subscription_improve';
    
    public function createOrder($agency, $payment, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock_value, $voip){ // создает закакз для расширения подпискаи. выполнится полсе оплаты
        global $stock;
        
        $new_order = $this->create([
            "agency" => intval($agency),
            "payment" => $payment,
            "monthly" => intval($monthly),
            "period" => intval($period),
            "agents_add" => intval($agents_add),
            "agents_remove" => intval($agents_remove),
            "c1" => intval($c1),
            "c2" => intval($c2),
            "c3" => intval($c3),
            "stock" => intval($stock_value),
            "voip" => intval($voip)
        ]);
        
        $stock->setPayed(intval($agency), intval($stock_value));
        
        return $new_order->save();
    }
    
    public function updateOrder($id, $monthly, $period, $agents_add, $agents_remove, $c1, $c2, $c3, $stock_value, $voip){ // обновляет заказ для расширения подписки (создание выцше)
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
        $order->voip = intval($voip);
        
        $stock->setPayed($order->agency, intval($stock_value));
        
        return $order->save();
    }
    
    public function tryTo($payment){
        $order = $this->loadByRow("payment", $payment);
        
        if ($order != FALSE && $order->deleted == 0){
            $subsc_to_update = Subscription::loadByRow("agency", $order->agency);
            //$subsc_to_update->monthly = $order->monthly;
            //$subsc_to_update->period = (int) $order->period + (int) $subsc_to_update->period;
            $subsc_to_update->save();
            
            $agency_to_update = AgencyORM::load(intval($order->agency));
            $agency_to_update->c1 = $order->c1;
            $agency_to_update->c2 = $order->c2;
            $agency_to_update->c3 = $order->c3;
            $agency_to_update->stock = $order->stock;
            $agency_to_update->voip = $order->voip;
            
            if ($order->agents_add > 0){
                Agency::addAgents($order->agency, $order->agents_add);
                $agency_to_update->users += $order->agents_add;
            }
            
            $agency_to_update->save();
            
            $order->deleted = 1;
            $order->save();
            
            return 0;
        }
        else{
            return -1;
        }
    }
}