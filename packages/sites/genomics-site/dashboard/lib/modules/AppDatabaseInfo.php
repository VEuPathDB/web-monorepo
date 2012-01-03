<?php
require_once dirname(__FILE__) . "/DatabaseInfo.php";

class AppDatabaseInfo extends DatabaseInfo {
  var $mbean_path = 'group=Databases,type=AppDB';
}
?>
