<?php
require_once dirname(__FILE__) . "/JmxModule.php";
require_once dirname(__FILE__) . "/../../functions.php.inc";

class JvmInfo extends JmxModule {  
  var $mbean_path = 'type=Runtime';

  function get_params($domain, $mbean_path, $context, $attribute) {
    $domain = "java.lang";
    return array(
      array(
          'type' => 'read',
          'mbean' => "$domain:$mbean_path",
          'attribute' => $attribute
      ),
    );  
  }

  function uptime_as_text() {
    $seconds_up = $this->data_map{'Uptime'} /1000;
    $string = seconds_as_periods($seconds_up);
    $string .= ' (since ' . date_on_elapsed_seconds($seconds_up) . ')';
    return $string;
  }

}
?>
