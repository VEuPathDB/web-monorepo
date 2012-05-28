<?php
require_once dirname(__FILE__) . "/Database.php";

/**
 * Application database MBean at
 * 
 * org.apidb.wdk:group=Databases,type=AppDB
 * for the hosting Tomcat context.
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database
 */
class AppDatabase extends Database {

  public function __construct() {
    parent::__construct();
    $this->type = 'AppDB';
  }

}

?>
