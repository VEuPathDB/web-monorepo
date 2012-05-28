<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Example template for Jolokia Module sublcasses
 *
 * @author
 */
class JolModuleSubclassTemplate extends JolModule {

  /**
   * @return array of attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'Catalina:type=Server',
                'attribute' => array('anAttribure'),
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

}

?>
