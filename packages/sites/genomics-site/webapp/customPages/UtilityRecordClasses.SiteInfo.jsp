<%--
Required query:
        <sqlQuery name="CurrentInstance" isCacheable='false'>
            <paramRef ref="params.primaryKey"/> 
            <column name="global_name" />
            <column name="host_name" />
            <column name="address" />
            <column name="version" />
            <column name="system_date" />
            <column name="login" />
           <sql> 
            <![CDATA[           
            select 
                global_name, 
                ver.banner version,
                UTL_INADDR.get_host_name as host_name,
                UTL_INADDR.get_host_address as address,
                to_char(sysdate, 'Dy DD-Mon-YYYY HH24:MI:SS') as system_date,
                sys_context('USERENV', 'SESSION_USER') as login
            from global_name, v$version ver
            where lower(ver.banner) like '%oracle%'
             ]]>
           </sql>
        </sqlQuery>


OPTIONAL, to test dblink. Allowed column names are
cryptolink, plasmolink, toxolink 
       <sqlQuery name="PingPlasmo" isCacheable='false'>
            <paramRef ref="params.primaryKey"/> 
            <column name="plasmolink" />
            <sql> 
            <![CDATA[           
            select 
                global_name as plasmolink
            from global_name@plasmo
             ]]>
           </sql>
        </sqlQuery>


--%>
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

<c:set var="dateFormatStr" value="EEE dd MMM yyyy h:mm:ss a"/>

<html>
<head>
<title>${pageContext.request.serverName} Site Info</title>
<script type='text/javascript' src='/cryptodb/js/overlib.js'></script>
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

