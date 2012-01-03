<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class Logger extends JmxModule {

  var $mbean_path = 'type=Log4J';

  function get_params($domain, $mbean_path, $context, $attribute) {
    
    # use our internal bean
    $domain = 'org.apidb.wdk';
    
    return array(
      array(
          'type' => 'read',
          'mbean' => "$domain:$mbean_path,context=$context",
          'attribute' => $attribute
      ),
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
