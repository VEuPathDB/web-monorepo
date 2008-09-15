<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w"   uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<c:choose> 
<%-- this choose block is a crude effort to prevent data display
     when apache is not restricting with authentication --%>
<c:when test="${IS_ALLOWED_SITEINFO != 1}">
Content Not Displayed.<p>
This page must be proxied through Apache with proper configuration,
including authentication.
</c:when>
<c:otherwise>

<%@ page import="java.util.*, java.io.*, java.lang.*" %>
 
<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<%/* display page header with recordClass type in banner */%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var="dateFormatStr" value="EEE dd MMM yyyy h:mm a"/>

<html>
<head>
<title>${pageContext.request.serverName} Site Info</title>
<script type='text/javascript' src='/a/js/overlib.js'></script>
<script type='text/javascript' src='/a/js/prototype.js'></script>
<script type='text/javascript' src='/a/js/scriptaculous.js'></script>
<%-- http://wiki.script.aculo.us/scriptaculous/show/Effect.toggle --%>

<script type="text/javascript">
var ol_textcolor = "#003366";
var ol_fgcolor = "#ffffff";
var ol_bgcolor = "#003366";
var ol_texsize = "11px";
var ol_cellpad = "5";
var ol_height = -1;
var ol_vpos = ABOVE;
</script>

<style type="text/css">
<!--
body {
	font: 12px Verdana, Arial, Helvetica, sans-serif;
}

