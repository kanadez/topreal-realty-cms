<?php 

function registration_changeprice(){
    global $registration;
    
    return $registration->changePrice($_POST["order_id"], $_POST["price"], $_POST["password"]);
}

function registration_directsendemail(){
    global $registration;
    
    return $registration->directSendEmail($_POST["payment"]);
}

function registration_changedata(){
    global $registration;
    
    return $registration->changeData($_POST["payment_id"], $_POST["input_id"], $_POST["input_value"]);
}

function registration_test(){
    global $registration;
    
    return $registration->createAgents($_POST["agency"]);
}

function registration_getpaymentdata(){
    global $registration;
    
    return $registration->getPaymentData($_POST["payment"]);
}

function registration_getdirectdata(){
    global $registration;
    
    return $registration->getDirectData($_POST["payment"]);
}

function registration_checkcode(){
    global $registration;
    
    return $registration->checkCode($_POST["user"], $_POST["code"]);
}

function registration_getcaptcha(){
    global $registration;
    
    return $registration->getReCaptchaResponse($_POST["response"]);
}

function registration_checkduplicate(){
    global $registration;
    
    return $registration->checkDuplicate($_POST["data_type"], $_POST["data_value"]);
}

function registration_delete(){
    global $registration;
    
    return $registration->delete($_POST["clients"]);
}

function registration_set(){
    global $registration;
    
    return $registration->set($_POST["id"], $_POST["data"]); 
}

function registration_createnew(){
    global $registration;
    
    return $registration->createNew($_POST["id"], $_POST["data"]);
}

function registration_createtemporary(){
    global $registration;
    
    return $registration->createTemporary($_POST["pricing"], $_POST["registration"], $_POST["locale"]);
}

?>
