<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Example template for Jolokia Module sublcasses
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage Tomcat
 */
class Logger extends JolModule {

  /**
   * @return array of attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'org.gusdb.wdk:type=Log4J,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    if ($response->has_error()) {
      trigger_error('Error. Response was ' .
              substr($response->get_json_result(), 0, 200) .
              "...\nFor request " . $req->http_postdata_as_json());
      return null;
    }

    return $response[0]->value();
  }

  public function update($logger_map) {
    $req = new JolRequest($this->jol_base_url);
    $mbean = 'org.gusdb.wdk:type=Log4J,path=' . $this->path_name;

    foreach ($logger_map as $name => $value) {
      $op = new JolWriteOperation(array(
                  'mbean' => $mbean,
                  'attribute' => $name,
                  'value' => $value,
              ));
      $req->add_operation($op);
    }
    $response = $req->invoke();
    if ($response->has_error()) {
      trigger_error('Error. Response was ' .
              substr($response->get_json_result(), 0, 200) .
              "...\nFor request " . $req->http_postdata_as_json());
    }
    return $response->is_success();
  }

}
?>
