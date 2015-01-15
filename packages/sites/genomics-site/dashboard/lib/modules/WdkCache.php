<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * WDK Cache stats and operations.
 * org.gusdb.wdk:type=Cache
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage WDK
 */
class WdkCache extends JolModule {

  public function __construct() {
    parent::__construct();
  }

  /**
   * @return array Application Database attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=Cache,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    return $response[0]->value();
  }

  /**
   *
   * @return boolean TRUE if operation was successful, otherwise FALSE
   */
  public function reset() {
    $req = new JolRequest($this->jol_base_url);
    $exec = new JolExecOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=Cache,path=' . $this->path_name,
                'operation' => 'resetWdkCache',
            ));
    $req->add_operation($exec);
    $response = $req->invoke();
    return $response[0]->is_success();
  }

  public function toggleWdkIsCaching() {
    $req = new JolRequest($this->jol_base_url);
    $exec = new JolExecOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=Cache,path=' . $this->path_name,
                'operation' => 'toggleWdkIsCaching',
            ));
    $req->add_operation($exec);
    $response = $req->invoke();
    return $response[0]->is_success();  
  }
}

?>
