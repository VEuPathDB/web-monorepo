<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<site:header title="${wdkRecord.primaryKey}"
             divisionName="Sage Tag Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null' || !wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${recordType} '${id}' was not found.</h2>
</c:when>
<c:otherwise>


<%-- quick tool-box for the record --%>
<site:recordToolbox />

<br>
<%--#############################################################--%>



<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />
<br>

<wdk:wdkTable tblName="AllCounts" isOpen="true" />
<br>

<wdk:wdkTable tblName="Genes" isOpen="true" />
<br>

<wdk:wdkTable tblName="Locations" isOpen="true" />

<br>


<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<site:footer/>
