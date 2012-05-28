<?php
//TODO - delete this file
print("\nDEFUNCT - TO BE DISCARDED\n"); exit;


require_once dirname(__FILE__) . "/../lib/Configuration.php";
require_once dirname(__FILE__) . "/../lib/JmxBridgeQuery.php";

$c = new Configuration();

$jol_base_url = $c->get('jol_base_url');
$mbean_context = $c->get('context_name');
$mbean_domain = $c->get('wdk_mbean_domain');

$q = new JmxBridgeQuery();

$mbean_path = '';
$query_param_array = null;


$q->set_url($jol_base_url);


print "============ empty request ============ \n";

$q->set_query_param_array($query_param_array);

$result = $q->execute();

print "json result " . $result->get_json_result();

/**
var_dump( $result->get_result_array() );

foreach($result as $a) {
    print "#####\n"; var_dump($a);
}
**/

print "\n\n============ single request ============ \n";

$mbean_domain = 'org.apidb.wdk';
$mbean_path = 'type=Log4J';

$query_param_array =  array(
          array('type' => 'read',
          'mbean' => "$mbean_domain:$mbean_path,context=$mbean_context",
          'attribute' => 'org.apache'),
      );

$q->set_query_param_array($query_param_array);

$result = $q->execute();


foreach($result->get_result_array() as $r) {
    print $r->to_string() . "\n################\n";
}

//var_dump( $result->get_result_array() );


//print "json result " .  $result->get_json_result();




print "\n\n============ bulk request ============ \n";

$mbean_domain = 'org.apidb.wdk';
$mbean_path = 'type=Log4J';

$query_param_array =  array(
          array('type' => 'read',
          'mbean' => "$mbean_domain:$mbean_path,context=$mbean_context",
          'attribute' => 'org.apache'),
          array('type' => 'read',
          'mbean' => "$mbean_domain:$mbean_path,context=$mbean_context",
          'attribute' => 'org.gusdb'),
      );

$q->set_query_param_array($query_param_array);

$result = $q->execute();

foreach($result->get_result_array() as $r) {
    print $r->to_string() . "\n################\n";
}


//print "json result " .  $result->get_json_result();


print "\n\n============ bulk request with errors ======== \n";

$mbean_domain = 'org.apidb.wdk';
$mbean_path = 'type=Log4J';

$query_param_array =  array(
          array('type' => 'read',
          'mbean' => "$mbean_domain:$mbean_path,context=$mbean_context",
          'attribute' => 'org.apache'),
          array('type' => 'read',
          'mbean' => "$mbean_domain:$mbean_path,context=$mbean_context",
          'attribute' => 'BAD_ATTR'),
      );

$q->set_query_param_array($query_param_array);

$result = $q->execute();

foreach($result->get_result_array() as $r) {
    print $r->to_string() . "\n################\n";
}

//var_dump( $result->get_result_array() );


//print "json result " .  $result->get_json_result();

?>