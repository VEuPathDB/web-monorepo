<?php
/**
 * Information about Tomcat and the Java VM.
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/Jvm.php";
require_once dirname(__FILE__) . "/../lib/modules/Webapp.php";
require_once dirname(__FILE__) . "/../lib/modules/Catalina.php";

$jvm = new Jvm();
$webapp = new Webapp();
$catalina = new Catalina();

$jvm_data = $jvm->attributes();
$webapp_data = $webapp->attributes();
$catalina_data = $catalina->attributes();

// TODO - if possible show undeployed or stopped instead of error for webapp uptime
?>

<h2>Tomcat</h2>


<table class='p' border='0' cellpadding='0' cellspacing='0'>
<tr><td><b>Instance:</b></td><td class="p"><?= $jvm_data{'SystemProperties'}{'instance.name'} ?></td></tr>
<tr><td><b>Instance uptime:</b></td><td class="p"><?= $jvm->uptime_as_text() ?></td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Webapp:</b> </td><td class="p"><?= str_replace('/', '', $webapp_data{'path'}); ?></td></tr>

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
<tr><td><b>Servlet container:</b> </td><td class="p"><?= $catalina_data{'ServerInfo'}; ?></td></tr>
<tr><td><b>Servlet API version:</b> </td><td class="p"><?= $catalina_data{'ServletApiVersion'}; ?></td></tr>
<tr><td><b>JSP spec version:</b> </td><td class="p"><?= $catalina_data{'JspSpecVersion'}; ?></td></tr>
</table>
<p>

<p class="clickable">Webapp Classpath &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">
<?= str_replace(':', '<br>', $jvm_data{'ClassPath'}) ?><?= str_replace(':', '<br>', $webapp_data{'loaderRepositoriesString'}) ?>
</div>

</p>
<p>
<b><a href="?p=Logger">Manage Log Levels</a></b> for this running instance of the webapp
</p>
