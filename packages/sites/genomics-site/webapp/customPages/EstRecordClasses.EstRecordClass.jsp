<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<site:header title="${wdkModel.displayName} : EST ${id}"
             divisionName="EST Record"
             division="queries_tools"/>


<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null' || !wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${recordType} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<br/>

<h2>
<center>
${id}
</center>
</h2>

<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />

<br>
<%------------------------------------------------------------------%>

<site:wdkTable tblName="AlignmentInfo" isOpen="false" attribution=""/>

<br>

<%-- EST SEQUENCE ------------------------------------------------%>
<c:set var="attr" value="${attrs['sequence']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font>
    </noindex>
</c:set>
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />

<!-- Assembly -->

<c:if test="${projectId != 'TrichDB'}">
  <site:wdkTable tblName="AssemblyInfo" isOpen="true" attribution=""/>
</c:if>

<br>
<%-- REFERENCE ----------------------------------------------------%>
<site:wdkTable tblName="ReferenceInfo" isOpen="true" attribution=""/>

<br>
<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<site:footer/>
