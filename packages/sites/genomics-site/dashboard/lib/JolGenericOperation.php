<?php

require_once dirname(__FILE__) . "/JolOperation.php";

/**
 * A single Jolokia generic operation for adding to a {@link JolRequest}.
 *
 * An object for freeform Jolokia operations. Supply the
 * full POST data payload as an array to the constructor.
 * The array should json_encode() to a valid json post request.
 *
 * After instantiating the Operation object, add it to a {@link JolRequest}
 * <pre>
 * $op = new JolGenericOperation($array);
 * $req = new {@link JolRequest};
 * $req->add_operation($op);
 * </pre>
 *
 * @author Mark Heiges <mheiges.edu>
 *
 * @package JMX
 * @subpackage Request
 */
class JolGenericOperation extends JolOperation {

  /**
   * Initializes the Operation object.
   *
   * Input is an array of HTTP POST data that will be rendered to
   * json with PHP's json_encode() function.
   *
   * @param array HTTP POST data
   */
  protected function init(array $args = null) {
    $this->http_post_array = $args;
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
    return TRUE;
  }

}

?>
