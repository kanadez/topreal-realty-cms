<?php
/*!
\author Danny Dio daniel@vt77.com
\file TinyMVCDatabaseObject.class.php
\brief TinyMVCDatabaseObject.php - DatabaseObject base class implementation

\page database_descr Database
\section data_formats Data formats
\subsection database_object Database tables

*/


namespace Database{

use \PDO as DB;


class TinyMVCDatabaseObject implements \Serializable
{

    function __construct($data=null)
    {
        if(!$this::tablename)
            throw new TinyMVCDatabaseException('Variable const tablename not exists in  class ' . get_called_class() );
        if( $data )
                $this->populate( $data );

	//$this->db = TinyMVCDatabase::getInstance($dsn?$dsn:'default');

    }

/*!
    __call\n
    Internal method. Not used externally

   \param $method (string) [get/set]Varname
   \param $args (array) arguments for property
   \return none
*/
    function __call($method,$args){

        $func  = substr( $method, 0, 3 );
        $prop = preg_replace('!([A-Z])!',"\"_\".strtolower(\"$1\")", lcfirst( substr( $method, 3 ) ));

        if( $func == 'get')
        {
            if( !property_exists( $this, $prop ) )
                        return false;
            return $this->$prop;

        }else if($func == 'set' )
        {
           if( sizeof($args) != 1 )
                        throw new \Exception('Wrong argument count to call ' . $method );
            $this->$prop = $args[0];
        }
    }


/*!
    populate\n
    Sets class variables according to values in $data

   \param $data (assoc array)
   \return none

*/


    function populate( $data )
    {
        if( is_array($data) )
        {
            foreach ($data as $key => $value) {
                $this->$key = $value;
            }
        }
    }


/*!
    getList\n
    getsList of objects of __CLASS__  according to query

   \param $query (DBQury)
   \param $params (assoc array) Additional variables to populate
   \param $driver (string)  driver name (from settings.php)
   \return (array) list of loaded objects
   \throws TinyMVCDatabaseException on DB error
*/

  static  function getList( $query = null, $params=null, $dsn='default' )
  {
        $class = get_called_class();
	$database = TinyMVCDatabase::getInstance($dsn);
        if( $query == null )
	  $query = TinyMVCDatabase::createQuery()->select('*');
	
	$sth = $database->loadArray( $class::tablename, $query , $params);
	$list = array();
	while($row = $sth->fetch(DB::FETCH_ASSOC) ){
	    $obj = new $class($row);
            $list[] = $obj; // Associative array or not...
        }
        return $list;
}


/*!
    save\n
    saves  object to database

   \todo Implement IotDatabaseObject::save
   \note Note implemented yet
   \return (array) list of loaded objects
   \throws IotDatabaseException on DB error
*/


    function save( $dsn='default' )
    {
   	$db = TinyMVCDatabase::getInstance($dsn); 
        $id = $db->storeObject( $this );
	return $id; 
    }

/*!
    load\n
    load  object from database by its id

    \param $id object id
    \param $params (assoc array) Additional variables to populate
    \param $driver (string)  driver name (from settings.php)
    \return (object) object of class __CLASS__
    \throws TinyMVCDatabaseException on DB error
*/


    static function load($id,$params = array(), $dsn='default')
    {
        $db = TinyMVCDatabase::getInstance($dsn);
        $class = get_called_class();
        return $db->loadObject($id, $class, $params );
    }
    
    static function loadByRow($row, $field, $params = array(), $dsn='default')
    {
        $db = TinyMVCDatabase::getInstance($dsn);
        $class = get_called_class();
        return $db->loadObjectByRow($row, $field, $class, $params);
    }

    static function create( $data )
    {
        $class = get_called_class();
        return new $class( $data );
    }

    public function serialize ( )
    {
        $data = get_object_var();
        return json_encode( $data );
    }

    public function unserialize ( $serialized )
    {
        $this->populate( json_decode( $serialized ) );
    }

    public function getFormData()
    {

    }

}

}

?>
