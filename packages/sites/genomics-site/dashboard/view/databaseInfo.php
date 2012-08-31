<?php
/**
 * View of User and App database stats
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/AppDatabase.php";
require_once dirname(__FILE__) . "/../lib/modules/UserDatabase.php";
require_once dirname(__FILE__) . "/../lib/LdapTnsNameResolver.php";

$app_database = new AppDatabase();
$user_database = new UserDatabase();
$ldap_resolver = new LdapTnsNameResolver();

if (isset($_GET['refresh']) && $_GET['refresh'] == 1) {
  $success = $app_database->refresh();
  // TODO - put this warning near the refresh button where it is better noticed
  if ( ! $success) {print "<font color='red'>FAILED TO REFRESH</font>";}
}


$adb = $app_database->attributes();
$udb = $user_database->attributes();
$aliases_ar = $ldap_resolver->resolve($adb{'service_name'});

?>
<h2>Application Database</h2>
<div class='related_dashboard_links'>
Related Links
<ul>
<li>CBIL DBA Interface (password required)</li>
  <ul>
    <li><a href="https://www.cbil.upenn.edu/dba/uga.php">UGA databases</a></li>
    <li><a href="https://www.cbil.upenn.edu/dba/">Penn databases</a></li>
  </ul>
</div>
<p>
<b>Service Name</b>:
<?= ($adb{'service_name'}) ? $adb{'service_name'} : "<span class='warn'>service name not available</span>"; ?>
</p>

<p>
<b>Other Identifiers</b>:
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Identifier</font></th><th><font size="-2">Value</font></th><th></th></tr>
<tr class="rowMedium"><td>Instance Name</td><td><?= strtolower($adb{'instance_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td><?= strtolower($adb{'global_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td><?= strtolower($adb{'db_unique_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>

<br>

<b>Aliases</b> (from LDAP): <?= implode(", ", $aliases_ar) ?>

<br><br>
<b>Hosted on</b>: <?=strtolower($adb{'server_name'})?><br>
<b>Oracle Version</b>: <?=$adb{'version'}?>
<p>
<b>Client login name</b>: <?=strtolower($adb{'login'})?><br>
<b>Client connecting from</b>: <?=strtolower($adb{'client_host'})?><br>
<b>Client OS user</b>: <?=strtolower($adb{'os_user'})?><br>
<p>
<b>Available DBLinks</b>:

<table border="0" cellspacing="3" cellpadding="2" align="">

<tr class="secondary3">
<th align="left"><font size="-2">owner</font></th>
<th align="left"><font size="-2">db_link</font></th>
<th align="left"><font size="-2">username</font></th>
<th align="left"><font size="-2">host</font></th>
<th align="left"><font size="-2">created</font></th>
</tr>
<?
$dblink_map = $adb{'DblinkList'};
$row = 0;
foreach ($dblink_map as $dblink) {
  $css_class = ($row % 2) ? "rowMedium" : "rowLight";
?>
<tr class="<?=$css_class?>" >
  <td><?=strtolower($dblink{'owner'})?></td>
  <td><?=strtolower($dblink{'db_link'})?></td>
  <td><?=strtolower($dblink{'username'})?></td>
  <td><?=strtolower($dblink{'host'})?></td>
  <td><?=strtolower($dblink{'created'})?></td>
</tr>
<?
  $row++;
}
?>
</table>


<p>
<h2>WDK-Engine/Userlogin Database</h2>


<p>
<b>Identifiers</b>:
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Identifier</font></th><th><font size="-2">Value</font></th><th></th></tr>
<tr class="rowLight"><td>Service Name</td><td><?= strtolower($udb{'service_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>Instance Name</td><td><?= strtolower($udb{'instance_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td><?= strtolower($udb{'global_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td><?= strtolower($udb{'db_unique_name'}) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>
<br>
<b>Hosted on</b>: <?= strtolower($udb{'server_name'}) ?><br>
<p>
<b>Client login name</b>: <?= strtolower($udb{'login'}) ?></b><br>

<p>
<hr>
<b>Information on this page was last updated</b>: <?=$adb{'system_date'}?><br>
<form method="GET" action="">
<input name="refresh" type="hidden" value="1">
<input type="submit" value="update now">
</form>
