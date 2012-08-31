<?php
require_once dirname(__FILE__) . "/JolModule.php";

/**
 * Selected attributes from Catalina:type=Server mbean
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage Tomcat
*/
class Catalina extends JolModule {

  /**
   * @return array Selected Catalina attributes
   */
  public function attributes() {
    //$domain = $this->configuration->get('tomcat_engine_name');
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'org.apidb.wdk:type=ServletVersions' . ',path=' . $this->path_name,
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
