<?php
require_once dirname(__FILE__) . "/Database.php";

/**
 * Connection pool MBean at
 * 
 * org.apidb.wdk:type=Database,role=UserDB,data=ConnectionPool
 * for the hosting Tomcat context.
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database
 */
class UserDBConnectionPool extends ConnectionPool {

  public function __construct() {
    parent::__construct();
    $this->role = 'UserDB';
  }

}

?>
