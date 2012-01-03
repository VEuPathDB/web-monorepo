<?
// version of data and format returned. Change value e.g as
// elements are added, removed.
define('FORMATVERSION', '1.0');
define('ROOTNAME', 'dashboard');

require_once dirname(__FILE__) . '/lib/PrivateAPI.php';
require_once dirname(__FILE__) . '/lib/xmlfunctions.inc';

$api = new PrivateAPI();

$want_value = false;

$path_info = trim(@$_SERVER["PATH_INFO"], '/');
/**
Check if pathinfo terminates with 'value' and remove it. The remainder of path_info
will be used for an xpath query.
    /dashboard/wdk returns xml document
    /dashboard/wdk/value returns text values of /dashboard/wdk
**/

if ($path_info) {
  if ($path_info == 'version') {
    print FORMATVERSION;
    exit;
  }
  if (basename($path_info) == 'value') {
    $want_value = true;
    $path_info = dirname($path_info);
  }
}

$req_xpath = ($path_info) ? '/' . $path_info : ROOTNAME;

$wdkxml = $api->get_xml();

/** Construct new XML doc and combine xml gathered from various sources **/
$sitexml = new DomDocument('1.0');
$sitexml->formatOutput = true;

$root = $sitexml->createElement(ROOTNAME);
$root->setAttribute('version', FORMATVERSION);
$sitexml->appendChild($root);

import_node($sitexml, $wdkxml);

/** get node from xpath query **/
$domxpath = new DOMXpath($sitexml);
$qstr = "/$req_xpath";

$reportxml = new DomDocument('1.0');
$qnode = $domxpath->query($qstr)->item(0);

if ( ! $qnode) {
  $qnode = error_node($sitexml, "no match for '$qstr'");
}

$reportxml->appendChild(
  $reportxml->importNode($qnode, true)
);
$reportxml->preserveWhiteSpace = false;
$reportxml->formatOutput   = true;

/** text values or XML output **/
if ($want_value) {
  print_node_values($qnode);
} else {
  print $reportxml->saveXml();
}
exit;

?>
