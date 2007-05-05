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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<%/* display page header with recordClass type in banner */%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var="dateFormatStr" value="EEE dd MMM yyyy h:mm:ss a"/>

<html>
<head>
<title>${pageContext.request.serverName} Site Info</title>
<script type='text/javascript' src='/js/prototype.js'></script>
<script type='text/javascript' src='/js/scriptaculous.js'></script>
<%-- http://wiki.script.aculo.us/scriptaculous/show/Effect.toggle --%>

<script type="text/javascript">

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


-->
</style>

</head>

<body>

<h3 align='center'><a href='/'>${pageContext.request.serverName}</a></h3>

<fmt:formatDate type="both" pattern="${dateFormatStr}" value="<%=new java.util.Date()%>" />



<h2>Database</h2>

<p>
<b>Oracle instance</b>: ${fn:toLowerCase(wdkRecord.attributes['global_name'].value)}</b><br>
<b>Login name</b>: ${fn:toLowerCase(wdkRecord.attributes['login'].value)}</b><br>
<b>Hosted on</b>: ${wdkRecord.attributes['host_name'].value} (${wdkRecord.attributes['address'].value})<br>
<b>Oracle Version</b>: ${wdkRecord.attributes['version'].value}<br>

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

<h2>WDK</h2>

<c:if test="${!empty wdkRecord.recordClass.attributeFields['userlink']}">
<b>DB Link to User login, registration and comments Database:</b><br>   
<c:catch var="e">
        ${wdkRecord.attributes['userlink'].value}
    </c:catch>
    <c:if test="${e!=null}">
${e}<br>
        <font color="#CC0033">not responding</font>
    </c:if>
</c:if>


<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <b>Cache Tables:</b> ${wdkRecord.attributes['cache_count'].value}
</c:if>

<h2>Tomcat</h2>
<p>
<b>Web App</b>: ${pageContext.request.contextPath}<br>
<b>Last webapp reload</b>:

<%
try {
java.io.File jspFile = (java.io.File)application.getAttribute("javax.servlet.context.tempdir");
java.text.DateFormat formatter = new java.text.SimpleDateFormat( (String)pageContext.getAttribute("dateFormatStr")  );

out.println(formatter.format(new java.util.Date(jspFile.lastModified())));
} catch (Exception e) {
    out.println("Error: " + e);
}
%>

<p>
<b><a href="#" onclick="Effect.toggle('element-blind','blind'); return false">JSP Classpath</a></b>
<div id="element-blind" style="padding: 5px; display: none"><div>
${fn:replace(applicationScope['org.apache.catalina.jsp_classpath'], ':', '<br>')}
</div></div>
</p>

</body>
</html>

