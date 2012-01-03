<?php
/**
 Parse a key=value file into an associative array.
 Line comments marked with leading '#' or ';' are allowed. Named 
 sections as allowe in ini files are not supported here.
**/

class KeyValue {

  var $conf_obj;

  function __construct($file) {
        
    $fh = fopen($file, "rb");
    
    if (! $fh) {
     print "ERROR: parsing $file";
     exit;
    }
    
    while (!feof($fh) ) {  
      $line = fgets($fh);

      if (preg_match('/^\s*#/', $line)) { continue; }
      if (preg_match('/^\s*;/', $line)) { continue; }
      if (preg_match('/^\s*$/', $line)) { continue; }
      if (!preg_match('/=/',    $line)) { continue; }
      
      $kv = explode('=', $line);
      if (trim($kv[1]) == '') { continue; }
      $this->conf_obj{trim($kv[0])} = trim($kv[1]);
    }
    
    fclose($fh);
  }

  /**
    Static initializer so one can chain methods at construction time
      $c = KeyValue::init()->get_configuration();
  **/
  static public function init() {
    return new self();
  }
  
  /**
    Return the full configuration array
  **/
  function get_configuration() {
    return $this->conf_obj;
  }

  /**
    Return value for given configuration key
  **/
  function get($key) {
    if (array_key_exists($key, $this->conf_obj)) {
      return $this->conf_obj[$key];
    }
    return null;
  }
}
?>