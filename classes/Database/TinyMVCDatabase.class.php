<?php
namespace Database{

/*!
\author Danny Dio daniel@vt77.com
\file TinyMVCDatabase.class.php
\brief TinyMVCDatabase.php - Database class implementation

\page database_descr Database
\section data_formats Data formats
\subsection database_tables Database tables

*/

use \PDO as DB;
/*! Cache for queries */
$query_cache = array();
/*!
        \class Database::SportDatabase
        Database driver\n
        Example of usage : \n
        $database  = TinyMVCDatabase::getInstance('logger');\n

        \note setings.php MUST be loaded before using this class\n
*/
class TinyMVCDatabase{


function __construct($dsn_name)
{
    global $settings,$debug;

    $DSN = strtoupper($dsn_name);

    if( $settings == null || !@isset( $settings[$DSN . '_DSN'] ) )
        
	throw new TinyMVCDatabaseException( sprintf( _( 'Settings not defined or you have insufficiently permitions to access %s' ) , $DSN ) , 500 );

    try {

	debug("Connecting database " . $settings[$DSN . '_DSN'], 2);
        
	$this->handler = new DB( $settings[$DSN . '_DSN'] , $settings['DATABASE_USER'],$settings['DATABASE_PASSWORD'], array(DB::ATTR_PERSISTENT => TRUE) );
        $this->handler->setAttribute(DB::ATTR_ERRMODE,DB::ERRMODE_EXCEPTION);
        $this->handler->exec("SET NAMES 'utf8'");
                $this->table_prefix = @isset( $settings[$DSN . '_TABLE_PREFIX'] ) ? $settings[$DSN . '_TABLE_PREFIX'] : $settings['DEFAULT_TABLE_PREFIX'];

    } catch (Exception $e) {
        
	throw new TinyMVCDatabaseException( $e->getMessage() );
    
   }
}

/*!
  Returns the *Singleton* instance of this class.
 \return Singleton object of Database class.
*/

public static function getInstance($dsn_name='default')
{

    static $instance = array();
        $class = get_called_class();
        $key = sprintf("%s:%s", $class, $dsn_name);
        if ( !@isset(  $instance[$key] ) ) {
            $instance[$key] = new $class($dsn_name);
        }
        return $instance[$key];
}

public function setDefaultTimezone( $timezone )
{
	global $debug;
	
	debug("Setting default timezone to $timezone",2);	

        $this->handler->exec( sprintf("SET time_zone = '%s';", $timezone ));
}


/*!

        createQuery\n
        Allocates empty query and returns DbQuery object. After creation you should call one of DbQuery::select or DbQuery::update

\return new created DbQuery object
*/


public static function createQuery()
{
        return  new DbQuery();
}

/*!
    loadObject\n
    loads object from database

   \param $tablename (string)
   \param $queryparams
   \throws Exception on query error
   \return array
*/

function loadObject($id, $class,$params = array() )
{
	global $debug;

	debug("Loading object ID:$id of class $class",2);

        $tablename = $class::tablename;
	$query = TinyMVCDatabase::createQuery()->select('*')->where('id=?'); //rtrim($tablename,'s').
        $sth = $this->executeQueryCache( sprintf( $query, $tablename ),  array($id) );
	$obj = $sth->fetchObject( $class, $params );
	return $obj;
}

function loadObjectByRow($row, $field, $class, $params = array())
{
	global $debug;

	debug("Loading object by row of class $class",2);

        $tablename = $class::tablename;
	$query = TinyMVCDatabase::createQuery()->select('*')->where($row.'=?'); //rtrim($tablename,'s').
        $sth = $this->executeQueryCache( sprintf( $query, $tablename ),  array($field) );
	$obj = $sth->fetchObject( $class, $params );
	return $obj;
}


function storeObject( $object )
{
	global $debug;
        
	$class = get_class( $object );
	
	debug("Storing object of class $class",2);
	$tablename = $class::tablename;
	$id_field_name = 'id'; //rtrim($tablename,'s').
	debug("ID field name : $id_field_name",6);

	$object_vars = get_object_vars( $object );
	$object_id = @intval( $object_vars[$id_field_name] );
	if( $object_id )
	{
		debug("Save object id : $object_id ",2);
		unset( $object_vars[$id_field_name] );
		$this->updateArray($tablename, $object_vars, $id_field_name, $object_id );

	}else{
		debug("Insert new object",2);
		$object_id = $this->saveArray( $tablename, $object_vars );
		$object->$id_field_name = $object_id; 
	}

	return $object_id;
}


/*!
    loadArray\n
    saves array into database

   \param $tablename (string)
   \param $queryparams
   \throws Exception on query error
   \return array
*/

function loadArray($tablename, $query , $params = null )
{

	global $debug;
        debug("Loading array '$query' from  $tablename",2);
        return $this->executeQueryCache( sprintf( $query, $tablename ), $params );
}

/*!
    updateArray\n
    saves array into database

   \param $tablename (string)
   \param $queryparams
   \throws Exception on query error
   \return int num rows updated
*/

function updateArray($tablename, $data, $keyname, $id )
{

        $fields=array_keys($data);
        $values=array_values($data);
	array_push( $values, $id );

	$fields_string = implode(',' , array_map( 
					function($a){ 
						return "$a=?";
					}, $fields ) 
	);

        $sql='UPDATE '. $this->table_prefix . $tablename . "  SET $fields_string WHERE $keyname=?";
        
	debug("[DEBUG] Update Array '$sql'",4);
	$q = $this->executeQueryCache($sql,$values);

        return $q->rowCount();
}

/*!
    saveArray\n
    saves array into database

   \param $tablename (string)
   \param $data
   \throws Exception on query error
   \return lasetIsert id if any
*/

function saveArray($tablename, $data)
{

        $fields=array_keys($data);
        $values=array_values($data);

        $fieldlist = implode(',',$fields);
        $qs=str_repeat("?,",count($fields)-1);
        $sql='insert into '.$this->table_prefix . $tablename."  ($fieldlist) values(${qs}?)";

	debug("[DEBUG] Insert new array '$sql'",4);

        $this->executeQueryCache($sql,$values);

        return $this->handler->lastInsertId();
}

/*!
    executeQueryCache\n
    prepare query and stores it in cache for later use, then execute prepared with values

   \param $sql (string) Query to prepare
   \param values (array) Values to execute
   \return recordset object
   \throws Exception on query error
*/

function executeQueryCache($sql,$values=null)
{
        global  $query_cache;

        $sql = preg_replace('!(#_)!m',$this->table_prefix,$sql);
        $key = md5($sql);

	debug("Execute query cache '$sql'",5);

        if( ! isset($query_cache[$key]) )
                $query_cache[$key] = $this->handler->prepare( $sql );

        $q = $query_cache[$key];
	$q->execute( $values );
	return $q;
}


} //End of TinyMVCDatabase class


class DbQuery{

    var $query = null;
    var $nextTable = 'a';

        function select($fields)
        {
            $this->query = sprintf( 'select %s from #_%%s as a ', $fields );
            return $this;
        }
        
        function delete()
        {
            $this->query = sprintf( 'delete from #_%%s as a ');
            return $this;
        }

        function from($tablename)
        {
            $this->query = sprintf( $this->query , $tablename );
            return $this;
        }

        function update( $fields )
        {
            throw new Exception('update not implemented yet');
        }

        function where( $cond )
        {
            $this->query  .= ' where ' . $cond;
            return $this;
        }

        function order( $order )
        {
            $this->query .= ' order by '.$order;
            return $this;
        }

        function join($dir,$tablename,$on)
        {
            $this->query .= $dir.' join  #_'.$tablename.' as '.(++$this->nextTable).' on '.$on;
            return $this;
        }

        function __toString()
        {
                return $this->query;
        }

} //End of DbQuery class

class TinyMVCDatabaseException extends \Exception {};

}// end of namespace
