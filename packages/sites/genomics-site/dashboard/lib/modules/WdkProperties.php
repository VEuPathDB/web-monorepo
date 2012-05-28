<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * WDK model.prop and other properties as instantiated in WDK. From mbean
 * org.gusdb.wdk:type=Properties
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage WDK

 */
class WdkProperties extends JolModule {

  /**
   * @return array WDK properties
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => 'org.gusdb.wdk:type=Properties,context=' . $this->mbean_context,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    return $response[0]->value();
  }

}

?>