tr.rowMedium {
    background-color: #FFFFFF;
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
<b>Oracle instance</b>: ${fn:toLowerCase(wdkRecord.attributes['global_name'].value)}</b><br>
<b>Login name</b>: ${fn:toLowerCase(wdkRecord.attributes['login'].value)}</b><br>
<b>Hosted on</b>: ${wdkRecord.attributes['host_name'].value} (${wdkRecord.attributes['address'].value})<br>
<b>Oracle Version</b>: ${wdkRecord.attributes['version'].value}<br>

<b>Available DBLinks</b>: <site:dataTable tblName="AllDbLinks"/>
<p>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cryptolink']}">
    <br>
    <b>CryptoDB dblink:</b>
    <c:catch var="e">
        ${wdkRecord.attributes['cryptolink'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['plasmolink']}">
    <br>
    <b>PlasmoDB dblink:</b>
    <c:catch var="e">
        ${wdkRecord.attributes['plasmolink'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['plasmolink2']}">
    <br>
    
    <c:catch var="e">

        ${wdkRecord.attributes['plasmolink2'].value}
    </c:catch>
    <c:if test="${e!=null}">
        ${e}<br>
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['toxolink']}">
    <br>
    <b>ToxoDB dblink:</b>
    <c:catch var="e">
        ${wdkRecord.attributes['toxolink'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['toxolink2']}">
    <br>
    
    <c:catch var="e">
        ${wdkRecord.attributes['toxolink2'].value}
    </c:catch>
    <c:if test="${e!=null}">
        ${e}<br>
        <font color="#CC0033">not responding</font>
    </c:if>

    <br><br>
    (TEST1 --> DBC2<br>
    TEST2 --> THEMIS<br>
    TEST3 --> DBC1)<br>

</c:if>

<h2>Tomcat</h2>
<p>
<b>Instance:</b> <%= System.getProperty("instance.name") %></br>
<b>Instance Uptime:</b> <%= uptime() %><br> 
<b>Web App:</b> ${pageContext.request.contextPath}<br>
<b>Last webapp reload:</b> <%= lastReload(application, pageContext ) %>
<br>
<b><a href="#" onclick="Effect.toggle('classpathlist','blind'); return false">JSP Classpath &#8593;&#8595;</a></b>
<div id="classpathlist" style="padding: 5px; display: none"><div>
${fn:replace(applicationScope['org.apache.catalina.jsp_classpath'], ':', '<br>')}
</div></div>
</p>

<h2>WDK</h2>
<p>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['userlink']}">
<b>DB Link to User login, registration and comments Database:</b> 
<c:catch var="e">
        ${wdkRecord.attributes['userlink'].value}
    </c:catch>
    <c:if test="${e!=null}">
        ${e}<br>
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicommMacro']}">
    <p>
    <b>LOGIN_DBLINK Macro</b>
    <a href='javascript:void()' 
        onmouseover="return overlib(
         '@LOGIN_DBLINK@ as defined in WDK Record scope.<br>' +
         '(<i>cf.</i> the \'Available DBLinks\' table.)'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>
     : ${wdkRecord.attributes['apicommMacro'].value}
       <br>
</c:if>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicomm_global_name']}">
    <c:catch var="e">
   <b>ApiComm dblink global_name</b>
    <a href='javascript:void()' 
        onmouseover="return overlib(
         'result of <i>select global_name from global_name${wdkRecord.attributes['apicommMacro'].value}</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>
   :  ${wdkRecord.attributes['apicomm_global_name'].value}<br>
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">${e}</font>
    </c:if>
</c:if><br>

<c:catch var="e">
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <b>Cache Tables:</b> ${wdkRecord.attributes['cache_count'].value}
</c:if>
</c:catch>
<c:if test="${e!=null}"> 
    <font color="red">Cache tables information not available. Did you run wdkCache?</font>
</c:if>


<h2>Build State</h2>
<p>
  <c:catch var="e">
  <api:properties var="build" propfile="WEB-INF/wdk-model/config/.build.info" />
  
  Last build  was a '<b>${build['!Last.build.component']}</b> 
  <b>${build['!Last.build.initialTarget']}</b>' 
  on <b>${build['!Last.build.timestamp']}</b>
  <a href='javascript:void()'
        onmouseover="return overlib('A given build may not refresh all project components. ' + 
        'For example, a \'ApiCommonData/Model install\' does not build any WDK code.<br>' +
        'See Build Details for a cummulative record of past builds.')"
        onmouseout = "return nd();"><sup>[?]</sup></a>

  <br>

  <b><a href="#" 
        onclick="Effect.toggle('buildtime','blind'); return false">
  Component Build Details &#8593;&#8595;</a></b>

  <div id="buildtime" style="padding: 5px; display: none"><div>
  <font size='-1'>A given build may not refresh all project components.<br>
  The following is a cummulative record of past builds.</font>
  
      <table border='1' cellspacing='0'>
      <c:forEach items="${build}" var="p">
      <c:if test="${fn:contains(p.key, '.buildtime')}">
      <tr>
        <td><pre>${p.key}</pre></td>
        <td><pre>${p.value}</pre></td>
      </tr>
      </c:if>
      </c:forEach>
      </table>
  
  </div></div>

  <p>

  <b><a href="#" onclick="Effect.toggle('svnstate','blind'); return false">
  Svn Working Directory State &#8593;&#8595;</a></b>
  <div id="svnstate" style="padding: 5px; display: none"><div>
  <font size='-1'>State at build time. Uncommitted files are highlighted. Files may have been committed
  since this state was recorded.</font>
  
      <table border='1' cellspacing='0'>
      <c:forEach items="${build}" var="p">
      <c:if test="${fn:contains(p.key, '.svn.') && p.value != '' }">
          <c:if test="${fn:contains(p.key, '.svn.status')}">
            <c:set var="bgcolor" value="bgcolor='#FFFF99'"/>
          </c:if> 
      <tr ${bgcolor}>
        <td><pre>${p.key}</pre></td>
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
public String uptime() {
  try {
    String result;
    Vector commands=new Vector();
    commands.add("/bin/bash");
    commands.add("-c");
    commands.add("ps -o etime $PPID | grep -v ELAPSED | sed 's/\\s*//g' | sed 's/\\(.*\\)-\\(.*\\):\\(.*\\):\\(.*\\)/\\1d \\2h/; s/\\(.*\\):\\(.*\\):\\(.*\\)/\\1h \\2m/; s/\\(.*\\):\\(.*\\)/\\1m \\2s/'");
    
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
    return "Error: " + e;
  }
}
%>



<%!
public String lastReload(ServletContext application, PageContext pageContext) {
  try {
   File jspFile = (File)application.getAttribute("javax.servlet.context.tempdir");
   java.text.DateFormat formatter = new java.text.SimpleDateFormat( 
                        (String)pageContext.getAttribute("dateFormatStr") );

   return (String)formatter.format(new Date(jspFile.lastModified()));
  } catch (Exception e) {
    return "Error: " + e;
  }
}
%>

</c:otherwise>
</c:choose>
