<?php

use Database\TinyMVCDatabase as DB;

class Forgot extends Database\TinyMVCDatabaseObject{
    const tablename  = 'user';

    public function getCode($email, $locale){
        global $subscription;
        
        try{
            $query = DB::createQuery()->select('id')->where('email=? AND deleted=0'); 
            $users = $this->getList($query, [strval($email)]);
            
            if (count($users) === 0){
                throw new Exception("forbidden_email_deleted_or_not_exist", 501);
            }
            
            $user = $this->load($users[0]->id);
            $subsc = $subscription->loadByRow("agency", $user->agency);
            
            if ($subsc->suspended == 1){
                throw new Exception("forbidden_agency_deleted_or_not_exist", 501);
            }
            
            $user->token = $token = rand(1000, 9999);
            $user->save();
            sendResetPasswordMail(strval($email), $token, $locale);
            $response = $users[0]->id;
        }
        catch(Exception $e){
            $response = array( 
                    'error' => array('code'  => $e->getCode(), 'description' => $e->getMessage() )
            );
        }

        return $response;
    }
    
    public function tryCode($email, $code){
        global $subscription;
        
        try{
            $query = DB::createQuery()->select('id')->where('email = ? AND token = ? AND deleted=0'); 
            $users = $this->getList($query, [strval($email), strval($code)]);
            
            if (count($users) === 0){
                throw new Exception("forbidden_email_deleted_or_not_exist", 501);
            }
            
            $user = $this->load($users[0]->id);
            $subsc = $subscription->loadByRow("agency", $user->agency);
            
            if ($subsc->suspended == 1){
                throw new Exception("forbidden_agency_deleted_or_not_exist", 501);
            }
            
            $response = $users[0]->id;
        }
        catch(Exception $e){
            $response = array( 
                    'error' => array('code'  => $e->getCode(), 'description' => $e->getMessage() )
            );
        }

        return $response;
    }
    
    public function resetPassword($email, $code, $password){
        global $subscription;
        
        try{
            $query = DB::createQuery()->select('id')->where('email = ? AND token = ? AND deleted=0'); 
            $users = $this->getList($query, [strval($email), strval($code)]);
            
            if (count($users) === 0){
                throw new Exception("forbidden_email_deleted_or_not_exist", 501);
            }
            
            $user = $this->load($users[0]->id);
            $subsc = $subscription->loadByRow("agency", $user->agency);
            
            if ($subsc->suspended == 1){
                throw new Exception("forbidden_agency_deleted_or_not_exist", 501);
            }
            
            $user->password = strval($password);
            $user->token = null;
            $user->save();
            
            $response = $users[0]->id;
        }
        catch(Exception $e){
            $response = array( 
                    'error' => array('code'  => $e->getCode(), 'description' => $e->getMessage() )
            );
        }

        return $response;
    }
}
