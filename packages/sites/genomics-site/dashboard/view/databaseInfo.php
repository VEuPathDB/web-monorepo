<script type="text/javascript">
  $(function() {
    $('#tuningTables').DataTable({
      'stateSave': false,
      'stripeClasses': [ 'rowMedium', 'rowLight' ],
      'orderClasses': false,
      'order': [1, 'desc'],
      'pageLength': 10,
    });
  });
</script>

<p>
  <b><a href="?p=Database%20Connection%20Pool">Connection pool activity</a></b>
</p>

<?php
/**
 * View of database stats
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/DBInstances.php";
require_once dirname(__FILE__) . "/../lib/modules/Database.php";
require_once dirname(__FILE__) . "/../lib/modules/TuningManagerStatus.php";
require_once dirname(__FILE__) . "/../lib/modules/WorkflowStatus.php";
require_once dirname(__FILE__) . "/../lib/LdapTnsNameResolver.php";

$ldap_resolver = new LdapTnsNameResolver();
$tuning_manager_status = new TuningManagerStatus();

$workflow_status = new WorkflowStatus();

$db_instances_obj = new DBInstances();
$db_instances_attribs = $db_instances_obj->attributes();
$db_instances_str = $db_instances_attribs{'DbInstanceNames'};
$db_names = explode(',', $db_instances_str);

/**
 * Loop through available DBs by name and display attributes for each
 */
foreach ($db_names as $db_name) {

  $database = new Database($db_name);
  $db_display_name = ucfirst(strtolower($db_name));

  if (isset($_GET['refresh']) && $_GET['refresh'] == 1) {
    $success = $database->refresh();
    // TODO - put this warning near the refresh button where it is better noticed
    if ( ! $success) {print "<font color='red'>FAILED TO REFRESH</font>";}
  }

  $adb = $database->attributes();
  $adb_aliases_ar = $ldap_resolver->resolve($adb{'service_name'});
  $tuning_status_attrs = $tuning_manager_status->attributes();

  $workflow_status_attrs = $workflow_status->attributes();
?>

<h2><?php print $db_display_name ?> Database</h2>

<p>
  <b>Identifiers</b>:
  <table border="0" cellspacing="3" cellpadding="2" align="">
    <tr class="secondary3">
      <th><font size="-2">Identifier</font></th>
      <th><font size="-2">Value</font></th>
      <th></th>
    </tr>
    <tr class="rowLight">
      <td>Service Name</td>
      <td><?php print strtolower($adb{'service_name'}) ?></td>
      <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )" onmouseout="return nd();"><sup>[?]</sup></a>
      </td>
    </tr>
    <tr class="rowMedium">
      <td>Instance Name</td>
      <td><?php print strtolower($adb{'instance_name'}) ?></td>
      <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )" onmouseout="return nd();"><sup>[?]</sup></a>
      </td>
    </tr>
    <tr class="rowLight">
      <td>Global Name</td>
      <td><?php print strtolower($adb{'global_name'}) ?></td>
      <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )" onmouseout="return nd();"><sup>[?]</sup></a>
      </td>
    </tr>
    <tr class="rowMedium">
      <td>DB Unique Name</td>
      <td><?php print strtolower($adb{'db_unique_name'}) ?></td>
      <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )" onmouseout="return nd();"><sup>[?]</sup></a></td>
    </tr>
  </table>
</p>

<p>
  <b>Aliases</b> (from LDAP): <?php print implode(", ", $adb_aliases_ar) ?><br/><br/>
  <b>Hosted on</b>: <?php print strtolower($adb{'server_name'})?><br/>
  <b>Oracle Version</b>: <?php print $adb{'version'}?><br/>
  <b>Character encoding</b>: <?php print $adb{'character_encoding'}?>
</p>
<p>
  <b>Client login name</b>: <?php print strtolower($adb{'login'})?><br/>
  <b>Client connecting from</b>: <?php print strtolower($adb{'client_host'})?><br/>
  <b>Client OS user</b>: <?php print strtolower($adb{'os_user'})?>
