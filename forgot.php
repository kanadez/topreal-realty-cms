<?php

/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/

include(dirname(__FILE__).'/settings.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabase.class.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabaseObject.class.php');
include(dirname(__FILE__).'/classes/Localization.class.php');
include(dirname(__FILE__).'/classes/User.class.php');
include(dirname(__FILE__).'/classes/Tools.class.php');
include(dirname(__FILE__).'/classes/Quotes.class.php');
include(dirname(__FILE__).'/classes/Currency.class.php');
include(dirname(__FILE__).'/classes/Search.class.php');
include(dirname(__FILE__).'/classes/Property.class.php');
include(dirname(__FILE__).'/classes/Contour.class.php');
include(dirname(__FILE__).'/classes/SearchResponse.class.php');
include(dirname(__FILE__).'/classes/Stock.class.php');
include(dirname(__FILE__).'/classes/Owl.class.php');
include(dirname(__FILE__).'/classes/Utils.class.php');
include(dirname(__FILE__).'/classes/Agency.class.php');
include(dirname(__FILE__).'/classes/Subscription.class.php');
include(dirname(__FILE__).'/classes/SubscriptionExpired.class.php');
include(dirname(__FILE__).'/classes/Defaults.class.php');

session_start();

$localization = new Localization;
$owl = new Owl;
$quotes = new Quotes;
$tools = new Tools;
$stock = new Stock;
$search_response = new SearchResponse;
$contour = new Contour;
$property = new Property;
$search = new Search;
$currency = new Currency;
$user = new User;
$utils = new Utils;
$agency = new Agency;
$subscription = new Subscription;
$subscription_expired = new SubscriptionExpired;
$defaults = new Defaults;

$stylesheet = 'forgot';

define('PROJECTPATH' , '/home/admin/topreal' );

try{

/*

 NOTE: Just index served from this file. Load default controller

*/

$controller = 'core';
$action = 'core_default';
$format = 'html';
if( @isset($_GET['format'])  && in_array( $_GET['format'] , array('json','xml') ) )
	$format = $_GET['format'];

if( !file_exists( dirname(__FILE__).'/controllers/'.$controller.'.php' ) )
{
        throw new Exception('Controller ' . $controller . ' not found',404);
}

include( dirname(__FILE__).'/controllers/'.$controller.'.php' );

$func = sprintf('%s',$action);
if(!function_exists( $func))
{
	throw new Exception( 'Function '.$func.' not found',404);
}

$response = $func();

}catch(Exception $e){
	$stylesheet = 'error';

	$code = $e->getCode();	
	$stylesheet = $code == 403 ? 'forgot' : 'error';	

	//var_dump( $e->getTrace());
	//die(1);

	$response = array( 
		'error' => array('code'  => $e->getCode(), 'description' => $e->getMessage() )
	);
}

$xml = new DOMDocument;
toXml( $xml, $xml , 'document', $response );

if( isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) )
	$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
else
   $lang = 'en';

if(!in_array($lang, array('en','ru','he') )) $lang = 'en';
$xml->getElementsByTagName('document')->item(0)->setAttribute('lang',$lang);

if( $format == 'xml' )
{
    header('Content-type: text/xml; charset=utf-8');
    echo $xml->saveXML();
    exit; 
};


$xsl = new DOMDocument;
$xsl->load('xsl/'.$stylesheet.'.xsl');

// Configure the transformer
$proc = new XSLTProcessor;
$proc->importStyleSheet($xsl); // attach the xsl rules

header('Content-type: text/html; charset=utf-8');
$page = $proc->transformToXML($xml);
$localized = $localization->toXSL($page);
echo setGlobalData($localized);


function toXml( &$xml, $parentnode , $tag, $data )
{
	if( is_assoc ( $data ) )
	{
		$node = $xml->createElement( $tag );
		foreach( $data as $key => $val )
					toXml( $xml, $node, $key, $val );

	}else if( is_array( $data ) )
	{
		$node = $xml->createElement( $tag );
			foreach( $data as  $val )
						toXml( $xml, $node, 'item', $val );		
	}else
	{
		$node = $xml->createElement( $tag, $data );
	}

	$parentnode->appendChild($node);
}

function is_assoc($var) { 
    return is_array($var) && array_keys($var)!==range(0,sizeof($var)-1); 
}

/*function authorize($login, $password){
    $dummy_user = 0;
    $dummy_login = "toprealuser";
    $dummy_password = "211b3d589088f7c169d181e0e55801da";
    
    if ($login !== $dummy_login && $password !== $dummy_password)
        throw new Exception("login or password is wrong", -1);
    
    $_SESSION["user"] = $dummy_user;
    return $dummy_user;
}*/

function setGlobalData($page){
    global $user, $owl, $agency, $localization, $subscription, 
            $stock, $defaults, $search, $contour, $property, 
            $quotes, $tools, $search_response;
    
    $JSData = [
        "localization_getdefaultlocale" => $localization->getDefaultLocale(),
        "defaults_getsearch" => $defaults->getSearch(),
        "defaults_getstock" => $defaults->getStock(),
        "defaults_getlocale" => $defaults->getLocale(),
    ];
    
    return str_replace("var global_data = [];", "var global_data = ".json_encode($JSData), $page);
}