<?php

class FCM{
    const API_KEY = "AAAAG5KmMiw:APA91bFQdvocA7REc28T1NNXFPd_N_okB_mdicjxUbNXHg3RZ49zYXkAmuTOP1y1PFiBnZXCJgqk-nID6CYGv9lOFAQguMZwcw4QnzJZWgp24aAtt4qMyUqYr6EQ32Bf3VRaNVOAEKUV";
    const WEB_API_KEY = "AAAA0AIMcXs:APA91bG70iJDxzaYeY8Blyt8l4on95ujdoZsx7wKPBZDcjayEPNFr5E0-sbf-napEH3Gy89eUKP0k9wp6xs9vxGhmba6_JXU7DfaRTTMBMgehRkIdoLzlPAdrdxFSCnitCnk3DnKx_31";
    const FCM_URL = "https://fcm.googleapis.com/fcm/send";
    
    //############### For an App
    
    public function send($message_action, $message_data){ // отправка нотификациюю текущему авторизованному юзеру
        $token = $this->getUserToken();
        //$YOUR_TOKEN_ID = 'dGDScPcq1QY:APA91bHZS8XQ1jdTyWEuXNDr7_GitJG8iusocmW0klRcFy4MAzgRDkTlKVvh0uLYdetgeaAj6c9cWn6ax6hCNCij-A7ra3FzCYC9-ZCF1izIusg2RGEuXciW8T4FvruOZsc4fPzyJ3m_'; // Client token id
        
        $request_body = [
            "to" => $token,
            "data" => [
                "title" => strval($message_action),
                "body" => strval($message_data),
            ]
        ];
        $fields = json_encode($request_body);

        $request_headers = array(
            "Content-Type: application/json",
            "Authorization: key=" . self::API_KEY,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::FCM_URL);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }
    
    private function getUserToken(){
        $user = User::load($_SESSION["user"]);
        
        return $user->fcm_token_id;
    }
    
    public function setToken($user_id, $token){
        $user = User::load(intval($user_id));
        $user->fcm_token_id = strval($token);
        $user->save();
    }
    
    //############## For Website
    
    public function sendWeb($user, $message_action, $message_data, $card){ // отправка нотификациюю текущему авторизованному юзеру
        $token = $this->getUserTokenWeb($user);
        //$YOUR_TOKEN_ID = 'dGDScPcq1QY:APA91bHZS8XQ1jdTyWEuXNDr7_GitJG8iusocmW0klRcFy4MAzgRDkTlKVvh0uLYdetgeaAj6c9cWn6ax6hCNCij-A7ra3FzCYC9-ZCF1izIusg2RGEuXciW8T4FvruOZsc4fPzyJ3m_'; // Client token id
        
        $request_body = [
            "to" => $token,
            "notification" => [
                "title" => strval($message_action),
                "body" => strval($message_data),
                'icon' => 'https://topreal.top/assets/img/layers.png',
                'click_action' => 'https://topreal.top/property?id='.$card
            ]
        ];
        $fields = json_encode($request_body);

        $request_headers = array(
            "Content-Type: application/json",
            "Authorization: key=" . self::WEB_API_KEY,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::FCM_URL);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $this->sendWebMobile($user, $message_action, $message_data, $card);

        return $response;
    }
    
    private function getUserTokenWeb($user_id){
        $user = User::load($user_id);
        
        return $user->web_fcm_token;
    }
    
    public function setTokenWeb($token){
        $user = User::load($_SESSION["user"]);
        $user->web_fcm_token = strval($token);
        $user->save();
    }
    
    public function sendWebMobile($user, $message_action, $message_data, $card){ // отправка нотификациюю текущему авторизованному юзеру
        $token = $this->getUserTokenWebMobile($user);
        //$YOUR_TOKEN_ID = 'dGDScPcq1QY:APA91bHZS8XQ1jdTyWEuXNDr7_GitJG8iusocmW0klRcFy4MAzgRDkTlKVvh0uLYdetgeaAj6c9cWn6ax6hCNCij-A7ra3FzCYC9-ZCF1izIusg2RGEuXciW8T4FvruOZsc4fPzyJ3m_'; // Client token id
        
        $request_body = [
            "to" => $token,
            "notification" => [
                "title" => strval($message_action),
                "body" => strval($message_data),
                'icon' => 'https://topreal.top/assets/img/layers.png',
                'click_action' => 'https://m.topreal.top/property?iPropertyId='.$card
            ]
        ];
        $fields = json_encode($request_body);

        $request_headers = array(
            "Content-Type: application/json",
            "Authorization: key=" . self::WEB_API_KEY,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::FCM_URL);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }
    
    private function getUserTokenWebMobile($user_id){
        $user = User::load($user_id);
        
        return $user->mobile_web_fcm_token;
    }
}