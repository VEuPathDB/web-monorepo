<?php

require_once dirname(__FILE__) . "/Database.php";

/**
 * Application database mbean at
 * org.apidb.wdk:type=Database,role=UserDB
 * for the hosting Tomcat context.
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database
 */
class UserDatabase extends Database {

  public function __construct() {
    parent::__construct();
    $this->role = 'USER';
  }

}

?>
