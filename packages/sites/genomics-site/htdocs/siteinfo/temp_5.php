<?
// move back to functions.php.inc once all servers are on PHP5
function get_body($html) {
    $dom= new DOMDocument();
    $dom->loadHTML($html);
    $body = $dom->getElementsByTagName('body')->item(0);
    return $body;
}
?>