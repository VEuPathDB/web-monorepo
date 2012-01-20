<? require_once dirname(__FILE__) . "/lib/UserAgent.php" ?>

<h3 class='banner' align='center'>
<a href='/'>
<? 
  require_once dirname(__FILE__) . "/lib/modules/ProxyInfo.php";
  $pi = new ProxyInfo();
  print $_SERVER['SERVER_NAME'] ;
  if ($upstreamServer = $pi->get('upstream_server')) {
    print "<br><font size='-1'>(upstream server: " . $upstreamServer . ")</font>";
  }
$headers = apache_request_headers();

?>
</a>
</h3>
<fmt:formatDate type="both" pattern="${dateFormatStr}" value="<%=new Date()%>" />
<? 
include('config/module.php');

// default page
$page = ( isset($_GET['p']) ) ? $_GET['p'] : 'Databases';
?>
<? include "head.php.inc"; ?>

<body>

<ul id="tabmenu">
 <? 
    // Print tabs menu
    foreach ($pageMap as $key => $value) {
        if ( ! $pageMap[$key]['tab']) { continue; }
        if ( $key == 'Proxy' && !isset($headers['Via']) ) { continue; }
        $active = ($key == $page) ? "class='active'" : '';
        print "<li><a $active href='?p=$key'>$key</a></li>\n";
    }
 ?>
</ul>

<div id="content">

<? 


if (!$pageMap[$page]) {
    print "unknown page '$page'";
    return;
}

if (strncmp($pageMap[$page]['module'], 'http', 4) == 0) {
    readfile($pageMap[$page]['module']);
} else {
    virtual($pageMap[$page]['module']);
}
?>

<a href="?p=About"><img src="images/logo.png" align="right" vspace="2" /></a>
</div>

</body>
</html>
