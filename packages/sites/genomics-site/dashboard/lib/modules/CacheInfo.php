<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class CacheInfo extends JmxModule {
  var $mbean_path = 'type=Cache';
}
?>
