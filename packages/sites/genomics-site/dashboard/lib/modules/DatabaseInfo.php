<?php
require_once dirname(__FILE__) . "/JmxModule.php";

abstract class DatabaseInfo extends JmxModule {
  
  function get_params($domain, $mbean_path, $context, $attribute) {
    
    # use our internal bean
    $domain = 'org.apidb.wdk';
    
    # refresh bean data before fetching
    # e.e. in case the dblinks have changed
    return array(
      array(
          'type' => 'exec',
          'mbean' => "$domain:$mbean_path,context=$context",
          'operation' => 'refresh',
      ),
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
    return $json_response[1]{'value'};
  }

}
?>
