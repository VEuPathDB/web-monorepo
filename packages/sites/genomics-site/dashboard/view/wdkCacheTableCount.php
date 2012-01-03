<?
require_once dirname(__FILE__) . '/../lib/modules/CacheInfo.php';
require_once dirname(__FILE__) . "/../lib/modules/ResetWdkCache.php";

if (isset($_POST['reset']) && $_POST['reset'] == 1) {
  $reset = new ResetWdkCache();
}

$cache = new CacheInfo();
print $cache->get('cache_table_count');
?>

