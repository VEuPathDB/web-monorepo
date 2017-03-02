<!doctype html>
<?php require_once dirname(__FILE__) . "/lib/UserAgent.php" ?>
<html><?php include "head.php.inc"; ?>

<?php
/** Check if the page/tab has an 'exclude_hosts_re' regex matching
  * currrent host */
function exclude_this($pageMap, $key) {
  if (array_key_exists('exclude_hosts_re', $pageMap[$key])) {
    $exclude_hosts_re = $pageMap[$key]['exclude_hosts_re'];
    return (preg_match("/$exclude_hosts_re/", $_SERVER['SERVER_NAME']));
  }
  return false;
}
?>
<h3 class='banner' align='center'>
<?php
  print "<a href='/'>";
  require_once dirname(__FILE__) . "/lib/modules/ProxyInfo.php";
  $pi = new ProxyInfo();
  $pi_attr = $pi->attributes();
  print $_SERVER['SERVER_NAME'] ;
  if ($upstreamServer = $pi_attr{'upstream_server'}) {
    print "<br><font size='-1'>(upstream server: " . $upstreamServer . ")</font>";
  }
  print "</a>";
  print "<br><font size='-1'>[canonical server: " . php_uname('n') . "]</font>";

  $headers = apache_request_headers();
?>
</h3>
<?php
include('config/module.php');

// default page
$page = ( isset($_GET['p']) ) ? $_GET['p'] : 'Databases';
?>

<body>

<ul id="tabmenu">
 <?php
    // Print tabs menu
    foreach ($pageMap as $key => $value) {
        if ( exclude_this($pageMap, $key) ) { continue; }
        if ( ! $pageMap[$key]['tab']) { continue; }
        if ( $key == 'Proxy' && !isset($headers['Via']) ) { continue; }
        $active = ($key == $page) ? "class='active'" : '';
        print "<li><a $active href='?p=$key'>$key</a></li>\n";
    }
 ?>
</ul>

<div id="content">

<?php


if (!$pageMap[$page]) {
    print "unknown page '$page'";
    return;
}

if (exclude_this($pageMap, $page)) {
  print "NA";
} else {
    if (strncmp($pageMap[$page]['module'], 'http', 4) == 0) {
        readfile($pageMap[$page]['module']);
    } else {
        virtual($pageMap[$page]['module']);
    }
}
?>

<a href="?p=About"><img src="images/logo.png" align="right" vspace="2" /></a>
</div>

</body>
</html>
