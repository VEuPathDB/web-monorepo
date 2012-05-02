<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class ReloadWebapp extends JmxModule {

  var $mbean_path;
  
  function get_params($domain, $mbean_path, $context, $attribute) {

    $domain = $this->configuration->get('tomcat_engine_name'); // Catalina
    $engine_host  = $this->configuration->get('tomcat_engine_host_name'); // localhost
    $context = $this->get_context();

    return array(
        array(
            'type' => 'exec',
            'mbean' => "$domain:" .
                       'j2eeType=WebModule,name=//' . 
                       $engine_host . '/' . $context . 
                       ',J2EEApplication=none,J2EEServer=none',
            'operation' => 'reload',
        )
      );
    }

  /** override parent method so we get data from the right
      array index 
  **/
  function get_result_value($json_response) {
    if (array_key_exists('error', $json_response)) {
      error_log($json_response{'error'});
      return null;
    }
    return $json_response[0]{'value'};
  }

  public function get_context() {
    return $this->configuration->get('context_name');
  }

  // must set $mbean_path for superclass, even though we aren't using it.
  // TODO: refactor so this is not required.
  public function get_mbean_path() {
    return '';
  }
}
?>
