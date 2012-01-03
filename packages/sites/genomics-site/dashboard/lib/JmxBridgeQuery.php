<?php

/**
    Retreive data from JMX/json bridge. Prepares an array conversion of the
    json returned. The returned json may an array of exec,write and read results.
    It is up to the recipient class to know which part(s) of the complex array to use.
    
    Inputs:
        url
        query params either as an array
              array(
                  'type' => 'read',
                  'mbean' => "$domain:$path,context=$context",
                  'attribute' => $attribute,
              )
        or as a json string
            {"type":"read","mbean":"org.apidb.wdk:group=Databases,type=UserDB,context=cryptodb.msh","attribute":"MetaDataMap"}        
**/
require_once dirname(__FILE__) . '/UserAgent.php';

class JmxBridgeQuery {

  var $url;
  var $params;
  var $module_data_map;
  var $raw_result;

  function __construct($opts = null) {
    if (is_array($opts)) {
      if (array_key_exists('url', $opts)) { $this->set_url($opts['url']); }
      if (array_key_exists('params', $opts)) { $this->set_params($opts['params']); }
    }
  }
  
  function set_url($url) {
    $this->url = $url;  
  }

  function set_params($params) {
    $this->params = $params;
  }

  function get_module_data_map() {
    return $this->module_data_map;
  }

  /**
    return the raw json result
  **/
  function get_raw_json_result() {
    return $this->raw_result;
  }
  
  function execute() {
    $opts = array(
        'url' => $this->url, 
        'post_fields' => json_encode($this->params)
    );
    $this->raw_result = UserAgent::init($opts)->get_content();
    $this->module_data_map = json_decode($this->raw_result, TRUE);
  }
}

?>
