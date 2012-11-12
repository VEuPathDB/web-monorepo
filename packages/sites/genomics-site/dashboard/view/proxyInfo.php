<?php
/**
 * Information about HTTP reverse proxy (if any).
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/ProxyInfo.php";

$pi = new ProxyInfo();
$attributes = $pi->attributes();

$nginx_proxy_switcher_base = str_replace('@HOST@', $attributes{'proxied_host'}, $attributes{'nginx_proxy_switcher'});

$nginxForm = $nginx_proxy_switcher_base
    . "&return=" . $_SERVER['SCRIPT_URI'] . '?' . $_SERVER["QUERY_STRING"];

$proxyNotice = '';
if ( $attributes{'via'} ) {
    $proxyNotice = "<p>This site is reverse-proxied via <i>'" . $attibutes{'via'} . "'</i> to upstream host $upstreamServer.";
}

?>

<h2>Reverse-Proxy Server</h2>

<?php print $proxyNotice ?>

<p>
<a href="<?php print $nginxForm ?>">Change upstream server</a> (separate authentication required)
