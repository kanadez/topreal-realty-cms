<?php 

function payment_set(){
    global $payment;
    
    return $payment->set($_POST["id"], $_POST["data"]); 
}

function payment_createnew(){
    global $payment;
    
    return $payment->createNew($_POST["id"], $_POST["data"]);
}

function payment_updateimprove(){
    global $payment;
    
    return $payment->updateImprove($_POST["id"], $_POST["improve_id"], $_POST["total"], $_POST["monthly"], $_POST["period"], $_POST["agents_add"], $_POST["agents_remove"], $_POST["c1"], $_POST["c2"], $_POST["c3"], $_POST["stock"], $_POST["voip"]);
}

function payment_createimprove(){
    global $payment;
    
    return $payment->createImprove($_POST["total"], $_POST["monthly"], $_POST["period"], $_POST["agents_add"], $_POST["agents_remove"], $_POST["c1"], $_POST["c2"], $_POST["c3"], $_POST["stock"]);
}

function payment_updatetemporary(){
    global $payment;
    
    return $payment->updateTemporary($_POST["id"], $_POST["total"], $_POST["monthly"], $_POST["period"], $_POST["users"], $_POST["c1"], $_POST["c2"], $_POST["c3"], $_POST["stock"], $_POST["voip"]);
}

function payment_createtemporary(){
    global $payment;
    
    return $payment->createTemporary($_POST["agency"], $_POST["total"], $_POST["monthly"], $_POST["period"], $_POST["users"], $_POST["c1"], $_POST["c2"], $_POST["c3"], $_POST["stock"], $_POST["voip"]);
}

function payment_updateprolong(){
    global $payment;
    
    return $payment->updateProlong($_POST["id"]);
}

function payment_createprolong(){
    global $payment;
    
    return $payment->createProlong();
}

function payment_createexpired(){
    global $payment;
    
    return $payment->createExpired();
}

function payment_updateexpired(){
    global $payment;
    
    return $payment->updateExpired(
            $_POST["id"],
            $_POST["total"],
            $_POST["monthly"], 
            $_POST["period"], 
            $_POST["agents_add"], 
            $_POST["agents_remove"], 
            $_POST["c1"],
            $_POST["c2"], 
            $_POST["c3"], 
            $_POST["stock"]
    );
}

function payment_get(){
    global $payment;
    
    return $payment->get($_POST["payment"]);
}

?>
