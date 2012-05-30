<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * WDK meta information from mbean
 * org.gusdb.wdk:type=Meta
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage WDK
 */
class WdkMeta extends JolModule {

  /**
   * @return array of attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=Meta,path=' . $this->path_name,
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
