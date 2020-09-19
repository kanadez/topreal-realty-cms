<?php
require_once dirname(__FILE__).'/phpmailer/class.phpmailer.php';
$mail             = new PHPMailer();

function sendDirectMail($to, $total){ //  отправляет инстрцкцию оплаты через банк клиенту на почту
    $subject = "Direct payment instruction"; 
    $message = "Dear customer!"
        . "<p>This message generated by robot, please do not reply!"
        . "<br>You have registered at TopReal.top. Here is you instruction to pay your subscription directly via bank:"
        . "<p>Total: ".$total." EUR"
        . "<p>To: TOP REAL SERVICES LIMITED"
        . "<br>Bank: BANK OF CYPRUS SERVICES LIMITED"
        . "<br>SWIFT Address: BCYPCY2N"
        . "<br>IBAN: CY40 0020 0195 0000 3570 2290 1988"
        . "<br>Payment instructions:"
        . "<br>Direct payment exempt from PayPal fees (4%), still Yםו have to pay your bank fees (contact your bank for details)."
        . "<br>For payment you need:"
        . "<br>Company name TOP REAL SERVICES LIMITED"
        . "<br>IBAN number: CY40 0020 0195 0000 3570 2290 1988"
        . "<br>SWIFT address: BCYPCY2N"
        . "<br>Payment in EUR only."
        . "<br>After payment instructions:"
        . "<br>Send approval of bank payment to e-Mail:"
        . "<br>host@topreal.top"
        . "<br>After that we will check payment (no more than 3 days) and open your TopReal account. You'll get e-Mail after approving";
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    return mail($to, $subject, $message, $header);
}

