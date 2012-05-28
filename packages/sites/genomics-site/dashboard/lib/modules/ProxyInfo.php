<?php

require_once dirname(__FILE__) . "/../../functions.php.inc";
require_once dirname(__FILE__) . "/../Configuration.php";

/**
 * @package Module
 * @subpackage Server
 */
class ProxyInfo {

  var $data_map;

  function __construct() {
    $this->data_map = array(
        'via'                  => NULL,
        'proxy_app'            => NULL,
        'proxy_host'           => NULL,
        'proxied_host'         => NULL,
        'upstream_server'      => NULL,
        'nginx_proxy_switcher' => NULL,
    );
    $this->init();
  }

  function init() {
    $c = new Configuration();

    $headers = apache_request_headers();

    if (!isset($headers['Via'])) {
      // this is not a proxied site
      return $this->data_map;
    }

    // if apache proxies to a relative URL, the request goes back through
    // the proxy resulting in appended header, e.g.
    // nginx at 128.192.75.110, nginx at 128.192.75.110
    // So, split and take the first.
    list($via) = explode(',', $headers['Via']);

    list($proxy_app, $prox_host) = explode(' at ', $via);

    $this->data_map = array(
        'via' => $headers['Via'],
        'proxy_app'            => $proxy_app,
        'proxy_host'           => $prox_host,
        'proxied_host'         => $headers['Host'],
        'upstream_server'      => upstreamServer(),
        'nginx_proxy_switcher' => $c->get('nginx_proxy_switcher'),
    );
  }

  function attributes() {
    return $this->data_map;
  }

}

?>