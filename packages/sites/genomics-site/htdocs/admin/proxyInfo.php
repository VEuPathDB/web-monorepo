<?

$nginxForm = "https://rubus.rcc.uga.edu/proxy-bin/admin/set-nginx-upstream?conf=" 
    . $headers['Host'] . ".conf"
    . "&return=" . $_SERVER['SCRIPT_URI'] . '?' . $_SERVER["QUERY_STRING"];
    

$headers = apache_request_headers();
$proxyNotice = '';
if ( isset($headers['Via']) ) {
    $via = $headers['Via'];
    $proxyNotice = "<p>This site is reverse-proxied via <i>'$via'</i> to upstream host $upstreamServer.";
}

?>

<h2>Reverse-Proxy Server</h2>

<? print $proxyNotice ?>

<p>
<a href="<? print $nginxForm ?>">Change upstream server</a> (separate authentication required)
