<?php

require_once dirname(__FILE__) . "/JolModule.php";
require_once dirname(__FILE__) . "/../../functions.php.inc";

/**
 * Access to mulitple Tomcat mbeans, including selected attributes
 * and a webapp reload operation.
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage Tomcat
 */
class Webapp extends JolModule {

  private $uptime_as_text;
  private $webapp_read_op;
  private $domain;
  private $attributes;

  public function __construct() {
    parent::__construct();
    $this->domain = $this->configuration->get('tomcat_engine_name'); // Catalina
    $this->context_path = $this->configuration->get('context_path');
  }

  /**
   * @return array of attributes
   */
  public function attributes() {

    $req = new JolRequest($this->jol_base_url);

    $loader = new JolReadOperation(array(
                'mbean' => $this->domain .
                ':type=Loader,path=' . $this->context_path .
                ',host=' . $this->engine_host,
                'attribute' => array('loaderRepositoriesString'), // use array so we get array response
            ));

     $app = new JolReadOperation(array(
                'mbean' => "$this->domain:" .
                'j2eeType=WebModule,name=//' .
                $this->engine_host . $this->context_path .
                ',J2EEApplication=none,J2EEServer=none',
                'attribute' => array('startTime', 'path'),
            ));   

    // list of all the other webapp paths deployed in the instance
    $all_deployed_webmodules = new JolReadOperation(array(
               'mbean' => "$this->domain:" .
               'j2eeType=WebModule,*' ,
               'attribute' => array('path'),
           ));   

    $req->add_operation($loader);
    $req->add_operation($app);
    $req->add_operation($all_deployed_webmodules);

    $response = $req->invoke();

    if ($response->has_error()) {
      throw new Exception('invalid response: ' . $response->get_json_result());
    }

    $this->attributes = array_merge_recursive($response[0]->value(), $response[1]->value());

    $this->attributes{'other_deployed_webapps'} = array();
    $all_webmodules = array_merge_recursive($response[2]->value());
    foreach ($all_webmodules as $module) {
        if ($this->attributes{'path'} == $module{'path'}) { continue; }
        $webapp = preg_replace('/^\//', '', $module{'path'});
        array_push($this->attributes{'other_deployed_webapps'}, ($webapp ?: 'ROOT'));    
    }

    $this->set_uptime_as_text($this->attributes{'startTime'});
    return $this->attributes;
  }


  /**
   * Reloads the webapp and refreshes the attributes collection.
   *
   * @return boolean TRUE if operation was successful, otherwise FALSE
   */
  public function reload() {

    $req = new JolRequest($this->jol_base_url);
    $exec = new JolExecOperation(array(
                'mbean' => "$this->domain:" .
                'j2eeType=WebModule,name=//' .
                $this->engine_host . $this->context_path .
                ',J2EEApplication=none,J2EEServer=none',
                'operation' => 'reload',
            ));
    $req->add_operation($exec);
    $response = $req->invoke();
    if ($response->has_error()) {
      return false;
    }

    // refresh attributes
    $this->attributes();

    return $response[0]->is_success();
  }

  public function uptime_as_text() {
    return $this->uptime_as_text;
  }

  private function set_uptime_as_text($starttime) {
    if ($starttime == 0) {
      return null;
    }
    $seconds_elapsed = max(0, (time() - ($starttime / 1000)));
    $string = seconds_as_periods($seconds_elapsed);
    $string .= ' (since ' . date_on_elapsed_seconds($seconds_elapsed) . ')';
    $this->uptime_as_text = $string;
  }

}
?>
