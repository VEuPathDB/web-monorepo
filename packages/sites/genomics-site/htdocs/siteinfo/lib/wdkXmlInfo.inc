<?

function get_wdk_xml() {
  $path = '/a/admin/siteinfo.xml.jsp';
  $uri = 'http://' . $_SERVER['HTTP_HOST'] . $path;

  $wdkxml = new DomDocument('1.0');
  $wdkxml->preserveWhiteSpace = false;
  $load = $wdkxml->load($uri);
  if ( ! $load) {
    $root = $wdkxml->createElement('wdk');
    $root->appendChild(error_node($wdkxml, "failed to load '$uri'"));
    $wdkxml->appendChild($root);
  }
  return $wdkxml;
}

?>