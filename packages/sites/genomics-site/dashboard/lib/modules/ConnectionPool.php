<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Superclass for OpenConections mbean access
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Database

 */
class ConnectionPool extends JolModule {

  protected $role;

  public function __construct($dbName) {
    parent::__construct();
    $this->role = $dbName;
  }

  /**
   * @return array Database attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => $this->get_mbean(),
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    if ($response->has_error()) {
      $error1 = $response->get_errors();
      throw new Exception($error1[0]->error() .  " for " . $req->curl_cli_equivalent());
    }
    return $response[0]->value();
  }

  private function get_mbean() {
    return 'org.gusdb.wdk:type=Database,role=' .
           $this->role . ',data=ConnectionPool' .
           ',path=' . $this->path_name;
  }

}

?>
