<?
require_once dirname(__FILE__) . "/../lib/modules/CacheInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/ModelConfigInfo.php";

$cache = new CacheInfo();
$model_config = new ModelConfigInfo();
$model_tree = $model_config->get_data_tree();

?>
<h2>Cache</h2>

<b>Cache table count: </b><span id="cache_table_count"><?=$cache->get('cache_table_count');?></span>
<button type="submit" id="refresh" value="refresh" onclick="refreshWdkCacheCount()">Refresh Display</button>
<p>
<h4>Reset WDK Cache</h4>
<button type="submit" id="reset_cache" value="reset_cache" onclick="resetWdkCache()">Reset Cache</button>
<p>
This is equivalent to the command,<br>
<code>wdkCache -model <?= $model_tree['global']['projectId'] ?> -reset</code>
<p>
Some cached data may be resident in memory, so reloading the webapp may also be required. 
See the <a href='?p=Tomcat'>Tomcat tab</a> for webapp reloading.


<p>
