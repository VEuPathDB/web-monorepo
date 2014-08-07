<?php
require_once dirname(__FILE__) . "/ConnectionPool.php";

/**
 * Connection pool MBean at
 * 
 * org.apidb.wdk:type=Database,role=AppDB,data=ConnectionPool
 * for the hosting Tomcat context.
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database
 */
class AppDBConnectionPool extends ConnectionPool {

  public function __construct() {
    parent::__construct();
    $this->role = 'AppDB';
  }

}

?>
