<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w"   uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<api:wdkRecord name="UtilityRecordClasses.SiteInfo"/>

<h2>Genome Database</h2>

<p>
<b>Identifiers</b>:
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Identifier</font></th><th><font size="-2">Value</font></th><th></th></tr>
<tr class="rowLight"><td>Service Name</td><td>${fn:toLowerCase(wdkRecord.attributes['service_name'].value)}</td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>Instance Name</td><td>${fn:toLowerCase(wdkRecord.attributes['instance_name'].value)}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td>${fn:toLowerCase(wdkRecord.attributes['global_name'].value)}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td>${fn:toLowerCase(wdkRecord.attributes['db_unique_name'].value)}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>
<br>
<b>Hosted on</b>: ${wdkRecord.attributes['server_name'].value} (${wdkRecord.attributes['server_ip'].value})<br>
<b>Oracle Version</b>: ${wdkRecord.attributes['version'].value}
<p>
<b>Client login name</b>: ${fn:toLowerCase(wdkRecord.attributes['login'].value)}</b><br>
<b>Client connecting from</b>: ${wdkRecord.attributes['client_host'].value}<br>
<b>Client OS user</b>: ${wdkRecord.attributes['os_user'].value}<br>
<p>
<b>Available DBLinks</b>: <site:dataTable tblName="AllDbLinks"/>
</p>
<br>
<p>
<h2>WDK-Engine/Userlogin Database</h2>
<api:wdkUserDB var="cache"/>
<p>
<b>Identifiers</b>:
<table border="0" cellspacing="3" cellpadding="2" align="">
<tr class="secondary3"><th><font size="-2">Identifier</font></th><th><font size="-2">Value</font></th><th></th></tr>
<tr class="rowLight"><td>Service Name</td><td>${fn:toLowerCase(cache.dbInfo['service_name'])}</td>
    <td><a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'service_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>Instance Name</td><td>${fn:toLowerCase(cache.dbInfo['instance_name'])}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'instance_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowLight"><td>Global Name</td><td>${fn:toLowerCase(cache.dbInfo['global_name'])}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'global_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
<tr class="rowMedium"><td>DB Unique Name</td><td>${fn:toLowerCase(cache.dbInfo['db_unique_name'])}</td>
    <td><a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <br><i>select&nbsp;sys_context(\'userenv\',&nbsp;\'db_unique_name\')&nbsp;from&nbsp;dual</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a></td>
</tr>
</table>
<br>
<b>Hosted on</b>: ${cache.dbInfo['server_name']} (${cache.dbInfo['server_ip']})<br>
<p>
<b>Client login name</b>: ${fn:toLowerCase(cache.dbInfo['login'])}</b><br>

