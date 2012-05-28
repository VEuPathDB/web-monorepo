<?php
/**
 *
 * @package RemoteAPI
 * @subpackage JSON
 */

header('Content-type: application/json');

require_once dirname(__FILE__) . '/lib/PrivateAPI.php';

$api = new PrivateAPI();

print $api->to_json();
?>
