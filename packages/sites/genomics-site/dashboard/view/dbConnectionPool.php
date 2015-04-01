<?php
/**
 * View of database connection pool stats
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/DBInstances.php";
require_once dirname(__FILE__) . "/../lib/modules/ConnectionPool.php";

$db_instances_obj = new DBInstances();
$db_instances_attribs = $db_instances_obj->attributes();
$db_instances_str = $db_instances_attribs{'DbInstanceNames'};
$db_names = explode(',', $db_instances_str);

/**
 * Loop through available DBs by name and display attributes for each
 */
foreach ($db_names as $db_name) {

$db_pool = new ConnectionPool($db_name);
$db_display_name = ucfirst(strtolower($db_name));
$pool_attribs = $db_pool->attributes();

$metrics_description = <<<EOF
The following are current runtime values retreived through the instantiated connection pool classes or 
 web application classes. The connection pool reported on here is initiated and managed by 
<code>{$pool_attribs{'PoolOwnerClassname'}}</code>.
EOF;
?>

<h2><?php print $db_display_name ?> Connection Pool</h2>

<p>
  <?php print $metrics_description ?>
</p>

<p>
  <b>Metrics</b>
</p>

<table border="0" cellspacing="3" cellpadding="2" align="">
  <tr class="secondary3">
    <th><font size="-2">Key</font></th>
    <th><font size="-2">Value</font></th>
    <th><font size="-2">Description</font></th>
  </tr>
  <tr class="rowLight">
    <td>BorrowedCount</td>
    <td><?php print strtolower($pool_attribs{'BorrowedCount'})?></td>
    <td>Running count of connections borrowed from the pool by the application. This value is managed by the web application.</td>
  </tr>
  <tr class="rowMedium">
    <td>ReturnedCount</td>
    <td><?php print strtolower($pool_attribs{'ReturnedCount'})?></td>
    <td>Running count of connections returned the pool by the application. This value is managed by the web application.</td>
  </tr>
  <tr class="rowLight">
    <td>CurrentlyOpenCount</td>
    <td><?php print strtolower($pool_attribs{'CurrentlyOpenCount'})?></td>
    <td>Number of connections currenly in use by the application. A high number might indicate a leak. This value is managed by the web application.</td>
  </tr>
  <tr class="rowMedium">
    <td>NumActive</td>
    <td><?php print strtolower($pool_attribs{'NumActive'})?></td>
    <td>The number of connections currently borrowed from the pool. This value is managed by the connection pool library.</td>
  </tr>
  <tr class="rowLight">
    <td>NumIdle</td>
    <td><?php print strtolower($pool_attribs{'NumIdle'})?></td>
    <td>The number of connections currently idle in the pool. This value is managed by the connection pool library.</td>
  </tr>
</table>

<p>
  <b>Configuration</b>
</p>
<p>
  The following are current runtime values retreived through the API of the active connection pool.
  See <a href='http://commons.apache.org/proper/commons-dbcp/api-1.4/org/apache/commons/dbcp/BasicDataSource.html'>DBCP javadocs</a> 
  for explanation of parameters.
</p>

<table border="0" cellspacing="3" cellpadding="2" align="">
  <tr class="secondary3">
    <th><font size="-2">Parameter</font></th>
    <th><font size="-2">Value</font></th>
  </tr>
<?php
$row = 0;
$fields = array(
  'MinIdle', 'MaxIdle', 'MinEvictableIdleTimeMillis',
  'TimeBetweenEvictionRunsMillis',
  'TestOnBorrow', 'TestOnReturn', 'TestWhileIdle'
);
foreach ($fields as $param) {
  $css_class = ($row % 2) ? "rowMedium" : "rowLight";
?>
  <tr class="<?php print $css_class?>">
    <td><?php print $param?></td>
    <td><?php print strtolower(var_export($pool_attribs{$param}))?></td>
  </tr>
<?php
  $row++;
}
?>
</table>

<?php } ?>
