<?php
/*
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
*/
include(dirname(__FILE__).'/settings.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabase.class.php');
include(dirname(__FILE__).'/classes/Database/TinyMVCDatabaseObject.class.php');
include(dirname(__FILE__).'/classes/System.class.php');
include(dirname(__FILE__).'/classes/Log.class.php');
include(dirname(__FILE__).'/classes/FCM.class.php');
include(dirname(__FILE__).'/classes/GoogleApiKey.class.php');
include(dirname(__FILE__).'/classes/Geo.class.php');
include(dirname(__FILE__).'/classes/Translate.class.php');
include(dirname(__FILE__).'/classes/Proxy.class.php');
include(dirname(__FILE__).'/classes/Quotes.class.php');
include(dirname(__FILE__).'/classes/Login.class.php');
include(dirname(__FILE__).'/classes/Forgot.class.php');
include(dirname(__FILE__).'/classes/App.class.php');
include(dirname(__FILE__).'/classes/User.class.php');
include(dirname(__FILE__).'/classes/History.class.php');
include(dirname(__FILE__).'/classes/Selected.class.php');
include(dirname(__FILE__).'/classes/Photo.class.php');
include(dirname(__FILE__).'/classes/Doc.class.php');
include(dirname(__FILE__).'/classes/ResponseList.class.php');
include(dirname(__FILE__).'/classes/Signature.class.php');
include(dirname(__FILE__).'/classes/Owl.class.php');
include(dirname(__FILE__).'/classes/Defaults.class.php');
include(dirname(__FILE__).'/classes/SearchResponse.class.php');
include(dirname(__FILE__).'/classes/Search.class.php');
include(dirname(__FILE__).'/classes/ContourPropertyProcessed.class.php');
include(dirname(__FILE__).'/classes/ContourProperty.class.php');
include(dirname(__FILE__).'/classes/Contour.class.php');
include(dirname(__FILE__).'/classes/PropertyEvent.class.php');
include(dirname(__FILE__).'/classes/Property.class.php');
include(dirname(__FILE__).'/classes/PropertyExternal.class.php');
include(dirname(__FILE__).'/classes/Client.class.php');
include(dirname(__FILE__).'/classes/ClientComparison.class.php');
include(dirname(__FILE__).'/classes/ClientComparisonList.class.php');
include(dirname(__FILE__).'/classes/ClientPropose.class.php');
include(dirname(__FILE__).'/classes/PropertyComparison.class.php');
include(dirname(__FILE__).'/classes/PropertyComparisonList.class.php');
include(dirname(__FILE__).'/classes/Agency.class.php');
include(dirname(__FILE__).'/classes/AgencyORM.class.php');
include(dirname(__FILE__).'/classes/Agent.class.php');
include(dirname(__FILE__).'/classes/Project.class.php');
include(dirname(__FILE__).'/classes/Synonim.class.php');
include(dirname(__FILE__).'/classes/AutocompleteSynonim.class.php');
include(dirname(__FILE__).'/classes/Autocomplete.class.php');
include(dirname(__FILE__).'/classes/GoogleAC.class.php');
include(dirname(__FILE__).'/classes/Currency.class.php');
include(dirname(__FILE__).'/classes/Dimensions.class.php');
include(dirname(__FILE__).'/classes/Permission.class.php');
include(dirname(__FILE__).'/classes/PermissionORM.class.php');
include(dirname(__FILE__).'/classes/Localization.class.php');
include(dirname(__FILE__).'/classes/Tools.class.php');
include(dirname(__FILE__).'/classes/Utils.class.php');
include(dirname(__FILE__).'/classes/Builder.class.php');
include(dirname(__FILE__).'/classes/BuilderTmp.class.php');
include(dirname(__FILE__).'/classes/Collector.class.php');
include(dirname(__FILE__).'/classes/CollectorEvent.class.php');
include(dirname(__FILE__).'/classes/CollectorLocale.class.php');
include(dirname(__FILE__).'/classes/Registration.class.php');
include(dirname(__FILE__).'/classes/Payment.class.php');
include(dirname(__FILE__).'/classes/Contact.class.php');
include(dirname(__FILE__).'/classes/Subscription.class.php');
include(dirname(__FILE__).'/classes/SubscriptionImprove.class.php');
include(dirname(__FILE__).'/classes/SubscriptionExpired.class.php');
include(dirname(__FILE__).'/classes/Pricing.class.php');
include(dirname(__FILE__).'/classes/Stock.class.php');
include(dirname(__FILE__).'/classes/Email.class.php');

