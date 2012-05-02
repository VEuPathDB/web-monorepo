<?
require_once dirname(__FILE__) . "/JmxModule.php";
require_once dirname(__FILE__) . "/../../functions.php.inc";

class WebappInfo extends JmxModule {

  var $mbean_path;

  public function get_params($domain, $mbean_path, $context, $attribute) {

    $domain = $this->configuration->get('tomcat_engine_name'); // Catalina
    $engine_host  = $this->configuration->get('tomcat_engine_host_name'); // localhost
    $context = $this->get_context();
    
    $attribute = array("startTime");

    return array(
      array(
          'type' => 'read',
          'mbean' => "$domain:" .
                     'type=Loader,path=/' . $context . 
                     ',host=' . $engine_host,
          'attribute' => array('loaderRepositoriesString') // attribute in array to force array in response
      ),
      array(
          'type' => 'read',
          'mbean' => "$domain:" .
                     'j2eeType=WebModule,name=//' . 
                     $engine_host . '/' . $context . 
                     ',J2EEApplication=none,J2EEServer=none',
          'attribute' => $attribute
      ),
    );  
  }

  /** override parent method so we get data from the right
      array indexes 
  **/
  function get_result_value($json_response) {
    if (array_key_exists('value', $json_response[0])) {
      return array_merge($json_response[0]{'value'}, $json_response[1]{'value'});
    }
    return null;
  }

  public function uptime_as_text() {
    if ($this->data_map{'startTime'} == 0) { return null; }
    $seconds_elapsed = max(0, (time() - ($this->data_map{'startTime'} / 1000)) );
    $string = seconds_as_periods($seconds_elapsed);
    $string .= ' (since ' . date_on_elapsed_seconds($seconds_elapsed) . ')';
    return $string;

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

// classpath in type=Loader,path=/cryptodb.msh,host=localhos
?>