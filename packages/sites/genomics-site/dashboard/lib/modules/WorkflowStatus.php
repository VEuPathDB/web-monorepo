<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Superclass for WorkflowStatus mbean access
 *
 */
class WorkflowStatus extends JolModule {

  public function __construct() {
    parent::__construct();
  }

  /**
   * @return array WorkflowStatus attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'org.apidb.wdk:type=WorkflowStatus,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    if ($response->has_error()) {
      return array();
      #$error1 = $response->get_errors();
      #throw new Exception($error1[0]->error() .  " for " . $req->curl_cli_equivalent());
    }
    return $response[0]->value();
  }

}
?>
