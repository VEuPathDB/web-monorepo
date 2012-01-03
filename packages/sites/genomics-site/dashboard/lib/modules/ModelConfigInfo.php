<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class ModelConfigInfo extends JmxModule {

  var $mbean_path = 'type=ModelConfig';
  var $data_tree;

  function __construct() {
    parent::__construct();
    $this->data_tree = $this->re_section_data();  
  }

  /**
    JMX data is flat with section names encoded as a prefix.

    In situ configuration looks like
      <modelConfig smtpServer=localhost email=a@b.com ...
        <appDb maxWait=50 ...
        <userDb connectionUrl=jdbc:oracle:oci:@apicommN ..
      
    JMX represents as
      [appDb] maxWait = 50
      [userDb] connectionUrl = jdbc:oracle:oci:@apicommN
      [global] smtpServer = localhost
      [global] email = a@b.com

    This function reshapes this back into a sectional hiearchy
      global => [ 
        smtpServer => localhost, 
        email => a@b.com
      ]
    
    Allows for only one level deep.
  **/
  function re_section_data() {
    $data_tree = array();
    foreach ($this->data_map as $k => $v) {
      # regex delimiter: starts with [, capture all characters not a ], followed by ] and a space
      $node = preg_split("/^\[([^\]]+)\] /", $k, null, PREG_SPLIT_DELIM_CAPTURE|PREG_SPLIT_NO_EMPTY);

      if (count($node) > 1) {
        $section = $node[0];
        (array_key_exists($section, $data_tree)) || $data_tree[$section] = array();
        array_push($data_tree[$section], array($node[1] => $v));
      } else {
        array_push($data_tree, array($node[0] => $v));
      }
    }
    return $data_tree;
  }

  function get_data_tree() {
    return $this->data_tree;
  }
}
?>