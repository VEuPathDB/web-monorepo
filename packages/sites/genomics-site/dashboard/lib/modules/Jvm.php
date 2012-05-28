<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Java JVM operations from mbean
 * java.lang:type=Runtime
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage Tomcat
 */
class Jvm extends JolModule {

  private $uptime_as_text;

  public function __construct() {
    parent::__construct();
  }

  /**
   * @return array JVM attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'java.lang:type=Runtime',
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    $attrs = $response[0]->value();
    $this->set_uptime_as_text($attrs{'Uptime'});
    return $attrs;
  }

  public function uptime_as_text() {
    return $this->uptime_as_text;
  }

  private function set_uptime_as_text($uptime) {
    $seconds_up = $uptime / 1000;
    $string = seconds_as_periods($seconds_up);
    $string .= ' (since ' . date_on_elapsed_seconds($seconds_up) . ')';
    $this->uptime_as_text = $string;
  }

}

?>
