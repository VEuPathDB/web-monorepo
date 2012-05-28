<?php

/**
 * Action page to reload the Tomcat webapp.
 * @package View
 */
require_once dirname(__FILE__) . "/../lib/modules/Webapp.php";

$webapp = new Webapp();

if (isset($_POST['reload']) && $_POST['reload'] == 1) {
  $webapp->reload();
}


// TODO: this duplicates tomcatInfo.php . Should instead
// have the data in tomcatInfo.php set by javascript calling
// this.
$t = $webapp->uptime_as_text();
print (isset($t)) ? $t : "<span class='warn'>error</span>" ;
?>
