<?php
require_once dirname(__FILE__) . "/../../functions.php.inc";

/**
 * Build state information.
 *
 * The GUS build system writes build state information, including Subversion
 * info and timestamps, to a properties file in $GUS_HOME. This module
 * encapslates that data.
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Project
 */
class BuildInfo {

  function __construct() {

    try {
      $this->data_map = parse_properties($_SERVER['GUS_HOME'] . '/.buildlog/gus-build-state.log');
    } catch (Exception $e) {
      echo 'Exception: ', $e->getMessage(), "\n";
      return;
    }
  }

  /**
    Return value for given key
   * */
  function get($key) {
    if (array_key_exists($key, $this->data_map)) {
      return $this->data_map{$key};
    }
    return null;
  }

  function get_data_map() {
    return $this->data_map;
  }

}

?>
