<?php

require_once dirname(__FILE__) . "/JolQueryResultItem.php";

/**
 *
 * @package JMX
 * @subpackage Response
 */
class JolQueryResultItemSuccess extends JolQueryResultItem {

  public function __construct($item) {
    parent::__construct($item);
    $this->set_is_error(FALSE);
  }

  /**
   *
   * @return string The epoch time when the request was handled by Jolokia.
   */
  public function timestamp() {
    return $this->item{'timestamp'};
  }

  /**
   *
   * @return mixed The value returned from a single request.
   * The returned data structure (array, string, map) depends on
   * the output of PHP's json_decode() function for the given json
   * string.
   */
  public function value() {
    return $this->item{'value'};
  }
}

?>
