<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Superclass for TuningManagerStatus mbean access
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database

 */
class TuningManagerStatus extends JolModule {

  public function __construct() {
    parent::__construct();
  }

  /**
   * @return array TuningManagerStatus attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'org.apidb.wdk:type=TuningManagerStatus,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    if ($response->has_error()) {
      $error1 = $response->get_errors();
      throw new Exception($error1[0]->error() .  " for " . $req->curl_cli_equivalent());
    }
    return $response[0]->value();
  }

}
?>
