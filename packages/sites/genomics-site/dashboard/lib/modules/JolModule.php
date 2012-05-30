<?php

require_once dirname(__FILE__) . "/../Configuration.php";
require_once dirname(__FILE__) . "/../JolRequest.php";
require_once dirname(__FILE__) . "/../JolReadOperation.php";
require_once dirname(__FILE__) . "/../JolExecOperation.php";
require_once dirname(__FILE__) . "/../JolWriteOperation.php";

/**
 * Abstract class for Jolokia models
 *
 * @author Mark Heiges <mheiges.edu>
 * @package Module
 * @subpackage Core
 */
abstract class JolModule {

  protected $configuration;
  protected $jol_base_url;

  public function __construct() {
    $c = new Configuration();
    $this->configuration = $c;
    $this->jol_base_url = $c->get('jol_base_url');
    $this->context_path = $c->get('context_path');
    $this->wdk_mbean_domain = $c->get('wdk_mbean_domain');
    $this->engine_host = $c->get('tomcat_engine_host_name');
    $this->path_name = '//' . $this->engine_host .  $this->context_path;
  }

}

?>
