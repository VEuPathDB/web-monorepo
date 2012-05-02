<?
require_once dirname(__FILE__) . "/../lib/modules/ReloadWebapp.php";
require_once dirname(__FILE__) . "/../lib/modules/WebappInfo.php";

if (isset($_POST['reload']) && $_POST['reload'] == 1) {
  $reset = new ReloadWebapp();
}

$webapp = new WebappInfo();

// TODO: this duplicates tomcatInfo.php . Should instead
// have the data in tomcatInfo.php set by javascript calling
// this.
$t = $webapp->uptime_as_text();
print (isset($t)) ? $t : "<span class='warn'>error</span>" ;
?>

