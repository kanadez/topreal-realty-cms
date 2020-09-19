<?php

use Database\TinyMVCDatabase as DB;

class Permission{
    //protected $subject;
    protected $permissions;
            
    /*function __construct($subject){
        $this->subject = $subject;
        $binary = base_convert($subject->permissions, 4, 2);
        $this->permissions = [
            "owner_write" => substr($binary, 0, 1),
            "owner_read" => substr($binary, 1, 1),
            "group_write" => substr($binary, 2, 1),
            "group_read" => substr($binary, 3, 1),
            "other_write" => substr($binary, 4, 1),
            "other_read" => substr($binary, 5, 1)
        ];
    }*/
    
    function is($action){
        try{
            $query = DB::createQuery()->select('*')->where('user=?'); 
            $response = PermissionORM::getList($query, [$_SESSION["user"]]);
            
            if (count($response) == 0){
                throw new Exception("User not exist", 401);
            }
            
            $response = $_SESSION["user"] != 1 ? $response[0]->$action : 1;
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }

    /*public function canRead(){
        if ($_SESSION["user"] == $this->subject->agent_id && $this->permissions["owner_read"] == 1)
            return 1;
        else{
            $user = Agent::loadByRow("user", $_SESSION["user"]);
            $owner = Agent::loadByRow("user", $this->subject->agent_id);
            
            if ($user->agency == $owner->agency && $this->permissions["group_read"] == 1)
                return 1;
            else if ($this->permissions["other_read"] == 1)
                return 1;
            else return 0;
        }
    }*/
    
    /*public function canWrite(){
        if ($_SESSION["user"] == $this->subject->agent_id && $this->permissions["owner_write"] == 1)
            return 1;
        else{
            $user = Agent::loadByRow("user", $_SESSION["user"]);
            $owner = Agent::loadByRow("user", $this->subject->agent_id);
            
            if ($user->agency == $owner->agency && $this->permissions["group_write"] == 1)
                return 1;
            else if ($this->permissions["other_write"] == 1)
                return 1;
            else return 0;
        }
    }*/
    
    public function get(){
        return var_dump($this->permissions);
    }
    
    public function getForAllAgents(){
        global $agency;
        
        try{
            $query = DB::createQuery()->select('a.*, b.name, b.email')->join('inner', 'user', 'a.user=b.id')->where('a.agency=? AND b.deleted = 0'); 
            $response = PermissionORM::getList($query, [$agency->getId()]);
            
            if (!$this->is("edit_agent")){
                throw new Exception("Editing agents forbidden!", 501);
            }
            
            if (count($response) === 0)
                throw new Exception("There are no agents in agency", 401);            
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
    
    public function set($parameter, $value, $agent){ // только по правам
        $parameter = strval($parameter);
        $value = strval($value);
        $agent = intval($agent);
        
        try{
            $permission = PermissionORM::loadByRow("user", $agent);
            
            if ($permission === FALSE)
                throw new Exception("User is not agent", 403);
            
            $permission->$parameter = $value;
            $response = $permission->save();
        }
        catch (Exception $e){
            $response = ['error' => ['code' => $e->getCode(), 'description' => $e->getMessage()]]; // здесь нужно предусмотреть отключение объекта на случай ошибки
        }
        
        return $response;
    }
}