</p>

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
<?php
$dblink_map = $adb{'DblinkList'};
$row = 0;
foreach ($dblink_map as $dblink) {
  $css_class = ($row % 2) ? "rowMedium" : "rowLight";
?>
    <tr class="<?php print $css_class?>" >
      <td><?php print strtolower($dblink{'owner'})?></td>
      <td><?php print strtolower($dblink{'db_link'})?></td>
      <td><?php print strtolower($dblink{'username'})?></td>
      <td><?php print strtolower($dblink{'host'})?></td>
      <td><?php print strtolower($dblink{'created'})?></td>
    </tr>
<?php
  $row++;
}
?>
  </table>
</p>

<hr/>
<b>Information on this page was last updated</b>: <?php print $adb{'system_date'}?><br/>
<form method="GET" action="">
  <input name="refresh" type="hidden" value="1">
  <input type="submit" value="update now">
</form>
<p>

<?php } ?>
<!-- End DB sections -->

<h2>Custom Tuning</h2>
<p class="clickable">Tuning Tables &#8593;&#8595;</p>
<div class="expandable" >

<?php  $days_old_warning_threshold = 5; ?>

  <p>
    Color codes: <span class='fatal'>update failed</span>, 
    <span class='warn'>last_check older than <?php print $days_old_warning_threshold?> days</span>
  </p>
  <div style="display: inline-block; padding-left: 10px;"><!-- constrain jquery datatables -->
    <table id="tuningTables" class='display' cellspacing="3" cellpadding="2" align="">
      <thead>
        <tr class="secondary3">
          <th align="left"><font size="-2">name</font></th>
          <th align="left"><font size="-2">last_check</font></th>
          <th align="left"><font size="-2">status</font></th>
          <th align="left"><font size="-2">created</font></th>
        </tr>
      </thead>
      <tbody>
<?php
$tm_status_map = $tuning_status_attrs{'table_statuses'};
$row = 0;
foreach ($tm_status_map as $table) {

  $now = time();
  $last_check_ts = strtotime($table{'last_check'});
  $seconds_diff = $now - $last_check_ts;
  $days_diff = $seconds_diff / 60 / 60 / 24;

  if ($days_diff > $days_old_warning_threshold) {
    $cell_css_class = "class='warn'";
  } else if (stripos($table{'status'}, 'fail') !== FALSE) {
    $cell_css_class =  "class='fatal'";
  } else {
    $cell_css_class = '';
  }
?>
        <tr>
          <td <?php print $cell_css_class?>><?php print $table{'name'}?></td>
          <td <?php print $cell_css_class?>><?php print $table{'last_check'}?></td>
          <td <?php print $cell_css_class?>><?php print $table{'status'}?></td>
          <td <?php print $cell_css_class?>><?php print $table{'created'}?></td>
        </tr>
<?php
}
?>


      </tbody>
    </table>
  </div> <!-- constrain jquery datatables -->
</div> <!-- div expandable -->


<!-- JB Start -->
<h2>Workflow Status</h2>
<p class="clickable">Workflow Status &#8593;&#8595;</p>
<div class="expandable" >

         <div style="display: inline-block; padding-left: 10px;"><!-- constrain jquery datatables -->
    <table id="workflow" class='display' cellspacing="3" cellpadding="2" align="">
      <thead>
        <tr class="secondary3">
          <th align="left"><font size="-2">step</font></th>
          <th align="left"><font size="-2">off_line</font></th>
          <th align="left"><font size="-2">state</font></th>
        </tr>
      </thead>
      <tbody>
<?php
$wf_status_map = $workflow_status_attrs{'table_statuses'};
$row = 0;
foreach ($wf_status_map as $table) {
?>
        <tr>
          <td><?php print $table{'step'}?> </td>
          <td><?php print $table{'off_line'}?></td>
          <td><?php print $table{'state'}?></td>
        </tr>
<?php
}
?>


      </tbody>
    </table>
  </div> <!-- constrain jquery datatables -->
</div> <!-- div expandable -->


<!-- JB END -->

