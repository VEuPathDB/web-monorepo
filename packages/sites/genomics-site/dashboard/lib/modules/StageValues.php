<?php
require_once dirname(__FILE__) . "/../../functions.php.inc";

/**
 * Values for the EuPathDB release stages as defined in /etc/sysconfig/httpd .
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Project
 */
class StageValues {

  function __construct() {

    try {
      $this->data_map = parse_properties('/etc/sysconfig/httpd');
      // clean up key names, remove non-RELEASE keys
      foreach ($this->data_map as $key => $value) {
        if (preg_match('/^(?:export\s+)?WEBSITE_RELEASE_STAGE_/', $key)) {
          $newkey = ltrim(preg_replace('/(?:export\s+)?WEBSITE_RELEASE_STAGE_/', '', $key));
          $this->data_map[$newkey] = $this->data_map[$key];
        }
      unset($this->data_map[$key]);
    }

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
 
 
 /**
 * Flip he key/values relative to what's in the httpd file.
 * So, 
 *  'export WEBSITE_RELEASE_STAGE_INTEGRATE=20' 
 * becomes '20 => INTEGRATE'
 */
  function get_flipped_data_map() {
    return array_flip($this->data_map);
  }
 
  function get_data_map() {
    return $this->data_map;
  }

}

?>
