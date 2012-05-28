<?php

require_once dirname(__FILE__) . "/Memory.php";
require_once dirname(__FILE__) . "/../lib/Configuration.php";

$c = new Configuration();

$jol_base_url = $c->get('jol_base_url');

print "jol_base_url $jol_base_url\n";

$mem = new Memory($jol_base_url);

$res = $mem->gc();

var_dump($res);

$res = $mem->attributes();
var_dump($res);

print "\n";

print "making a bad request...\n";

try {
print $mem->bad_request(). "\n";
} catch (Exception $ex) {
  print "Caught exception (as expected):\n" . $ex->getMessage() . "\n";
}
?>
