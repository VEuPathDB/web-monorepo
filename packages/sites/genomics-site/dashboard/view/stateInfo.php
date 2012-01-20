<?
require_once dirname(__FILE__) . "/../lib/modules/CacheInfo.php";

$cache = new CacheInfo();

?>
<h2>Cache</h2>

<b>Cache table count: </b><span id="cache_table_count"><?=$cache->get('cache_table_count');?></span>
&nbsp;
<button type="submit" id="refresh" value="refresh" onclick="refreshWdkCacheCount()">Refresh</button>&nbsp;
<button type="submit" id="reset_cache" value="reset_cache" onclick="resetWdkCache()">Reset</button>
<p>
