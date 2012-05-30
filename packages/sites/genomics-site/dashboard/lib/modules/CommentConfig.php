<?php

/**
 * comment-config.xml as instantiated in WDK. From mbean
 * org.gusdb.wdk:type=CommentConfig
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage WdkConfiguration
 */
class CommentConfig extends JolModule {

  /**
   * @return array CommentConfig attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=CommentConfig,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    return $response[0]->value();
  }

}

?>
