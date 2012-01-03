<?php
require_once dirname(__FILE__) . "/JmxModule.php";

class CatalinaInfo extends JmxModule {

  
  var $mbean_path = 'type=Server';

  function get_params($domain, $mbean_path, $context, $attribute) {

    $domain = $this->configuration->get('tomcat_engine_name');
    $attribute = array("serverInfo");

    return array(
      array(
          'type' => 'read',
          'mbean' => "$domain:$mbean_path",
          'attribute' => $attribute
      ),
    );  
  }


}
?>