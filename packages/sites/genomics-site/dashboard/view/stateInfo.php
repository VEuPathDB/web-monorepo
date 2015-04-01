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

<hr>

<b>Global caching is enabled: </b><span id="wdk_is_caching"><?php 
  ( ! $cattr{'WdkIsCaching'}) &&  print "<span class='fatal'>";
  print var_export($cattr{'WdkIsCaching'});
  ( ! $cattr{'WdkIsCaching'}) && print "</span>";
?></span>

<?php 
/** 
 * only give access to the Toggle button on websites in QA stage or lower. If you
 * really must toggle a public site, use jconsole. 
*/
if (getenv('WEBSITE_RELEASE_STAGE')  <= getenv('WEBSITE_RELEASE_STAGE_QA') ) {
?>
  <button type="submit" id="toggleWdkIsCaching" value="toggleWdkIsCaching" onclick="toggleWdkIsCaching()">Toggle</button>
<?php } ?>

<p>
When global caching is enabled, each individual sqlQuery defined in the model will control their
own cache behavior. When global caching is disabled, then sqlQuery caching will not be used,
regardless of the individual setting on the query. This flag has no effect on
processQueries, which are always cached. This option to disable caching is 
intended to aid benchmarking of database and other system tunings. Disabling global caching can cause severe  
degradation of website performance and will break some searches.  Caching should never be disabled on public, 
production websites.

<p>
