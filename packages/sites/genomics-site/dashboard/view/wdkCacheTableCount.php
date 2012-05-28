<?php
/**
 * Action page to reset the WDK database cache
 * @package View
 */

require_once dirname(__FILE__) . '/../lib/modules/WdkCache.php';

$cache = new WdkCache();

if (isset($_POST['reset']) && $_POST['reset'] == 1) {
  $cache->reset();
}

// Get attributes AFTER any call to reset() !!
$cattr = $cache->attributes();

print $cattr{'cache_table_count'};
?>
