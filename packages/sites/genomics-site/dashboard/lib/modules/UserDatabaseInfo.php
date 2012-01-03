<?php
require_once dirname(__FILE__) . "/DatabaseInfo.php";

class UserDatabaseInfo extends DatabaseInfo {
  var $mbean_path = 'group=Databases,type=UserDB';
}
?>
