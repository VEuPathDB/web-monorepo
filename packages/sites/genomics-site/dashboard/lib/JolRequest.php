<?php

require_once dirname(__FILE__) . "/UserAgent.php";
require_once dirname(__FILE__) . "/JolQueryResult.php";

/**
 * JolRequest encapsulates an HTTP POST request for a given URL and
 * collection of operations (read, exec, list, search, etc).
 *
 * @author Mark Heiges <mheiges.edu>
 * @package JMX
 * @subpackage Request
 */
class JolRequest {

  private $base_url;
  private $operations;

  /**
   *
   * @param string base_url e.g. http://localhost:666/jolokia/
   */
  public function __construct($base_url = null) {
    $this->operations = array();
    $this->set_base_url($base_url);
  }

  public function set_base_url($base_url) {
    $this->base_url = $base_url;
  }

  public function add_operation($operation) {
    if ($operation->is_valid()) {
      array_push($this->operations, $operation->http_post_array());
      return;
    }
    throw new Exception("Invalid " . get_class($operation) . " object.");
  }

  public function http_postdata_as_json() {
    if (count($this->operations) == 0) {
      return null;
    } elseif (count($this->operations) == 1) {
      return json_encode($this->operations[0]);
    } else {
      return json_encode($this->operations);
    }
  }

  /**
   * Returns an curl command that can be used on the command line for debugging.
   *
   * @return string curl command
   */
  public function curl_cli_equivalent() {
    return 'curl -d \'' . $this->http_postdata_as_json() . '\' ' . $this->base_url;
  }

  /**
   *
   * @return JolQueryResult
   */
  public function invoke() {
    $opts = array(
        'url' => $this->base_url,
        'post_fields' => $this->http_postdata_as_json(),
    );
    $ua = new UserAgent($opts);
    $this->jmx_query_result = new JolQueryResult($ua->get_content());
    return $this->jmx_query_result;
  }

}

?>
