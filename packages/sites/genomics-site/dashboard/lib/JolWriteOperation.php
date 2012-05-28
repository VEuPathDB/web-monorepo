<?php

require_once dirname(__FILE__) . "/JolOperation.php";

/**
 * A single Jolokia WRITE operation for adding to a {@link JolRequest}.
 *
 * Supply the full POST data payload as an array to the constructor.
 * The array should json_encode() to a valid json POST request.
 *
 * For example, use
 * <pre>
 *   new JolReadOperation(array(
 *       'mbean' => 'java.lang:type=ClassLoading',
 *       'attribute' => 'Verbose',
 *       'value' => 'true',
 *       'path' => null,
 *       ));
 * </pre>
 * to produce the HTTP POST json for Jolokia
 * <pre>
 *      {"type":"write",
 *       "mbean":"java.lang:type=ClassLoading",
 *       "attribute":"Verbose",
 *       "value":"true",
 *       "path":null}
 * </pre>
 *
 * The mbean, attritribute and value properties must be set.
 *
 * After instantiating the Operation object, add it to a {@link JolRequest}
 * <pre>
 * $op = new JolWriteOperation($array);
 * $req = new {@link JolRequest};
 * $req->add_operation($op);
 * </pre>
 *
 * @package JMX
 * @subpackage Request
 */
class JolWriteOperation extends JolOperation {

  protected function init(array $args = null) {
    $this->http_post_array{'type'} = 'write';

    if (!isset($args))
      return;

    $this->http_post_array{'mbean'}
            = array_key_exists('mbean', $args) ? $args{'mbean'} : null;
    $this->http_post_array{'attribute'}
            = array_key_exists('attribute', $args) ? $args{'attribute'} : null;
    $this->http_post_array{'value'}
            = array_key_exists('value', $args) ? $args{'value'} : null;
    $this->http_post_array{'path'}
            = array_key_exists('path', $args) ? $args{'path'} : null;
  }

  /**
   * Attempts to determine if the operation object has the required
   * POST fields for successful response.
   *
   * The validation catches common mistakes in initializing the object
   * but may miss others.
   *
   * @return boolean true if this is a valid object
   */
  public function is_valid() {
    $a = $this->http_post_array();
    if (!isset($a{'mbean'})) {
      return FALSE;
    }
    if (isset($a{'path'}) && !isset($a{'attribute'})) {
      return FALSE;
    }
    if (!isset($a{'attribute'}) && !isset($a{'value'})) {
      return FALSE;
    }
    return TRUE;
  }

}

?>
