<?php
/**
 * View of database connection pool stats
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/AppDBConnectionPool.php";
require_once dirname(__FILE__) . "/../lib/modules/UserDBConnectionPool.php";

$appdb_pool = new AppDBConnectionPool();
$userdb_pool = new UserDBConnectionPool();

$a_pool = $appdb_pool->attributes();
$u_pool = $userdb_pool->attributes();

$metrics_description = <<<EOF
The following are current runtime values retreived through the instantiated connection pool classes or 
 web application classes. The connection pool reported on here is initiated and managed by 
<code>{$a_pool{'PoolOwnerClassname'}}</code>.
EOF;

?>
<h2>Application Connection Pool</h2>


<p>
<?php print $metrics_description ?>
</p>


<p>
<b>Metrics</b>
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3">
<th><font size="-2">Key</font></th>
<th><font size="-2">Value</font></th>
<th><font size="-2">Description</font></th>
</tr>

<tr class="rowLight"><td>BorrowedCount</td><td><?php print strtolower($a_pool{'BorrowedCount'})?></td>
  <td>Running count of connections borrowed from the pool by the application. This value is managed by the web application.</td>
</tr>
<tr class="rowMedium"><td>ReturnedCount</td><td><?php print strtolower($a_pool{'ReturnedCount'})?></td>
  <td>Running count of connections returned the pool by the application. This value is managed by the web application.</td>
</tr>
<tr class="rowLight"><td>CurrentlyOpenCount</td><td><?php print strtolower($a_pool{'CurrentlyOpenCount'})?></td>
  <td>Number of connections currenly in use by the application. A high number might indicate a leak. This value is managed by the web application.</td>
</tr>
<tr class="rowMedium"><td>NumActive</td><td><?php print strtolower($a_pool{'NumActive'})?></td>
  <td>The number of connections currently borrowed from the pool. This value is managed by the connection pool library.</td>
</tr>
<tr class="rowLight"><td>NumIdle</td><td><?php print strtolower($a_pool{'NumIdle'})?></td>
  <td>The number of connections currently idle in the pool. This value is managed by the connection pool library.</td>
</tr>

</table>
</p>


<p>
<b>Configuration</b>
</p>
<p>
The following are current runtime values retreived through the API of the active connection pool.
See <a href='http://commons.apache.org/proper/commons-dbcp/api-1.4/org/apache/commons/dbcp/BasicDataSource.html'>DBCP javadocs</a> 
for explanation of parameters.
</p>

<p>
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Parameter</font></th><th><font size="-2">Value</font></th></tr>
<?php
$row = 0;
$fields = array(
  'MinIdle', 'MaxIdle', 'MinEvictableIdleTimeMillis',
  'SoftMinEvictableIdleTimeMillis', 'TimeBetweenEvictionRunsMillis',
  'TestOnBorrow', 'TestOnReturn', 'TestWhileIdle'
);
foreach ($fields as $param) {
  $css_class = ($row % 2) ? "rowMedium" : "rowLight";
?>
<tr class="<?php print $css_class?>">
  <td><?php print $param?></td><td><?php print strtolower(var_export($a_pool{$param}))?></td>
</tr>
<?php
  $row++;
}
?>
</table>
</p>

<h2>WDK-Engine/Userlogin Connection Pool</h2>

<p>
<?php print $metrics_description ?>
</p>

<p>
<b>Metrics</b>
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3">
<th><font size="-2">Key</font></th>
<th><font size="-2">Value</font></th>
<th><font size="-2">Description</font></th>
</tr>

<tr class="rowLight"><td>BorrowedCount</td><td><?php print strtolower($u_pool{'BorrowedCount'})?></td>
  <td>Running count of connections borrowed from the pool by the application. This value is managed by the web application.</td>
</tr>
<tr class="rowMedium"><td>ReturnedCount</td><td><?php print strtolower($u_pool{'ReturnedCount'})?></td>
  <td>Running count of connections returned the pool by the application. This value is managed by the web application.</td>
</tr>
<tr class="rowLight"><td>CurrentlyOpenCount</td><td><?php print strtolower($u_pool{'CurrentlyOpenCount'})?></td>
  <td>Number of connections currenly in use by the application. A high number might indicate a leak. This value is managed by the web application.</td>
</tr>
<tr class="rowMedium"><td>NumActive</td><td><?php print strtolower($u_pool{'NumActive'})?></td>
  <td>The number of connections currently borrowed from the pool. This value is managed by the connection pool library.</td>
</tr>
<tr class="rowLight"><td>NumIdle</td><td><?php print strtolower($u_pool{'NumIdle'})?></td>
  <td>The number of connections currently idle in the pool. This value is managed by the connection pool library.</td>
</tr>

</table>
</p>


<p>
<b>Configuration</b>
</p>
<p>
The following are current runtime values retreived through the API of the active connection pool.
See <a href='http://commons.apache.org/proper/commons-dbcp/api-1.4/org/apache/commons/dbcp/BasicDataSource.html'>DBCP javadocs</a> 
for explanation of parameters.
</p>

<p>
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Parameter</font></th><th><font size="-2">Value</font></th></tr>
<?php
$row = 0;
$fields = array(
  'MinIdle', 'MaxIdle', 'MinEvictableIdleTimeMillis',
  'SoftMinEvictableIdleTimeMillis', 'TimeBetweenEvictionRunsMillis',
  'TestOnBorrow', 'TestOnReturn', 'TestWhileIdle'
);
foreach ($fields as $param) {
  $css_class = ($row % 2) ? "rowMedium" : "rowLight";
?>
<tr class="<?php print $css_class?>">
  <td><?php print $param?></td><td><?php print strtolower(var_export($u_pool{$param}))?></td>
</tr>
<?php
  $row++;
}
?>
</table>
</p>

