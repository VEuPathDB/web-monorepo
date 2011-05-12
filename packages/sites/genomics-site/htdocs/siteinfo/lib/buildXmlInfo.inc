<?
include_once "functions.php.inc";

function get_build_xml() {

  try {
      $build = parse_properties($_SERVER['GUS_HOME'] . '/config/.build.info');
  } catch (Exception $e) {
      echo 'Exception: ',  $e->getMessage(), "\n";
      return;
  }

  $xml = new DomDocument('1.0');
  $xml->preserveWhiteSpace = false;
  
  $root = $xml->createElement('svn');
  $locations = $xml->createElement('locations');
  $root->appendChild($locations);
  $xml->appendChild($root);
  
  $switches = '';
  
  foreach ($build as $p => $v) {
      if ($trunc = strpos($p, '.svn.info')) {
          $start = strpos($v, 'Revision: ') + strlen('Revision: ');
          $end = strpos($v, 'Last Changed Rev: ') - $start;
          $svnrevision = trim(substr($v, $start, $end));
  
          $start = strpos($v, 'URL: ') + strlen('URL: ');
          $end = strpos($v, 'Revision: ') - $start;
          $svnbranch = trim(substr($v, $start, $end));
          
          $svnproject = str_replace('.', '/', substr($p, 0, $trunc));
          
          $location = $xml->createElement('location');

          $remote_node = $xml->createElement('remote');
          $remote_value = $xml->createTextNode($svnbranch);

          $local_node = $xml->createElement('local');
          $local_value = $xml->createTextNode($svnproject);

          $revision_node = $xml->createElement('revision');
          $revision_value = $xml->createTextNode($svnrevision);

          $remote_node->appendChild($remote_value);
          $local_node->appendChild($local_value);
          $revision_node->appendChild($revision_value);

          $location->appendChild($remote_node);
          $location->appendChild($local_node);
          $location->appendChild($revision_node);
          
          $locations->appendChild($location);
          
          $switches .= "svn switch -r$svnrevision $svnbranch $svnproject;\n";
      }
  }
  
  $switch_node = $xml->createElement('switch');
  $switch_value = $xml->createTextNode($switches);
  $switch_node->appendChild($switch_value);
  
  $root->appendChild($switch_node);
  
  return $xml;
}


?>