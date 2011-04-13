
<h3 class='banner' align='center'><a href='/'>
<? 
  include_once "functions.php.inc";
  print $_SERVER['SERVER_NAME'] . '<br>';
  if ($upstreamServer = upstreamServer()) {
    print "<font size='-1'>(upstream server: " . $upstreamServer . ")</font>";
  }

// auth token for jsp pages
$ws_key = getWSKey();


$headers = apache_request_headers();

?>
</a></h3>

<fmt:formatDate type="both" pattern="${dateFormatStr}" value="<%=new Date()%>" />
<? 

$pageMap = array( 
    'Databases'     => "/a/admin/index.jsp?p=Databases&key=$ws_key",
    'WDK'           => "/a/admin/index.jsp?p=WDK&key=$ws_key",
    'Tomcat'        => "/a/admin/index.jsp?p=Tomcat&key=$ws_key",
    'Apache'        => "/admin/apacheInfo.php",
    'Proxy'         => "/admin/proxyInfo.php",
    'Build'         => "/a/admin/index.jsp?p=Build&key=$ws_key",
    'Announcements' => "/cgi-bin/admin/messageConsole.pl"
    );


include "head.php.inc";

$page = ( isset($_GET['p']) ) ? $_GET['p'] : 'Databases';

?>

<body>

<ul id="tabmenu">
 <? 
    foreach ($pageMap as $key => $value) {
        if ( $key == 'Proxy' && !isset($headers['Via']) ) { continue; }
        $active = ($key == $page) ? "class='active'" : '';
        print "<li><a $active href='?p=$key'>$key</a></li>\n";
    }
 ?>
</ul>

<div id="content">

<? 
if (strncmp($pageMap[$page], 'https://', strlen('http://')) == 0) {
     print $pageMap[$page];
    include($pageMap[$page]);
} else {
    virtual($pageMap[$page]);
}
?>

</div>
</body>
</html>