session_start();

$login = new Login;
$proxy = new Proxy;
$fcm = new FCM;
$forgot = new Forgot;
$search_response = new SearchResponse;
$search = new Search;
$defaults = new Defaults;
$contour = new Contour;
$geo = new Geo;
$translate = new Translate;
$quotes = new Quotes;
$property_event = new PropertyEvent;
$property = new Property;
$property_external = new PropertyExternal;
$client = new Client;
$clientcomp = new ClientComparison;
$clientcomplist = new ClientComparisonList;
$clientprop = new ClientPropose;
$propertycomp = new PropertyComparison;
$propertycomplist = new PropertyComparisonList;
$agency = new Agency;
$synonim = new Synonim;
$ac_synonim = new AutocompleteSynonim;
$autocomplete = new Autocomplete;
$googleac = new GoogleAC;
$currency = new Currency;
$dimensions = new Dimensions;
$photo = new Photo;
$property_doc = new PropertyDoc;
$client_doc = new ClientDoc;
$user = new User;
$responselist = new ResponseList;
$owl = new Owl;
$localization = new Localization;
$agency_orm = new AgencyORM; // костыль
$tools = new Tools;
$permission_rom = new PermissionORM; // костыль
$permission = new Permission;
$utils = new Utils;
$builder = new Builder;
$buildertmp = new BuilderTmp;
$registration = new Registration;
$payment = new Payment;
$contact = new Contact;
$subscription = new Subscription;
$subscription_improve = new SubscriptionImprove;
$subscription_expired = new SubscriptionExpired;
$pricing = new Pricing;
$stock = new Stock;
$email = new Email;

// updating currencies
$currency->update();

//$apikey = preg_replace( '/([^a-z0-9]+)/m', '' ,  $_GET['key'] ); 
$controller = preg_replace( '/[^a-z0-0\/]+/m', '', $_GET['controller'] );
$method = preg_replace( '/[^a-z0-0\/]+/m', '', $_GET['method'] );
$format = $_GET['format'];

if( !in_array( $format, array('xml','json') ) )
	$format = 'json';

try{

	//ACL::checkApiKey( $apikey );
        
        $controller_file = sprintf('%s/controllers/%s.php', dirname( __FILE__ ) , $controller );

        if(!file_exists( $controller_file ) )
                throw new Exception('Controller '.$_GET['controller'].' not found', 404 );
        require_once ( $controller_file );

        $function_name = sprintf( "%s_%s",  $controller , $method );

        if( !function_exists( $function_name ) )
                 throw new Exception('Function '.$_GET['method'].' not found', 404 );

        $ret = call_user_func( $function_name, $this );

	$response = $ret;
        

}catch(Exception $e){

	$response = array( 
		'success'=>"no", 'error' => array('code'  => $e->getCode(), 'description' => $e->getMessage() )
	);
}






if( $format == 'json' )
	sendJson( $response );

$xml = new DOMDocument;
toXml( $xml, $xml , 'document', $response );

$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
if(!in_array($lang, array('en','he','ru') )) $lang = 'en';
$xml->getElementsByTagName('document')->item(0)->setAttribute('lang',$lang);

if( $format == 'xml' )
{
    header('Content-type: text/xml; charset=utf-8');
    echo $xml->saveXML();
    exit;
};


die('Unknown format');


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

function sendJson($data)
{
    header('Content-type: application/json');
    echo json_encode( $data );
    exit;
}

?>

