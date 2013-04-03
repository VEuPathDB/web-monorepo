<?php
require_once dirname(__FILE__) . "/../../functions.php.inc";

/**
 * Values for the EuPathDB release stages as defined in /etc/sysconfig/httpd .
 * The key/values of the array are flipped relative to what's in the httpd file.
 * So, 
 *  'export WEBSITE_RELEASE_STAGE_INTEGRATE=20' 
 * becomes '20 => INTEGRATE'
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Project
 */
class StageValues {

  function __construct() {

    try {
      $raw_data = parse_properties('/etc/sysconfig/httpd');
      // clean up key names, remove non-RELEASE keys
      foreach ($raw_data as $key => $value) {
        if (preg_match('/export\s+WEBSITE_RELEASE_STAGE_/', $key)) {
          $newkey = ltrim(preg_replace('/export\s+WEBSITE_RELEASE_STAGE_/', '', $key));
          $raw_data[$newkey] = $raw_data[$key];
        }
      unset($raw_data[$key]);
      $this->data_map = array_flip($raw_data);
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

  function get_data_map() {
    return $this->data_map;
  }

}

?>
