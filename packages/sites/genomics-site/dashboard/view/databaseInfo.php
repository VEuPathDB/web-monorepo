<?php

require_once dirname(__FILE__) . "/../lib/modules/RefreshDatabaseInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/UserDatabaseInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/AppDatabaseInfo.php";

if (isset($_GET['refresh']) && $_GET['refresh'] == 1) {
  $refresh = new RefreshDatabaseInfo();
}

$adb = new AppDatabaseInfo();
$udb = new UserDatabaseInfo();
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

<?= ($adb->get('service_name')) ? $adb->get('service_name') : "<span class='warn'>service name not available</span>"; ?>


<p>
<b>Identifiers</b>:
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Identifier</font></th><th><font size="-2">Value</font></th><th></th></tr>
<tr class="rowLight"><td>Service Name</td><td><?= strtolower($adb->get('service_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>Instance Name</td><td><?= strtolower($adb->get('instance_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td><?= strtolower($adb->get('global_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td><?= strtolower($adb->get('db_unique_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>

<br>

<b>Aliases</b> (from LDAP): <?= $adb->get('aliases_from_ldap') ?>

<br><br>
<b>Hosted on</b>: <?=strtolower($adb->get('server_name'))?><br>
<b>Oracle Version</b>: <?=$adb->get('version')?>
<p>
<b>Client login name</b>: <?=strtolower($adb->get('login'))?><br>
<b>Client connecting from</b>: <?=strtolower($adb->get('client_host'))?><br>
<b>Client OS user</b>: <?=strtolower($adb->get('os_user'))?><br>
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
$dblink_map = $adb->get('DblinkList');
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
<tr class="rowLight"><td>Service Name</td><td><?= strtolower($udb->get('service_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>Instance Name</td><td><?= strtolower($udb->get('instance_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td><?= strtolower($udb->get('global_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td><?= strtolower($udb->get('db_unique_name')) ?></td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>
<br>
<b>Hosted on</b>: <?= strtolower($udb->get('server_name')) ?><br>
<p>
<b>Client login name</b>: <?= strtolower($udb->get('login')) ?></b><br>

<p>
<hr>
<b>Information on this page was last updated</b>: <?=$adb->get('system_date')?><br>
<form method="GET" action="">
<input name="refresh" type="hidden" value="1">
<input type="submit" value="refresh">
</form>
