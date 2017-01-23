<?php
/**
 * Action page to dump database connection stats
 * to Tomcat log.
 *
 * $dbclass is 'UserDB' or 'AppDB'
 *
 * @package View
 */

require_once dirname(__FILE__) . '/../lib/modules/OpenConnections.php';

$oc = new OpenConnections();

if (isset($_POST['dbclass'])) {
  if ($oc->dumpDbConnectionStatsToLog($_POST['dbclass'])) {
    print 'ok';
  } else {
    print "<span class='warn'>error</span>";
  }
}

?>
