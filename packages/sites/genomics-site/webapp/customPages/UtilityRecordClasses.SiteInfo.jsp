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

<h2>Database</h2>

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

<h2>Tomcat</h2>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<tr><td><b>Instance:</b></td><td class="p"><%= System.getProperty("instance.name") %></td></tr>
<tr><td><b>Instance uptime:</b></td><td class="p"><%= uptimeText(application, pageContext) %></td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Webapp:</b> </td><td class="p">${pageContext.request.contextPath}</td></tr>
<tr><td><b>Webapp uptime:</b></td><td class="p"><%= webappUptime(application, pageContext ) %></td></tr>
</table>
<p>
<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('classpathlist','blind'); return false">Webapp Classpath &#8593;&#8595;</a></b>
<div id="classpathlist" style="padding: 5px; display: none;"><div>
${fn:replace(applicationScope['org.apache.catalina.jsp_classpath'], ':', '<br>')}
</div></div>
</p>

<h2>WDK</h2>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<c:catch var="e">
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <tr><td><b>Cache table count</b>:</td><td class="p">${wdkRecord.attributes['cache_count'].value}</td></tr>
 <tr><td><b>Cache created</b><a href='javascript:void()'
        onmouseover="return overlib('Creation time of the QueryInstance table.')"
        onmouseout = "return nd();"><sup>[?]</sup></a>
        :</td><td class="p">${wdkRecord.attributes['creation_time'].value}</td></tr>
 <tr><td><b>Cache first entry</b><a href='javascript:void()'
        onmouseover="return overlib('Determining when the WDK cache tables were \'-reset\' ' + 
        'is non-trivial. However, we can use the minium start_time of the QueryInstance ' +
        'table to report the first time the cache was used after a reset or create.')"
        onmouseout = "return nd();"><sup>[?]</sup></a>
        :</td><td class="p">${wdkRecord.attributes['first_time'].value}</td></tr>
 <tr><td><b>Cache last entry:</b></td><td class="p">${wdkRecord.attributes['last_time'].value}</td></tr>
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


<%-- #####################################################################  --%>
<%-- #####################################################################  --%>


<%!
public String webappUptime(ServletContext application, PageContext pageContext) {
  try {
    java.text.DateFormat formatter = new java.text.SimpleDateFormat( 
                        (String)pageContext.getAttribute("dateFormatStr") );

    File jspFile = (File)application.getAttribute("javax.servlet.context.tempdir");
    java.util.Date lastModified = new Date(jspFile.lastModified());
    
    long milliseconds = System.currentTimeMillis() - lastModified.getTime();
     
    int days    = (int)(milliseconds / (1000*60*60*24))     ;
    int hours   = (int)(milliseconds / (1000*60*60   )) % 24;
    int minutes = (int)(milliseconds / (1000*60      )) % 60;
    int seconds = (int)(milliseconds / (1000         )) % 60;

    String uptimeSince = (String)formatter.format(new Date(jspFile.lastModified()));
    String uptimeBrief = uptimeBrief(days, hours, minutes, seconds);
   
    return uptimeBrief + " (since " + uptimeSince + ")";
  } catch (Exception e) {
    return "Error: " + e;
  }
}
%>


<%!
public String uptimeText(ServletContext application, PageContext pageContext) {
  try {

    String uptime = elapsedTimeSinceTomcatJVMStart();
    uptime = uptime.trim();
    
    java.util.regex.Pattern pat;
    java.util.regex.Matcher m;

    int days    = 0;
    int hours   = 0;
    int minutes = 0;
    int seconds = 0;
 
    pat = java.util.regex.Pattern.compile("^(?:(\\d+)-)?(?:(\\d+):)?(\\d+):(\\d+)$");
    m = pat.matcher(uptime);

    if (m.find()) {
      if (m.group(1) != null) days    = Integer.parseInt(m.group(1));
      if (m.group(2) != null) hours   = Integer.parseInt(m.group(2));
      if (m.group(3) != null) minutes = Integer.parseInt(m.group(3));
      if (m.group(4) != null) seconds = Integer.parseInt(m.group(4));
    } else {
        throw new Exception();
    }
        
    String uptimeSince = uptimeSince(days, hours, minutes, seconds, (String)pageContext.getAttribute("dateFormatStr") );
    String uptimeBrief = uptimeBrief(days, hours, minutes, seconds);
    
    return uptimeBrief + " (since " + uptimeSince + ")";

  } catch (Exception e) {
    return "<font color='red'>Error: unable to determine start time</font>";
  }
}
%>

<%!
public String uptimeSince(int days, int hours, int minutes, int seconds, String fmt) {
  java.util.Calendar calendar = java.util.Calendar.getInstance();
   
  calendar.add(Calendar.DAY_OF_MONTH, -days);
  calendar.add(Calendar.HOUR,         -hours);
  calendar.add(Calendar.MINUTE,       -minutes);
  calendar.add(Calendar.SECOND,       -seconds);
  
  java.util.Date startTime = calendar.getTime();

  java.text.DateFormat formatter = new java.text.SimpleDateFormat(fmt);

  return (String)formatter.format(startTime) ;
}
%>

<%!
public String uptimeBrief(int days, int hours, int minutes, int seconds) {
  String uptimeBrief = "";
  if (days != 0)
    uptimeBrief = days + "d " + hours + "h";
  else if (hours != 0)
    uptimeBrief = hours + "h " + minutes + "m";
  else if (seconds != 0)
    uptimeBrief = minutes + "m " + seconds + "s";
  
  return uptimeBrief;
}
%>

<%!
public String elapsedTimeSinceTomcatJVMStart() throws Exception {
  try {
    String result;
    Vector commands=new Vector();
    commands.add("/bin/bash");
    commands.add("-c");
    commands.add("ps -o etime $PPID | tail -n1");
    
    ProcessBuilder pb=new ProcessBuilder(commands);  
    Process pr=pb.start();
    pr.waitFor();
    
    if (pr.exitValue()==0) {
        BufferedReader output = new BufferedReader(
                        new InputStreamReader(pr.getInputStream()));
        result = output.readLine().trim();
        output.close();
    } else {
        BufferedReader error = new BufferedReader(
                        new InputStreamReader(pr.getErrorStream()));        
        result = "Error: " + error.readLine(); 
    }
    return result;
    } catch (Exception e) {
    throw e;
  }
}
%>


</c:otherwise>
</c:choose>
