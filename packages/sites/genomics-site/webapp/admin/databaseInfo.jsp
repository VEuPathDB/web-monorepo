<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w"   uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<api:wdkRecord name="UtilityRecordClasses.SiteInfo"/>
<c:set var="dateFormatStr" value="EEE dd MMM yyyy h:mm a"/>

<h2>Genome Database</h2>

<div class='related_siteinfo_links'>
Related Links
<ul>
<li>CBIL DBA Interface (password required)</li>
  <ul>
    <li><a href="https://www.cbil.upenn.edu/dba/uga.php">UGA databases</a></li>
    <li><a href="https://www.cbil.upenn.edu/dba/">Penn databases</a></li>
  </ul>
</div>

<c:catch var="e">
${wdkRecord.attributes['service_name'].value}
</c:catch>
<c:choose>
<c:when test="${e!=null}">
<font color='red'>Information not available</font><br>
<font size='-2'>${fn:replace(e, fn:substring(e, 175, -1), '...')}</font>
</c:when>
<c:otherwise>

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

<c:catch var="e">
<api:orclSvcAliases servicename="${wdkRecord.attributes['service_name'].value}" var='srv'/>
</c:catch>
<c:choose>
<c:when test="${e!=null}">
<font color='red'>Aliases Information not available</font><br>
<font size='-2'>${fn:replace(e, fn:substring(e, 175, -1), '...')}</font>
</c:when>
<c:otherwise>
<b>Aliases</b> (from LDAP): ${srv.names}
</c:otherwise>
</c:choose>


<br><br>
<b>Hosted on</b>: ${wdkRecord.attributes['server_name'].value} (${wdkRecord.attributes['server_ip'].value})<br>
<b>Oracle Version</b>: ${wdkRecord.attributes['version'].value}
<p>
<b>Client login name</b>: ${fn:toLowerCase(wdkRecord.attributes['login'].value)}</b><br>
<b>Client connecting from</b>: ${wdkRecord.attributes['client_host'].value}<br>
<b>Client OS user</b>: ${wdkRecord.attributes['os_user'].value}<br>
<p>
<b>Available DBLinks</b>: <site:dataTable tblName="AllDbLinks"/>
</p>
<!--
<p>
<b><a href="javascript:javascript:void(0)" 
onclick="window.open('<c:url value="/admin/activeSql.jsp"/>', 
'sqlMonitor${wdkRecord.attributes['service_name'].value}', 
'toolbar=0,status=0,location=0,menubar=0,height=600,width=800,scrollbars=yes')">
Active SQL Queries <font size='+1'>&#10063;</font></a></b>
</p>
--!>
</c:otherwise>
</c:choose>

<h2>Custom Tuning</h2>
<p>

<b>Tuning Manager</b>
<blockquote>
<c:catch var='e'>
<c:choose>
  <c:when test="${wdkRecord.attributes['elapsedCheckDays'].value == null}">
    <div style="background-color:red; color:white; padding:3px; width:75%">
    <b>Last check</b>: No timestamp found in tuningManager registry.
    </div>
  </c:when>
  <c:otherwise>
    <c:if test="${wdkRecord.attributes['elapsedCheckDays'].value > 1}"><c:set var="tMWarning" value='1'/></c:if>
    <c:if test="${tMWarning == 1}"><div style="background-color:red; color:white; padding:3px; width:75%"></c:if>
      <b>Last check</b>: ${wdkRecord.attributes['last_check']} 
      (<c:if 
         test="${wdkRecord.attributes['elapsedCheckDays'].value != 0}">${wdkRecord.attributes['elapsedCheckDays'].value} days </c:if><c:if 
         test="${wdkRecord.attributes['elapsedCheckHours'].value != 0}">${wdkRecord.attributes['elapsedCheckHours'].value} hours </c:if><c:if 
         test="${wdkRecord.attributes['elapsedCheckDays'].value == 0 && wdkRecord.attributes['elapsedCheckHours'].value == 0}">${wdkRecord.attributes['elapsedCheckMinutes'].value} minutes</c:if> ago)<br>
    <c:if test="${tMWarning == 1}"></div></c:if>
  </c:otherwise>
</c:choose>

<b>Last check status</b>: 
  <c:choose>
    <c:when test="${wdkRecord.attributes['state'].value == 0}">up to date, no changes</c:when>
    <c:when test="${wdkRecord.attributes['state'].value == 1}"><font color='green'>tables updated</font>, expand <a href="#" style="text-decoration:none" onclick="Effect.toggle('tuningtables','blind'); return false">
Tuning Tables &#8593;&#8595;</a> below for details</c:when>
    <c:when test="${wdkRecord.attributes['state'].value == 2}"><font color='red'><b>out of date</b> since ${wdkRecord.attributes['outdated_since'].value}</font></c:when>
    <c:otherwise><font color='red'>unknown status</font></c:otherwise>
  </c:choose>
  <br>
<b>Last OK state</b>: ${wdkRecord.attributes['last_ok'].value}<br>

<b>Database family name</b>: ${wdkRecord.attributes['family_name'].value}<br>
<b>Subversion url</b>: <a href="${wdkRecord.attributes['subversion_url'].value}">${wdkRecord.attributes['subversion_url'].value}</a><br>
<c:if test="${wdkRecord.attributes['is_live'].value == 0 || wdkRecord.attributes['is_live'].value == 1}"><b>Portal database is_live</b>: </c:if>
<c:choose>
  <c:when test="${wdkRecord.attributes['is_live'].value == 0}">${wdkRecord.attributes['is_live'].value}; using *build dblinks to component databases</c:when>
  <c:when test="${wdkRecord.attributes['is_live'].value == 1}">${wdkRecord.attributes['is_live'].value}; using dblinks to component production databases</c:when>
  <c:otherwise></c:otherwise>
</c:choose>
</c:catch>
<c:if test="${e!=null}"> 
    <tr><td><font color="red">information not available</font><br><font size='-2'>${fn:replace(e, fn:substring(e, 175, -1), '...')}</font></td></tr>
</c:if>
</blockquote>
</p>
<p>
<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('tuningtables','blind'); return false">
Tuning Tables &#8593;&#8595;</a></b>
<div id="tuningtables" style="padding: 5px; display: none"><div>
<site:dataTable tblName="TuningTables"/>
</div></div>
</p>

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

