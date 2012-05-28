<?php

require_once dirname(__FILE__) . "/JolQueryResultItemSuccess.php";
require_once dirname(__FILE__) . "/JolQueryResultItemError.php";

/**
 * @package JMX
 * @subpackage Response
 */
class JolQueryResult implements IteratorAggregate, ArrayAccess {

  private $position;
  private $json_result;
  private $has_error = FALSE;
  private $result_array = array();
  private $error_array = array();

  public function __construct($json_result) {
    if (empty($json_result)) {
      error_log('json_result is empty. ' . ' at ' . __CLASS__ . ' line ' . __LINE__);
      //throw new Exception("json result is empty");
      return;
    }
    $this->position = 0;
    $this->set_json_result($json_result);
  }

  public function set_json_result($json_result) {
    $this->json_result = $json_result;
    $ar_result = json_decode($this->json_result, true);

    if (empty($ar_result)) {
      trigger_error('unable to decode empty json result' . ' at ' . __CLASS__ . ' line ' . __LINE__);
      return;
    }
    // normalize single entity responses into an array
    // so they are consistent with bulk query responsess
    if (array_key_exists('status', $ar_result)) {
      $ar_result = array($ar_result);
    }

    foreach ($ar_result as $result) {
      if (isset($result) && $result{'status'} == '200') {
        array_push($this->result_array, new JolQueryResultItemSuccess($result));
      } else {
        $error = new JolQueryResultItemError($result);
        array_push($this->result_array, $error);
        $this->has_error = TRUE;
        array_push($this->error_array, $error);
      }
    }
  }

  public function has_error() {
    return $this->has_error;
  }

  public function is_success() {
    return !$this->has_error;
  }

  public function get_errors() {
    return $this->error_array;
  }

  public function get_json_result() {
    return $this->json_result;
  }

  public function get_result_array() {
    return $this->result_array;
  }

  public function getIterator() {
    return new ArrayIterator($this->result_array);
  }

  /** ArrayAccess methods * */
  public function offsetSet($offset, $value) {
    if (is_null($offset)) {
      $this->result_array[] = $value;
    } else {
      $this->result_array[$offset] = $value;
    }
  }

  public function offsetExists($offset) {
    return isset($this->result_array[$offset]);
  }

  public function offsetUnset($offset) {
    unset($this->result_array[$offset]);
  }

  public function offsetGet($offset) {
    return isset($this->result_array[$offset]) ? $this->result_array[$offset] : null;
  }

}
?>
