<?php
/**
 * Information about the WDK cache.
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/WdkCache.php";
require_once dirname(__FILE__) . "/../lib/modules/ModelConfig.php";
require_once dirname(__FILE__) . "/../lib/modules/WdkMeta.php";

$cache = new WdkCache();
$model_config = new ModelConfig();
$cattr = $cache->attributes();
$model_data_tree = $model_config->attributes();
$meta = new WdkMeta();
$meta_data = $meta->attributes();

?>
<h2>Model</h2>
<b>Name: </b><?php print $meta_data{'DisplayName'};?><br>
<b>Model Version: </b><?php print $meta_data{'ModelVersion'};?><br>
<b>Build Number: </b><?php print $meta_data{'BuildNumber'};?><br>
<b>Release Date: </b><?php print $meta_data{'ReleaseDate'};?><br>
<b>GUS Home: </b><?php print $meta_data{'GusHome'};?><br>

<h2>Cache</h2>

<b>Cache table count: </b><span id="cache_table_count"><?php print $cattr{'cache_table_count'};?></span>
<button type="submit" id="refresh" value="refresh" onclick="refreshWdkCacheCount()">Refresh Display</button>
<p>
<h4>Reset WDK Cache</h4>
<button type="submit" id="reset_cache" value="reset_cache" onclick="resetWdkCache()">Reset Cache</button>
<p>
This is equivalent to the command,<br>
<code>wdkCache -model <?php print $model_data_tree['global']['projectId'] ?> -reset</code>
<p>
Some cached data may be resident in memory, so reloading the webapp may also be required.
See the <a href='?p=Tomcat'>Tomcat tab</a> for webapp reloading.


<p>
