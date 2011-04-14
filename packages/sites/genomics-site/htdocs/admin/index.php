
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

// keyworkd, url, and whether a menu tab should be made
$pageMap = array( 
    'Databases' => array(
        'url' => "/a/admin/index.jsp?p=Databases&key=$ws_key",
        'tab' => 1),
    'WDK' => array(
        'url' => "/a/admin/index.jsp?p=WDK&key=$ws_key",
        'tab' => 1),
    'Tomcat' => array(
        'url' => "/a/admin/index.jsp?p=Tomcat&key=$ws_key",
        'tab' => 1),
    'Apache' => array(
        'url' => "/admin/apacheInfo.php",
        'tab' => 1),
    'Proxy' => array(
        'url' => "/admin/proxyInfo.php",
        'tab' => 1),
    'Build' => array(
        'url' => "/a/admin/index.jsp?p=Build&key=$ws_key",
        'tab' => 1),
    'Announcements' => array(
        'url' => "/cgi-bin/admin/messageConsole.pl",
        'tab' => 1),
    'Logger'  => array(
        'url' => "/admin/logger.php",
        'tab' => 0),
    );


// default page
$page = ( isset($_GET['p']) ) ? $_GET['p'] : 'Databases';

?>

<body>

<? include "head.php.inc"; ?>

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
if (strncmp($pageMap[$page]['url'], 'https://', strlen('http://')) == 0) {
     print $pageMap[$page]['url'];
    include($pageMap[$page]['url']);
} else {
    virtual($pageMap[$page]['url']);
}
?>

</div>
</body>
</html>
