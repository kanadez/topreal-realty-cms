<?php

session_start();

if (!isset($_SESSION["user"]))
    header("Location: /login");

$stylesheet = 'searches';

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
echo $proc->transformToXML($xml);


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

