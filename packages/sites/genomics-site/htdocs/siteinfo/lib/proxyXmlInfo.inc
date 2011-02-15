<?
include "functions.php.inc";

function get_proxy_xml() {  
  $headers = apache_request_headers();
  $upstreamServer = upstreamServer();
  $proxyhost = '';
  
  $xml = new DomDocument('1.0');
  
  $root = $xml->createElement('proxy');
  $xml->appendChild($root);
  
  
  if ( isset($headers['Via']) ) {
      $proxyhost = $headers['Via'];
  }
  
  $proxy_node = $xml->createElement('proxyhost');
  $proxy_value = $xml->createTextNode($proxyhost);
  $proxy_node->appendChild($proxy_value);
  $root->appendChild($proxy_node);


  $upstream_node = $xml->createElement('upstreamhost');
  $upstream_value = $xml->createTextNode($upstreamServer);
  $upstream_node->appendChild($upstream_value);
  $root->appendChild($upstream_node);

  return $xml;
}

?>