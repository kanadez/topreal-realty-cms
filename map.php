<?php

//ini_set('display_errors',1);
//ini_set('display_startup_errors',1);
//error_reporting(-1);

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

if (!isset($_SESSION["user"])){ // если разлогинен
    header("Location: /login");
}
elseif ($user->sessionNotSeenTooLong()){ // если залогинен, но давно не был
    session_destroy();
    session_unset();
    unset($_SESSION["user"]);
    unset($_SESSION["LAST_ACTIVITY"]);
    header("Location: /login");
}

$user->setSeen();
$subscription->checkPassed();

$stylesheet = 'map';
$app_ver = "2";
define('PROJECTPATH' , '/home/admin/topreal' );

//ini_set('display_errors',1);
//ini_set('display_startup_errors',1);
//libxml_disable_entity_loader(false);
//error_reporting(-1);


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
	$stylesheet = $code == 403 ? 'login' : 'error';	

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
$page_localized = $localization->toXSL($page);
$page_cache_prevented = cachePrevent($page_localized);
echo setGlobalData($page_cache_prevented);

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

function cachePrevent($page){
    global $app_ver;
    
    return str_replace("?v=X", "?v=".$app_ver, $page);
}

function setGlobalData($page){
    global $user, $owl, $agency, $localization, $subscription, 
            $stock, $defaults, $search, $contour, $property, 
            $quotes, $tools, $search_response;
    
    $JSData = [
        "getmyid" => $user->getMyId(),
        "getmytype" => $user->getMyType(),
        "getmyname" => $user->getMyName(),
        "getcontactemail" => $user->getContactEmail(),
        "getmyofficeinfo" => $user->getMyOfficeInfo(),
        "owl_getsessions" => $owl->getSessions(),
        "owl_getsessionsforall" => $owl->getSessionsForAll(),
        "agency_getagentslist" => $agency->getAgentsList(),
        "localization_getdefaultlocale" => $localization->getDefaultLocale(),
        "subscription_checkremaining" => $subscription->checkRemaining(),
        //"stock_checkpayed" => $stock->checkPayed(),
        "defaults_getsearch" => $defaults->getSearch(),
        "defaults_getstock" => $defaults->getStock(),
        "defaults_getlocale" => $defaults->getLocale(),
        //"defaults_getsac" => $defaults->getSac(),
        //"search_getqueryformoptions" => $search->getQueryFormOptions(),
        "property_getformoptions" => $property->getFormOptions(),
        //"search_clearing" => $search->clearing(),
        //"user_lockagent" => $user->lockAgent(),
        //"search_getempty" => $search->getEmpty(),
        "contour_list" => $contour->getContoursList(isset($_GET["id"]) ? $_GET["id"] : null),
        //"search_queryempty" => $_GET["response"] == "map" ? $search->queryEmpty() : null,
        "quotes_get" => $quotes->get(),
        "tools_getstockcounter" => $tools->getStockCounter(),
        "searchresponse_get" => $search_response->get($_GET["search"])
    ];
    
    return str_replace("var global_data = [];", "var global_data = ".json_encode($JSData), $page);
}