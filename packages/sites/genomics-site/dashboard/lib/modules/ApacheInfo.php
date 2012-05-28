<?php

/**
 * Information about the Apache HTTP Server environment.
 *
 * @package Module
 * @subpackage Server
 */
class ApacheInfo {

  var $data_map;
  var $apacheEnv;
  var $httpHeaders;

  function __construct() {
    $this->data_map = parsePHPModules();
  }

  /**
    Static initializer so one can chain methods at construction time
    $c = ApacheInfo::init()->get_data_map();
   * */
  static public function init($opts = null) {
    return new self($opts);
  }

  /**
    Return value for given key
   * */
  function get($key) {
    if (array_key_exists($key, $this->data_map)) {
      return $this->data_map[$key];
    }
    return null;
  }

  function get_data_map() {
    return $this->data_map;
  }

  function to_xml() {
    $xml = new SimpleXMLElement('<root/>');
    array_walk_recursive($this->data_map, array($xml, 'addChild'));
    return $xml->asXML();
  }

  function to_json() {
    return ison_encode($this->data_map);
  }

}

?>
