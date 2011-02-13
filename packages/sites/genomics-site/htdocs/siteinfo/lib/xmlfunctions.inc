<?

function error_node($dom_doc, $error_str) {
  $node = $dom_doc->createElement('error');
  $value = $dom_doc->createTextNode($error_str);
  $node->appendChild($value);
  return $node;
}


/** traverse node tree, print values **/
function print_node_values($node) {
  if ( ! $node) return;
  if ($node->hasChildNodes()) {
    foreach($node->childNodes as $child) {
      print_node_values($child);
    }
  } else {
    print $node->nodeValue . "\n";
  }
}


function import_node($dom_doc, $source) {
    if ( ! $source || ! $source->documentElement ) {
        $node = error_node($dom_doc, 'unavailable');
    } else {
        $node = $source->documentElement;
    }
    $root = $dom_doc->documentElement;
    $root->appendChild($dom_doc->importNode($node, true));

}


?>