
<h3 class='banner' align='center'><a href='/'>
<? 
  include_once "functions.php.inc";
  print $_SERVER['SERVER_NAME'] . '<br>';
  if ($upstreamServer = upstreamServer()) {
    print "<font size='-1'>(upstream server: " . $upstreamServer . ")</font>";
  }
?>
</a></h3>

<fmt:formatDate type="both" pattern="${dateFormatStr}" value="<%=new Date()%>" />
<? 

$pageMap = array( 
    'Databases'     => "/a/admin/index.jsp?p=Databases",
    'WDK'           => "/a/admin/index.jsp?p=WDK",
    'Tomcat'        => "/a/admin/index.jsp?p=Tomcat",
    'Apache'        => "/admin/apacheInfo.php",
    'Build'         => "/a/admin/index.jsp?p=Build",
    'Announcements' => "/cgi-bin/admin/messageConsole.pl"
    );


include "head.php.inc";

$page = ( isset($_GET['p']) ) ? $_GET['p'] : 'Databases';

?>

<body>

<ul id="tabmenu">
 <? 
    foreach ($pageMap as $key => $value) {
        $active = ($key == $page) ? "class='active'" : '';
        print "<li><a $active href='?p=$key'>$key</a></li>\n";
    }
 ?>
</ul>

<div id="content">

    <? if ( $pageMap[$page] == '' || ! virtual($pageMap[$page]) )
        print "'$pageMap[$page]' not found"?>

</div>
</body>
</html>