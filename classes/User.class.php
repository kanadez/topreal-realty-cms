<?php

use Database\TinyMVCDatabase as DB;

class User extends Database\TinyMVCDatabaseObject{
    const tablename  = 'user';
    
    public function getAgentNameOrStock($id){ // возвращает id агента, если он принадлежит моему агентству, либо 0 (Сток)
        global $agency, $localization;
	$user = $this->load($id);
        
        if ($user->agency == $agency->getId()){
            return $user->name;
        }
        else{
            return $localization->getVariableCurLocale("stock");
        }
    }
    
    public function lockAgent(){
	$user = $this->load($_SESSION["user"]);
        
        if ($user->type != 0 && $user->type != 2 && $user->type != -1){
            return $user->id;
        }
        else{
            return FALSE;
        }
    }
    
    public function getName($id){
        $id = intval($id);
	$user = $this->load($id);
        
        try{
            if ($user === FALSE)
                throw new Exception("User not exists", 503);
            
            $response = $user->name;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]];
        }
        
        return $response;
    }
    
    public function getMyName(){
	$user = $this->load($_SESSION["user"]);
        return $user->name;
    }
    
    public function getContactEmail(){
	$user = $this->load($_SESSION["user"]);
        return $user->email;
    }
    
    public function getMyId(){
	return $_SESSION["user"];
    }
    
    public function getMyType(){
	$user = User::load($_SESSION["user"]);
        return $user->type;
    }
    
    public function getMyOfficeInfo(){
        global $agency;
        
	$user = User::load($_SESSION["user"]);
        $agency_data = $agency->get();
        return ["id" => $agency_data->id, "company_name" => $agency_data->title, "company_phone" => $agency_data->phone, "company_email" => $agency_data->email, "user_name" => $user->name];
    }
    
    public function showSession(){ // для тестирования
        return 0;
    }
    
    public function unauthorize(){ // разавторизовать для возможности входа из другого места
        if (isset($_SESSION["user"])){
            $user = $this->load($_SESSION["user"]);
            $user->authorized = 0;
            return $user->save();
        }
    }
    
    public function setSeen(){ // отметить пользователя что был на сайте только что
        if (isset($_SESSION["user"])){
            $_SESSION['LAST_ACTIVITY'] = time();
            $user = $this->load($_SESSION["user"]);
            $user->lastseen = time();
            
            if ($user->mobile_lastseen < time()-600){
                return $user->save();
            }
            else{
                return "mobile_authorized";
            }
        }
    }
    
    public function notSeenTooLong($user_id){ // юзера не было на сайте больше двух часов? 1 - да, 0 - нет (для любого юзера)
        $user = $this->load($user_id);
        
        if (time() - $user->lastseen > 60){
            return 1;
        }
        else{
            return 0;
        }
    }
    
    public function sessionNotSeenTooLong(){ // текущего юзера не было на сайте больше двух часов? 1 - да, 0 - нет (только для текущей сессии)
        $user = $this->load($_SESSION["user"]);
        
        if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 60)){
            return 1;
        }
        else{
            return 0;
        }
    }
    
    public function changeMyPassword($old, $new){
        global $agency;

        try{
            $agent = User::load($_SESSION["user"]);
            
            if ($agent === FALSE){
                throw new Exception("User not exist", 401);
            }
            elseif ($agent->agency != $agency->getId()){
                throw new Exception("User not exist in agency", 401);
            }
            
            if ($agent->password === strval($old)){
                $agent->password = strval($new);
                $response = $agent->save();
            }
            else{
                throw new Exception("Wrong old password", 403);
            }
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function isAuth(){
        global $subscription;
        
        if (isset($_SESSION["user"])){
            return true;
        }
        else{
            if (isset($_COOKIE["id"]) && isset($_COOKIE["token"])){
                $id = str_replace('"', "", $_COOKIE["id"]);
                $token = str_replace('"', "", $_COOKIE["token"]);
                
                $query = DB::createQuery()->select('id')->where('id = ? AND rememberme_token = ?'); 
                $response = User::getList($query, [$id, $token]);
                
                if (count($response) > 0){
                    $user = $this->load($id);
                    $_SESSION["user"] = $id;
                    $user->authorized = 1;
                    $user->lastseen = time();
                    $user->save();
                
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
    }
    
    public function test(){
        ini_set('display_errors',1);
        ini_set('display_startup_errors',1);
        error_reporting(-1);
        
        $query = DB::createQuery()->select('id')->where('id = ? AND rememberme_token = ?'); 
        $response = User::getList($query, [2, "c2242aae1ea66cb9ed18724b2686d052"]);

        if (count($response) > 0){
            $user = $this->load(2);
            $_SESSION["user"] = 2;
            $user->authorized = 1;
            $user->lastseen = time();
            $user->save();

            return true;
        }
        else{
            return false;
        }
    }
}
