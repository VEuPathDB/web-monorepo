<?php
/**
 * Action page to toggle the WDK global database cache on/off
 * @package View
 */

require_once dirname(__FILE__) . '/../lib/modules/WdkCache.php';

$cache = new WdkCache();

if (isset($_POST['toggle']) && $_POST['toggle'] == 1) {
  $cache->toggleWdkIsCaching();
}

// Get attributes AFTER any call to toggleWdkIsCaching() !!
$cattr = $cache->attributes();

// print current value (highlight with color if caching is disabled)
( ! $cattr{'WdkIsCaching'}) &&  print "<span class='fatal'>";
print var_export($cattr{'WdkIsCaching'});
( ! $cattr{'WdkIsCaching'}) && print "</span>";
?>
