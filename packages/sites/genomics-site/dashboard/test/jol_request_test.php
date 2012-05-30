<?php

require_once dirname(__FILE__) . "/../lib/Configuration.php";
require_once dirname(__FILE__) . "/../lib/JolReadOperation.php";
require_once dirname(__FILE__) . "/../lib/JolExecOperation.php";
require_once dirname(__FILE__) . "/../lib/JolGenericOperation.php";
require_once dirname(__FILE__) . "/../lib/JolRequest.php";

$c = new Configuration();

$jol_base_url = $c->get('jol_base_url');
$context_path = $c->get('context_name');

print "========= empty read request ========== \n";

$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolReadOperation();
try {
  $req->add_operation($read);
  $response = $req->invoke();
} catch (Exception $ex) {
  print "OK - Correctly caught exception for invalid operation object.\n";
}

print "======================================= \n";

print "======== Jolokia agent version ======== \n";
$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolGenericOperation(array('type' => 'version'));
try {
  $req->add_operation($read);
  $response = $req->invoke();
  $data = $response[0]->value();
  print 'agent version: ' . $data{'agent'} . "\n";
} catch (Exception $ex) {
  print "FAIL - $ex\n";
}
print "======================================= \n";


print "======== single read request (attribute + path) ======== \n";

$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolReadOperation(array(
    'mbean' => 'java.lang:type=Memory',
    'attribute' => 'HeapMemoryUsage',
    'path' => 'max',
));
  $req->add_operation($read);
  $response = $req->invoke();
  $data = $response[0]->value();
  print "max mem: " . $data . "\n";
print "======================================= \n";

print "======== single read request (attribute) ======== \n";

$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolReadOperation(array(
    'mbean' => 'java.lang:type=Memory',
    'attribute' => 'HeapMemoryUsage',
));
  $req->add_operation($read);
  $response = $req->invoke();
  $data = $response[0]->value();
  print "max mem: " . $data{'max'} . "\n";
print "======================================= \n";

print "======== single read request (whole mbean) ======== \n";

$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolReadOperation(array(
    'mbean' => 'java.lang:type=Memory',
));
  $req->add_operation($read);
  $response = $req->invoke();
  $data = $response[0]->value();
  print "max mem: " . $data{'HeapMemoryUsage'}{'max'} . "\n";
print "======================================= \n";

print "======== single read request (path without attribute) ======== \n";

$req = new JolRequest();
$req->set_base_url($jol_base_url);

$read = new JolReadOperation(array(
    'mbean' => 'java.lang:type=Memory',
    'path' => 'max',
));
try {
  $req->add_operation($read);
  $response = $req->invoke();
  $data = $response[0]->value();
  print "max mem: " . $data{'HeapMemoryUsage'}{'max'} . "\n";
} catch (Exception $ex) {
  print "OK - Correctly caught invalid object exception\n";
}
print "======================================= \n";

attributes();

function attributes() {
  global $jol_base_url;
  $req = new JolRequest();
  $req->set_base_url($jol_base_url);
  $read = new JolReadOperation(array(
              'mbean' => 'org.apidb.wdk:path=//localhost/toxo.mheiges,group=Databases,type=AppDB',
          ));
  $exec = new JolExecOperation(array(
              'mbean' => 'org.apidb.wdk:group=Databases,type=AppDB,path=//localhost/toxo.mheiges',
              'operation' => 'refresh',
              'arguments' => null,
          ));
  $read_error = new JolReadOperation(array(
              'mbean' => 'org.apidb.wdk:path=//localhost/toxo.mheiges,group=Databases,type=AppDB',
              'attribute' => 'BOGUSATTR',
          ));
  $read_again = new JolReadOperation(array(
              'mbean' => 'org.apidb.wdk:path=//localhost/toxo.mheiges,group=Databases,type=AppDB',
              'attribute' => 'system_date',
          ));
  $req->add_operation($read);
  $req->add_operation($exec);
  $req->add_operation($read_error);
  $req->add_operation($read_again);

  print "ori json request: " . $req->http_postdata_as_json() . "\n";

  $response = $req->invoke();
  //return value_array = $result->value();
  //print "json result " . $response->get_json_result() . "\n";
  $data = $response[0]->value();
  print "System Date 0: " . $data{'system_date'} . "\n";
  $response[2]->is_error() ? '' : print "System Date 2: " . $response[2]->value() . "\n";
  print "System Date 2: " . $response[3]->value() . "\n";

  foreach ($response as $result) {
    if ($result->is_error()) {
      print "ERROR " . $result->error_type() . "\n";
      continue;
    }
    $map = $result->value();
    print "map " . $map . "\n";
    print "request " . $result->request() . "\n";
    print "timestamp " . $result->timestamp() . "\n";
  }
}

?>