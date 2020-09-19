<?php

function contact_send(){
    global $contact;
    return $contact->putMessage($_POST["name"], $_POST["phone"], $_POST["email"], $_POST["subject"], $_POST["message"], $_POST["locale"], $_POST["username"]);
}

?>
