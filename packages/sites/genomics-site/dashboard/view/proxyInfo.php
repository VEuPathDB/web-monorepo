<?
require_once dirname(__FILE__) . "/../lib/modules/ProxyInfo.php";

$pi = new ProxyInfo();

$nginx_proxy_switcher_base = str_replace('@HOST@', $pi->get('proxied_host'), $pi->get('nginx_proxy_switcher'));

$nginxForm = $nginx_proxy_switcher_base
    . "&return=" . $_SERVER['SCRIPT_URI'] . '?' . $_SERVER["QUERY_STRING"];

$proxyNotice = '';
if ( $pi->get('via') ) {
    $proxyNotice = "<p>This site is reverse-proxied via <i>'" . $pi->get('via') . "'</i> to upstream host $upstreamServer.";
}

?>

<h2>Reverse-Proxy Server</h2>

<?= $proxyNotice ?>

<p>
<a href="<?= $nginxForm ?>">Change upstream server</a> (separate authentication required)
