<?php

require_once dirname(__FILE__) . "/JolModule.php";

/**
 * WDK model-config.xml as instantiated in WDK. From mbean
 * org.gusdb.wdk:type=ModelConfig
 *
 * @author Mark Heiges <mheiges@uga.edu>
 * @package Module
 * @subpackage WDK
 */
class ModelConfig extends JolModule {

  public function __construct() {
    parent::__construct();
  }

  /**
   * @return array ModelConfig attributes
   */
  public function attributes() {
    $req = new JolRequest($this->jol_base_url);
    $read = new JolReadOperation(array(
                'mbean' => $this->wdk_mbean_domain . ':type=ModelConfig,path=' . $this->path_name,
            ));
    $req->add_operation($read);
    $response = $req->invoke();
    return $this->re_section_data($response[0]->value());
  }

  /**
   *   JMX data for model-config is flat with section names encoded as a prefix.
   *
   *   In situ configuration looks like
   *   <modelConfig smtpServer=localhost email=a@b.com ...
   *   <appDb maxWait=50 ...
   *   <userDb connectionUrl=jdbc:oracle:oci:@apicommN ..
   *
   *   JMX represents as
   *   [appDb] maxWait = 50
   *   [userDb] connectionUrl = jdbc:oracle:oci:@apicommN
   *   [global] smtpServer = localhost
   *   [global] email = a@b.com
   *
   *   This function reshapes this back into a sectional hiearchy
   *   global => [
   *   smtpServer => localhost,
   *   email => a@b.com
   *   ]
   *
   * @return array
   */
  private function re_section_data($raw_data) {
    $data_tree = array();
    foreach ($raw_data as $k => $v) {
      # regex delimiter: starts with [, capture all characters not a ], followed by ] and a space
      $node = preg_split("/^\[([^\]]+)\] /", $k, null, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

      if (count($node) > 1) {
        $section = $node[0];
        (array_key_exists($section, $data_tree)) || $data_tree[$section] = array();
        $data_tree[$section][$node[1]] = $v;
      } else {
        array_push($data_tree, array($node[0] => $v));
      }
    }
    return $data_tree;
  }

}

?>
