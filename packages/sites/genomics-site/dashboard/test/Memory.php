<?php

/**
 * Access to JVM memory stats
 * java.lang:type=Memory
 *
 * @author Mark Heiges <mheiges.edu>
 */
require_once dirname(__FILE__) . "/../lib/JolExecOperation.php";
require_once dirname(__FILE__) . "/../lib/JolRequest.php";
require_once dirname(__FILE__) . "/../lib/JolReadOperation.php";

class Memory {

  private $base_url;

  public function __construct($base_url) {
    $this->base_url = $base_url;
  }

  /**
   *
   * @return array Memory attributes
   */
  public function attributes() {
    $req = new JolRequest($this->base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'java.lang:type=Memory',
                'attribute' => 'HeapMemoryUsage',
            ));
    $req->add_operation($read);
    print "\n" . $req->curl_cli_equivalent() . "\n\n";

   $response = $req->invoke();
    return $response[0]->value();
  }

  public function bad_request() {
    $req = new JolRequest($this->base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'java.lang:type=Memory',
                'attribute' => 'BOGUS',
            ));
    $req->add_operation($read);

    $response = $req->invoke();
    if ($response->has_error()) {
      $error1 = $response->get_errors();
      throw new Exception($error1[0]->error());
    }
    return $response[0]->value();
  }

  /**
   * @param boolean true for success, false if error
   */
  public function gc() {
    $req = new JolRequest($this->base_url);
    $exec = new JolExecOperation(array(
                'mbean' => 'java.lang:type=Memory',
                'operation' => 'gc',
            ));
    $req->add_operation($exec);
    $response = $req->invoke();
    return !$response[0]->is_error();
  }

}

?>
