<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class ResetWdkCache extends JmxModule {

  var $mbean_path = 'type=Cache';
  
  function get_params($domain, $mbean_path, $context, $attribute) {

    return array(
        array(
            'type' => 'exec',
            'mbean' => "$domain:$mbean_path,context=$context",
            'operation' => 'refresh',
        )
      );
    }

  /** override parent method so we get data from the right
      array index 
  **/
  function get_result_value($json_response) {
    return $json_response[0]{'value'};
  }

}
?>
