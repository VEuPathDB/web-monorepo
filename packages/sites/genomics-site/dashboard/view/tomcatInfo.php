<?
require_once dirname(__FILE__) . "/../lib/modules/JvmInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/WebappInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/CatalinaInfo.php";

$jvm = new JvmInfo();
$webapp = new WebappInfo();
$catalina = new CatalinaInfo();

$jvm_data = $jvm->get_data_map();
$webapp_data = $webapp->get_data_map();
$catalina_data = $catalina->get_data_map();
?>

<h2>Tomcat</h2>


<table class='p' border='0' cellpadding='0' cellspacing='0'>
<tr><td><b>Instance:</b></td><td class="p"><?= $jvm_data{'SystemProperties'}{'instance.name'} ?></td></tr>
<tr><td><b>Instance uptime:</b></td><td class="p"><?= $jvm->uptime_as_text() ?></td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Webapp:</b> </td><td class="p"><?= $webapp->get_context(); ?></td></tr>

<tr><td><b>Webapp uptime:</b></td><td class="p">
<span id="webapp_uptime">
  <? $t=$webapp->uptime_as_text();  print (isset($t)) ? $t : "<span class='warn'>error</span>" ; ?>
</span>
</td></tr>
<tr><td></td><td>
  <button type="submit" id="reload_webapp" value="reload_webapp" onclick="reloadWebapp()">
    Reload Webapp
  </button>
</td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Servlet container:</b> </td><td class="p"><?= $catalina->get('serverInfo'); ?></td></tr>
<tr><td><b>Servlet info:</b> </td><td class="p">${app.servletInfo}</td></tr>
<tr><td><b>Servlet API version:</b> </td><td class="p">${app.servletApiVersion}</td></tr>
</table>
<p>

<p class="clickable">Webapp Classpath &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">
<?= str_replace(':', '<br>', $jvm_data{'ClassPath'}) ?><?= str_replace(':', '<br>', $webapp->get('loaderRepositoriesString')) ?>
</div>

</p>
<p>
<b><a href="?p=Logger">Manage Log Levels</a></b> for this running instance of the webapp
</p>
