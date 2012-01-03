<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class LoggerUpdate extends JmxModule {

  var $mbean_path = 'type=Log4J';
  var $logger_map = array();

  function __construct($data) {
    $this->logger_map = $data;
    parent::__construct();
  }
  
  function get_params($domain, $mbean_path, $context, $attribute) {
    
    # use our internal bean
    $domain = 'org.apidb.wdk';

    $post_data = array();

    foreach ($this->logger_map as $name => $value) {
      array_push($post_data,
        array(
            'type' => 'write',
            'mbean' => "$domain:$mbean_path,context=$context",
            'attribute' => $name,
            'value' => $value
        )
      );
    }
    return $post_data;
  }

  /** override parent method so we get data from the right
      array index 
  **/
  function get_result_value($json_response) {
    return $json_response[0]{'value'};
  }

}
?>