function sendAppLinkMail($to, $locale){ 
    global $localization;
    
    $subject = $localization->getVariable($locale, "app_link"); 
    $message = $localization->getVariable($locale, "dear_customer")
        . "<p>".$localization->getVariable($locale, "contact_email_message_1")
        . "<p>".$localization->getVariable($locale, "app_install_email_msg1")
        . "<p><a href='https://play.google.com/store/apps/details?id=top.topreal.topreal'>https://play.google.com/store/apps/details?id=top.topreal.topreal</a>"
        . "<p>".$localization->getVariable($locale, "contact_email_message_6");
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    return mail($to, $subject, "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$message."</div>", $header);
}

function sendConfirmationMail($to, $token, $locale){ //  отправляет код подтверждения для завершения процесса регистрации офиса
    global $localization;
    
    $subject = $localization->getVariable($locale, "confirm_registration"); 
    $message = $localization->getVariable($locale, "dear_customer")
        . "<p>".$localization->getVariable($locale, "contact_email_message_1")
        . "<br>".$localization->getVariable($locale, "registration_message_1")
        . "<p>".$token.""
        . "<p>".$localization->getVariable($locale, "registration_message_2")
        . "<br>".$localization->getVariable($locale, "registration_message_3")
        . "<p>".$localization->getVariable($locale, "contact_email_message_6");;
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    return trySendMail($to, $subject, "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$message."</div>");
}

function sendTryNowConfirmationMail($to, $token, $locale){ //  отправляет код подтверждения для завершения процесса регистрации офиса
    global $localization;
    $subject = $localization->getVariable($locale, "confirmation_code"); 
    $message = $localization->getVariable($locale, "dear_customer")
        . "<p>".$localization->getVariable($locale, "contact_email_message_1")
        . "<br>".$localization->getVariable($locale, "try_now_message_1")
        . "<p>".$token.""
        . "<p>".$localization->getVariable($locale, "try_now_message_2")
        . "<br>".$localization->getVariable($locale, "try_now_message_3")
        . "<p>".$localization->getVariable($locale, "contact_email_message_6");
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    //return mail($to, $subject, "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$message."</div>", $header);
    return trySendMail($to, $subject, "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$message."</div>");
}

function sendTryNowAdminNotifyMail($email){ //  отправляет код подтверждения для завершения процесса регистрации офиса
    $subject = "New TryNow user: ".$email;
    $message = "Email: <a href='mailto:".$email."'>".$email."</a>";
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    return mail("host@topreal.top", $subject, $message, $header);
}

function sendNoPayNotify($payer_email){
    $subject = "Внимание!!! Пропущен месячный платеж!";
    $message = "Пользователь пропустил месячный платеж.";
    $message .= "<p>Email пользователя: ".$payer_email;
    $message .= "<p>Подробности можно посмотреть в админ. панели, в разделе Payments.";
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n";
    
    return mail("host@topreal.top", $subject, $message, $header);
}

function sendResetPasswordMail($to, $token, $locale){ //  отправляет код подтверждения для сброса пароля
    global $localization;
    
    $subject = $localization->getVariable($locale, "password_recovery"); 
    $message = $localization->getVariable($locale, "dear_customer")
        . "<p>".$localization->getVariable($locale, "contact_email_message_1")
        . "<p>".$localization->getVariable($locale, "password_recovery_message_1")
        . "<p>".$token.""
        . "<p>".$localization->getVariable($locale, "password_recovery_message_2")
        . "<p>".$localization->getVariable($locale, "contact_email_message_6");
    $header = "From: TopReal <noreply@topreal.top>\r\n"; 
    $header.= "MIME-Version: 1.0\r\n"; 
    $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
    $header.= "X-Priority: 1\r\n"; 
    return trySendMail($to, $subject, "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$message."</div>", $header);
}

function trySendMail($recipient, $mail_subject, $mail_msg){
    $send_response = false;

    while ($send_response != 1){
        $send_response = sendMail($recipient, $mail_subject, $mail_msg);

        if ($send_response != 1){
            sleep(2);
        }
    }

    return $send_response;
}

function sendMail($recipient, $mail_subject, $mail_msg){
    global $mail;

    $body             = $mail_msg;//file_get_contents('contents.html');
    $body             = eregi_replace("[\]",'',$body);
    $mail->IsSMTP(); // telling the class to use SMTP
    $mail->Host       = "ssl://smtp.gmail.com"; // SMTP server
    $mail->SMTPAuth   = true;                  // enable SMTP authentication
    $mail->CharSet = 'UTF-8';
    $mail->Host       = "ssl://smtp.gmail.com"; // sets the SMTP server
    $mail->Port       = 465;                    // set the SMTP port for the GMAIL server
    $mail->Username   = "redb.dev@gmail.com"; // SMTP account username
    $mail->Password   = 'redbdevelopment';        // SMTP account password
    $mail->SetFrom('redb.dev@gmail.com', "TopReal Services");
    $mail->AddReplyTo("redb.dev@gmail.com");
    $mail->Subject    = $mail_subject;//"PHPMailer Test Subject via smtp, basic with authentication";
    $mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
    $mail->MsgHTML($body);
    $address = $recipient;
    $mail->AddAddress($address);

    return $mail->Send();
}

function sendGMail($recipient, $mail_subject, $mail_msg){
    global $mail;
    //include("class.smtp.php"); // optional, gets called from within class.phpmailer.php if not already loaded
    
    $body             = $mail_msg;//file_get_contents('contents.html');
    $body             = eregi_replace("[\]",'',$body);

    $mail->IsSMTP(); // telling the class to use SMTP
    $mail->Host       = "ssl://smtp.gmail.com"; // SMTP server
    $mail->SMTPDebug  = 1;                     // enables SMTP debug information (for testing)
                                               // 1 = errors and messages
                                               // 2 = messages only
    $mail->SMTPAuth   = true;                  // enable SMTP authentication
    $mail->CharSet = 'UTF-8';
    $mail->Host       = "ssl://smtp.gmail.com"; // sets the SMTP server
    $mail->Port       = 465;                    // set the SMTP port for the GMAIL server
    $mail->Username   = "toprealservices@gmail.com"; // SMTP account username
    $mail->Password   = 'vAqI8p`R<:h=qCH,<!kY{^d>';        // SMTP account password
    $mail->SetFrom('toprealservices@gmail.com', "TopReal Services");
    $mail->AddReplyTo("toprealservices@gmail.com");
    $mail->Subject    = $mail_subject;//"PHPMailer Test Subject via smtp, basic with authentication";
    $mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
    $mail->MsgHTML($body);
    $address = $recipient;
    $mail->AddAddress($address);
    //$mail->AddAttachment("images/phpmailer.gif");      // attachment
    //$mail->AddAttachment("images/phpmailer_mini.gif"); // attachment

    $mail->Send();
    return var_dump($mail);
}

/*   $host = 'ssl://smtp.gmail.com';
   $port = '465';
   $username = 'wci.noreply@gmail.com';
   $password = 'erf454buf@@08,.';
   $subject = $mail_subject;
   $to = $recipient;
    
   $from = $username;
   $message = $mail_msg;
   $headers = array ("From" => $from,
      "To" => $to,
      "Subject" => $subject,
      "Content-Type" => "text/html; charset=UTF-8",
      "MIME-Version" => "1.0",
      "Content-Transfer-Encoding" => "8bit");
   $smtp = Mail::factory('smtp',
      array ('host' => $host,
        'port' => $port,
        'auth' => true,
        'username' => $username,
        'password' => $password));
   $mail = $smtp->send($to, $headers, $message);
   if (PEAR::isError($mail)){
      $mail->getMessage();
   }
}*/

?>