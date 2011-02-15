<?

function get_apache_xml() {
  $apachexml = new DomDocument('1.0');
  $apachexml->preserveWhiteSpace = false;
  $apachexml->loadXml('<apache><stub>sample data</stub></apache>');
  return $apachexml;
}


?>