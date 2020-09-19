<?php

/*!
\author Danny Dio daniel@vt77.com
\file TinyMVCDatabase.class.php
\brief TinyMVCDatabase.php - Database class implementation

\page database_descr Database
\section data_formats Data formats
\subsection database_tables Database tables

*/


define('ACL_PERMISSION_READ', 1);
define('ACL_PERMISSINS_CHANGE', 2);

/*!
        \class TinyMVCApplication
        Base Application class\n
        Example of usage : \n
        $database  = TinyMVCApplication::createApplication($request_uri);\n

        \note setings.php MUST be loaded before using this class\n
*/



class TinyMVCApplication{

	static private $instance = null;


function __construct($uri){
	$permitions = ACL::checkUserPermitions( $uri );
	
	
	preg_replace('');
	
	$uriparts = split('/', $uri );

	$this->controller = 'default';
	$this->function	  = 'load';

	if( is_array( $uriparts ) && sizeof($uriparts) > 0 && $uriparts[0] )
	{
		if(sizeof( $uriparts ) > 1 )
			$this->controller = array_shift( $uriparts );
		
		if(!empty($uriparts))
			$this->function = implode('_',$uriparts);
	}

	$permitions = ACL::checkUserPermitions( $this->controller, $this->function );
}

static function createApplication($uri){
	$instance = new OmniApplication( $uri );
	return $instance;
}

function execute()
{
	$controller_file = sprintf('%s/controllers/%s.controller.php', VOIPMANSITE_HOME , $this->controller );
	
	if(!file_exists( $controller_file ) )
		throw new Exception('Controller not found', 404 );
	require_once ( $controller_file );

	$function_name = sprintf( "%s_%s",  $this->controller , $this->function );	

	if( !function_exists( $function_name ) )
		 throw new Exception('Function not found', 404 );
	
	return call_user_func( $function_name, $this );
}

}

class ACL{
static function checkUserPermitions($controller,$function)
{
	//Throws exception on wrong permitions
	return ACL_PERMITION_READ | ACL_PERMITION_READ ;
}	
}

