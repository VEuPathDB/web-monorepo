<?php
require_once dirname(__FILE__) . "/KeyValue.php";

/**
  Full application configuration generated from several sources. Including
  the main application config.ini and an optional config.local.ini which
  can override values from the former.
  Also adds http port value from a workers.properties file (or equivalent)
  and the name of the Tomcat instance retreived from the Apache server 
  environment.
**/

class Configuration {

  var $conf_ar;
  var $global_conf_file_path;
  var $local_conf_file_path;

  function __construct() {
    $this->global_conf_file_path = dirname(__FILE__) . '/../config/config.ini';
    $this->local_conf_file_path = dirname(__FILE__) . '/../config/config.local.ini';

    $g_conf_ar = array();
    $l_conf_ar = array();
    
    if (file_exists($this->global_conf_file_path)) {
      $g_conf_ar = parse_ini_file($this->global_conf_file_path);
    }
    
    if($g_conf_ar === false) {
        echo("Unable parse $global_conf_file_path\n\n");
        exit;
    }

    // parse optional local configuration overrides
    if (file_exists($this->local_conf_file_path)) {
      $l_conf_ar = parse_ini_file($this->local_conf_file_path);
      if($l_conf_ar === false) {
          echo("Unable to parse $local_conf_file_path\n\n");
          exit;
      }
    }
    
    
    $partial_conf_ar = array_merge($g_conf_ar, $l_conf_ar);

    $this->add_http_port_value($partial_conf_ar);
    $this->add_webapp_value($partial_conf_ar);
    
    $this->conf_ar = $partial_conf_ar;
  }

  /**
    Static initializer so one can chain methods at construction time
      $c = Configuration::init()->get_configuration();
  **/
  static public function init() {
    return new self();
  }
  
  /**
    Return the full configuration array
  **/
  function get_configuration() {
    return $this->conf_ar;
  }

  /**
    Return value for given configuration key
  **/
  function get($key) {
    if (array_key_exists($key, $this->conf_ar)) {
      return $this->conf_ar[$key];
    }
    return null;
  }

  /**  
    Add the http port to the configuration array
  **/
  function add_http_port_value(&$partial_conf_ar) {

    $kv = new KeyValue($partial_conf_ar{'worker_properties_file'});

    /** construct the key name from template to lookup the http 
        port from workers.properties **/

    // template is custom.%TOMCAT_INSTANCE%.http_port
    $http_key_tmpl = $partial_conf_ar{'worker_properties_http_var_tmpl'};
    // worker name is TonkaDB
    $worker = $_SERVER{$partial_conf_ar{'worker_env_var_name'}};
    // key after macro substition, key is custom.TonkaDB.http_port
    $http_port_key_name = str_replace('%TOMCAT_INSTANCE%', $worker, $http_key_tmpl);


    $partial_conf_ar{'http_port'} = $kv->get($http_port_key_name);
  }

  /**  
    Add the webapp to the configuration array
  **/
  function add_webapp_value(&$partial_conf_ar) {
    $partial_conf_ar{'context_name'} =  $_SERVER{$partial_conf_ar{'webapp_env_var_name'}};
  }
}

?>