a { color: #2F4F4F }

h2 {
   border-width:2px 0;
   border-style:solid;
   border-color:#C28547;
   padding-left: 5px;
   }
   
h3 {
	background: #336699;
	color: white;
	cursor: pointer;
	font-family: Arial, Helvetica, sans-serif;
	margin: 0 0 5px 0;
	padding: 5px;
}

h3 a { color: white }

p {
	font-size: 12px;
	margin: 12px 8px;
}

table.p {
	font-size: 12px;
	margin: 12px 8px;
}

td.p {
    padding-left: 10px; 
}

tr.rowMedium {
    background-color: #C4CFCB;
    color: black;
    font-family: arial;
	font-size: 10pt;
}
tr.rowMedium td {
    padding-left:   5px;
    padding-top:    1px;
    padding-bottom: 1px;
}
tr.rowLight {
    background-color: #FFFFFF;
    color: black;
    font-family: arial;
	font-size: 10pt;
}

tr.rowLight td {
    padding-left:   5px;
    padding-top:    1px;
    padding-bottom: 1px;
}


tr.headerRow {
	background: #EFEFEF;
}

tr.headerRow  td,th {
   border-width:2px 0;
   border-style:solid;
   border-color:#336699;
   padding-left: 5px;
}
-->
</style>

</head>

<body>

<h3 align='center'><a href='/'>${pageContext.request.serverName}</a></h3>

<fmt:formatDate type="both" pattern="${dateFormatStr}" value="<%=new Date()%>" />

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

<h2><a href="#" style="text-decoration:none" onclick="Effect.toggle('cachedb','blind'); return false">
Cache/Userlogin Database &#8593;&#8595;</a></h2>
<div id="cachedb" style="padding: 5px; display: none"><div>
<api:wdkCacheDB var="cache"/>
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
</div></div>

<h2>Tomcat</h2>
<api:webappInfo var="app"/>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<tr><td><b>Instance:</b></td><td class="p">${app.instanceName}</td></tr>
<tr><td><b>Instance uptime:</b></td><td class="p">${app.instanceUptimeText}</td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Webapp:</b> </td><td class="p">${app.contextPath}</td></tr>
<tr><td><b>Webapp uptime:</b></td><td class="p">${app.webappUptimeText}</td></tr>
</table>
<p>
<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('classpathlist','blind'); return false">Webapp Classpath &#8593;&#8595;</a></b>
<div id="classpathlist" style="padding: 5px; display: none;"><div>
<c:forTokens items="${app.classpath}" delims=":" var="path">${path}<br></c:forTokens>
</div></div>
</p>

<h2>WDK</h2>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<c:catch var="e">
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <tr><td><b>Cache table count</b>:</td><td class="p">${wdkRecord.attributes['cache_count'].value}</td></tr>
</c:if>
</c:catch>
<c:if test="${e!=null}"> 
    <tr><td><font color="red">Cache tables information not available. Did you run wdkCache?</font></td></tr>
</c:if>

<tr><td>&nbsp;</td></tr>

<tr><td>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicommMacro']}">
    <b>LOGIN_DBLINK Macro</b>
    <a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         '@LOGIN_DBLINK@ as defined in WDK Record scope.<br>' +
         '(<i>cf.</i> the \'Available DBLinks\' table.)'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>:
    </td><td  class="p" valign="bottom">
        ${wdkRecord.attributes['apicommMacro'].value}
</c:if>
</td></tr>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicomm_global_name']}">
    <tr><td>
   <b>ApiComm dblink global_name</b>
    <a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <i>select global_name from global_name${wdkRecord.attributes['apicommMacro'].value}</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>:  
    </td><td class="p" valign="bottom"> 
    <c:catch var="e">
        ${wdkRecord.attributes['apicomm_global_name'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">${e}</font>
    </c:if>
    </td></tr>
</c:if>

</table>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
    <tr><td>
      <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('modelconfig','blind'); return false">
  Model Configuration &#8593;&#8595;</a></b>
  <div id="modelconfig" style="padding: 5px; display: none"><div>

        <api:modelConfig var="modelConfig"/>
        <p>
        The following configurations were obtained from the WDK's running instance of the ModelConfig class. These generally represent values defined in 
        the <code>model-config.xml</code>, <i>at the time the webapp was loaded</i>,
        although some properties shown may have been added by the WDK's internals. Passwords have been masked in this display.
        <pre>
        <c:forEach var="cfg" items="${modelConfig.props}">${cfg.key} = ${fn:escapeXml(cfg.value)}
        </c:forEach>
        </pre>    
      </div></div>
    </td></tr>
</table>
<h2>Build State</h2>
<p>
  <c:catch var="e">
  <api:properties var="build" propfile="WEB-INF/wdk-model/config/.build.info" />
  
  Last build  was a '<b>${build['!Last.build.component']}</b> 
  <b>${build['!Last.build.initialTarget']}</b>' 
  on <b>${build['!Last.build.timestamp']}</b>
  <a href='javascript:void()' style="text-decoration:none"
        onmouseover="return overlib('A given build may not refresh all project components. ' + 
        'For example, a \'ApiCommonData/Model install\' does not build any WDK code.<br>' +
        'See Build Details for a cummulative record of past builds.')"
        onmouseout = "return nd();"><sup>[?]</sup></a>

  <br>

  <b><a href="#" style="text-decoration:none" 
        onclick="Effect.toggle('buildtime','blind'); return false">
  Component Build Details &#8593;&#8595;</a></b>

  <div id="buildtime" style="padding: 5px; display: none"><div>
  <font size='-1'>A given build may not refresh all project components.<br>
  The following is a cummulative record of past builds.</font>
  
      <c:set var="i" value="0"/>

      <table border="0" cellspacing="3" cellpadding="2">
      <tr class="secondary3">
      <th align="left"><font size="-2">component</font></th>
      <th align="left"><font size="-2">build time</font></th>
      </tr>
      <c:forEach items="${build}" var="p">
      <c:if test="${fn:contains(p.key, '.buildtime')}">
  
          <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
          </c:choose>
  
          <td><pre>${fn:replace(fn:replace(p.key, ".buildtime", ""), ".", "/")}</pre></td>
          <td><pre>${p.value}</pre></td>
        </tr>
        <c:set var="i" value="${i +  1}"/>
      </c:if>
      </c:forEach>
      </table>
  
  </div></div>

  <p>

  <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('svnstate','blind'); return false">
  Svn Working Directory State &#8593;&#8595;</a></b>
  <div id="svnstate" style="padding: 5px; display: none"><div>
  <font size='-1'>State at build time. Uncommitted files are highlighted. Files may have been committed
  since this state was recorded.</font>
  
      <table class='p' border='1' cellspacing='0'>
      <c:forEach items="${build}" var="p">
      
      <c:if test="${fn:contains(p.key, '.svn.') && p.value != '' && p.value != 'NA' }">
          <c:choose>
          <c:when test="${fn:contains(p.key, '.svn.status')}">
            <c:set var="bgcolor" value="bgcolor='#FFFF99'"/>
            <c:set var="key">
            ${fn:replace(fn:replace(p.key, ".svn.status", " status"), ".", "/")}
            </c:set>
          </c:when>
          <c:otherwise>
            <c:set var="key">
            ${fn:replace(fn:replace(p.key, ".svn.info", ""), ".", "/")}
            </c:set>
          </c:otherwise>          
          </c:choose>
      <tr ${bgcolor}>
          <td><pre>${key}</pre></td>
        <td><pre>${p.value}</pre></td>
      </tr>
          <c:remove var="bgcolor"/>
      </c:if>
      </c:forEach>
      </table>
      
  </div></div>

</c:catch>
<c:if test="${e!=null}">
    <font size="-1" color="#CC0033">build info not available (check WEB-INF/wdk-model/config/.build.info)</font>
</c:if>

</body>
</html>

</c:otherwise>
</c:choose>
