<?
include "functions.php.inc";

function get_proxy_xml() {  
  $headers = apache_request_headers();
  $upstreamServer = upstreamServer();
  $via = '';
  $proxyhost = '';
  
  $xml = new DomDocument('1.0');
  
  $root = $xml->createElement('proxy');
  $xml->appendChild($root);
  
  
  if ( isset($headers['Via']) ) {
      // if apache proxies to a relative URL, the request goes back through
      // the proxy resulting in appended header, e.g.
      // nginx at 128.192.75.110, nginx at 128.192.75.110
      // So, split and take the first.
      list($via, $junk) = explode(',', $headers['Via']);
  }
  list($proxy_app, $proxy_ip) = 
  $proxy_server = explode(' at ', $via);

  $node = $xml->createElement('proxyapp');
  $value = $xml->createTextNode($proxy_app);
  $node->appendChild($value);

  $root->appendChild($node);
  
  $node = $xml->createElement('proxyhost');
  $value = $xml->createTextNode($proxy_ip);
  $node->appendChild($value);

  $root->appendChild($node);


  $node = $xml->createElement('upstreamhost');
  $value = $xml->createTextNode($upstreamServer);
  $node->appendChild($value);

  $root->appendChild($node);

  return $xml;
}

?>