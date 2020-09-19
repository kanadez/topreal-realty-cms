<?php
/*!
\author Danny Dio daniel@vt77.com
\file TinyMVCUser.class.php
\brief TinyMVCUser.php - Test class for ORM model

Base usage :

#Get all users ( maps to query select * from [DEFAULT_DSN_PREFIX]_users );
$users_list = TinyMVCUser::getList();

#Get user by id 1 ( maps to query select * from [DEFAULT_DSN_PREFIX]_users where user_id=1)
$user = TinyMVCUser::load(1);

#Get all active users ( maps to query select * from [DEFAULT_DSN_PREFIX]_users where status='Active')
$query_users_by_state = Database::createQuery()->select('*')->where('status=?');
$users_list = TinyMVCUser::getList( $query_users_by_state , array('Active'));

#create new  object 

$user = new TinyMVCUser()
$user->name = 'Test' ( or equivalent $user->setName('Name') )
$user->setFoo('Some property');
$user->save();

#save object ( property UserId != null after save or calling load() function)

$user->name = 'Another';
$user->save();
*/

use Database as DB;

class TinyMVCUser extends DB\TinyMVCDatabaseObject{
        const tablename  = 'users';
}

?>
