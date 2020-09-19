<?php

require('mail/sendmail.php');

use Database as DB;

class Contact extends DB\TinyMVCDatabaseObject{
    const tablename  = 'user';
    
    public function putMessage($name, $phone, $email, $subject, $message, $locale, $username){
        global $localization;
        
        if ($subject == 0){
            $subject_text = "TopReal Contact: ошибка";
        }
        elseif ($subject == 1){
            $subject_text = "TopReal Contact: вопрос";
        }
        elseif ($subject == 2){
            $subject_text = "TopReal Contact: предложение";
        }
        elseif ($subject == 3){
            $subject_text = "TopReal Contact: неточный перевод";
        }
        elseif ($subject == 4){
            $subject_text = "TopReal Contact: ошибка в данных";
        }
        elseif ($subject == 5){
            $subject_text = "TopReal Contact: свободная тема";
        }
        
        $rand = rand(1000, 9999);
        $name_and_phone = strlen($name) > 0 ? "<br>Имя: ".$name : "";
        $name_and_phone .= strlen($phone) > 0 ? "<br>Телефон: ".$phone : "";
        
        try{
            $response = trySendMail(
                "edigold1@gmail.com", 
                $subject_text." ".$rand, 
                $name_and_phone."<br>"."С адреса: ".$email.($username != -1 ? "<br>Имя в аппликации: ".$username : "")."<br>Сообщение: ".$message
            );
            $response = trySendMail($email, $localization->getVariable($locale, "contact_form_submitted").$rand, 
                    "<div style='direction:".($localization->isArabian($locale) ? "rtl" : "ltr")."'>".$localization->getVariable($locale, "dear_customer")
                    . "<p>".$localization->getVariable($locale, "contact_email_message_1")
                    . "<br>".$localization->getVariable($locale, "contact_email_message_2")
                    . "<p>".$message.""
                    . "<p>".$localization->getVariable($locale, "contact_email_message_3")
                    . "<br>".$localization->getVariable($locale, "contact_email_message_4")
                    . "<br>".$localization->getVariable($locale, "contact_email_message_5")
                    . "<p>".$localization->getVariable($locale, "contact_email_message_6")."</div>");
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
}
