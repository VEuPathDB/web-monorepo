<?
require_once dirname(__FILE__) . "/../../functions.php.inc";
require_once dirname(__FILE__) . "/../Configuration.php";

class ProxyInfo {

  var $data_map;

  function __construct() {
    $this->init();
  }

  function init() {
    $c = new Configuration();

    $headers = apache_request_headers();
    
    if ( ! isset($headers['Via'])) {
      // this is not a proxied site
      $this->data_map = array();
      return;
    }
    
    // if apache proxies to a relative URL, the request goes back through
    // the proxy resulting in appended header, e.g.
    // nginx at 128.192.75.110, nginx at 128.192.75.110
    // So, split and take the first.
    list($via) = explode(',', $headers['Via']);
    
    list($proxy_app, $prox_host) = explode(' at ', $via);

    $this->data_map = array(
       'via' => $headers['Via'],
       'proxyapp' => $proxy_app,
       'proxyhost'  => $prox_host,
       'upstream_server' => upstreamServer(),
       'nginx_proxy_switcher' => $c->get('nginx_proxy_switcher'),
    );
  }

  /**
    Return value for given key
  **/
  function get($key) {
    if (array_key_exists($key, $this->data_map)) {
      return $this->data_map{$key};
    }
    return null;
  }

  function get_data_map() {
    return $this->data_map;
  }


}

?>