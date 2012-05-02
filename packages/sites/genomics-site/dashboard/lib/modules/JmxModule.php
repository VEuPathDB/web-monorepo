<?php
require_once dirname(__FILE__) . "/../Configuration.php";
require_once dirname(__FILE__) . "/../JmxBridgeQuery.php";

abstract class JmxModule {

  var $configuration;
  var $mbean_path;

  function __construct() {

    $c = new Configuration();
    $this->configuration = $c;

    $jmx_host = $c->get('jmx_bridge_host');
    $jmx_context = $c->get('jmx_bridge_context');
    $http_port = $c->get('http_port');

    $context = $c->get('context_name');
    $domain = $c->get('wdk_mbean_domain');

    $attribute = null; # retrieve all mbean attributes

    $url = "http://$jmx_host:$http_port/$jmx_context/";

    $mbean_path = $this->get_mbean_path();
    $params = $this->get_params($domain, $mbean_path, $context, $attribute);

    $q = new JmxBridgeQuery();
    $q->set_url($url);
    $q->set_params($params);
    $q->execute();
    
    $json_response = $q->get_module_data_map();
    $this->data_map = $this->get_result_value($json_response);
  }
  
  /**
    Return value for given key
  **/
  function get($key) {
    if (is_array($this->data_map) && array_key_exists($key, $this->data_map)) {
      return $this->data_map{$key};
    }
    return null;
  }

  /** Return the value portion of the json response. The default 
      is to return the first value in the array. Override this
      method for queries that contain the desired values from more
      complex structures
  **/
  function get_result_value($json_response) {
    return $json_response[0]{'value'};
  }

  function get_data_map() {
    return $this->data_map;
  }

  function get_mbean_path() {
    if ( ! isset($this->mbean_path)) {
      throw new Exception("mbean_path is not defined");
    }
    return $this->mbean_path;
  }

  function get_params($domain, $mbean_path, $context, $attribute) {
    return array(
      array(
          'type' => 'read',
          'mbean' => "$domain:$mbean_path,context=$context",
          'attribute' => $attribute
      ),
    );  
  }

  function to_xml() {
     $xml_o = new SimpleXMLElement("<?xml version=\"1.0\"?><root></root >");
     $this->array_to_xml($this->data_map, $xml_o);
     return $xml_o->asXML();
  }

  function array_to_xml($array, &$xml_o) {
    foreach($array as $key => $value) {
        if(is_array($value)) {
            if(!is_numeric($key)){
                $subnode = $xml_o->addChild("$key");
                $this->array_to_xml($value, $subnode);
            }
            else{
                $this->array_to_xml($value, $xml_o);
            }
        }
        else {
            $xml_o->addChild("$key","$value");
        }
    }

  }
  
  function to_json() {
    return json_encode($this->data_map);
  }
}
?>
