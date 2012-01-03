<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class WdkMetaMbean extends JmxModule {
  var $mbean_path = 'type=Meta';
}
?>