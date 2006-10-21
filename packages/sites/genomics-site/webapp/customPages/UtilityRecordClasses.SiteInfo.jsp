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

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<%/* display page header with recordClass type in banner */%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<html>
<head>
<title>${pageContext.request.serverName} Site Info</title>
</head>

<body>
<p>
<b>Oracle instance</b>: ${fn:toLowerCase(wdkRecord.attributes['global_name'].value)}</b><br>
<b>Login name</b>: ${fn:toLowerCase(wdkRecord.attributes['login'].value)}</b><br>
<b>Hosted on</b>: ${wdkRecord.attributes['host_name'].value} (${wdkRecord.attributes['address'].value})<br>
<b>Oracle Version</b>: ${wdkRecord.attributes['version'].value}<br>
<b>Date</b>: ${wdkRecord.attributes['system_date'].value}

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

<br>

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

<br>

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
</c:if>

<br><br>
(TEST1 --> DBC2<br>
TEST2 --> THEMIS<br>
TEST3 --> DBC1)<br>

<br>

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




</body>
</html>

