<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/
include(dirname(__FILE__).'/settings.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabase.class.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabaseObject.class.php');

use Database\TinyMVCDatabase as DB;

session_start();

class Report extends Database\TinyMVCDatabaseObject{
    const tablename  = 'report';
    
    public function createNew($comment, $screenshot, $navigator){
        if (strlen($screenshot) > 0){
            $newfilename = uniqid().".png";
            $data = $screenshot;
            list($type, $data) = explode(';', $data);
            list(, $data)      = explode(',', $data);
            file_put_contents('storage/'.$newfilename, base64_decode($data));
        }
        
        $new_report = $this->create([
            "user" => $_SESSION["user"],
            "comment" => $comment.", ".$navigator,
            "screenshot" => strlen($screenshot) > 0 ? $newfilename : "",
            "timestamp" => time()
        ]);
        $new_report->save();
        
        $subject = "Репорт об ошибке в TopReal";
        $message = "Пользователь № ".$_SESSION["user"]." нашел ошибку в приложении."
                . "<p>Браузер: ".$navigator
                . "<br>Текст его комментария:".$comment
                . (strlen($screenshot) > 0 ? "<br>Прикрепленный скриншот: <a href='http://".$_SERVER['HTTP_HOST']."/storage/".$newfilename."' target='_blank'>".$newfilename."</a>" : "<br>Скриншот отсутствует.");
        $header = "From: TopReal <noreply@topreal.top>\r\n"; 
        $header.= "MIME-Version: 1.0\r\n"; 
        $header.= "Content-Type: text/html; charset=utf-8\r\n"; 
        $header.= "X-Priority: 1\r\n"; 
        mail("dev@topreal.top", $subject, $message, $header);
        
        return "success";
    }
}

$report = new Report;

echo $report->createNew($_POST['comment'], $_POST['screenshot'], $_POST['navigator']);