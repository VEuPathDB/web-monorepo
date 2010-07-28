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
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<site:header title="${wdkModel.displayName} : EST ${id}"
             divisionName="EST Record"
             refer="recordPage"
             division="queries_tools"/>


<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${recordType} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<br/>

<%-- quick tool-box for the record --%>
<site:recordToolbox />

<h2>
<center>
<wdk:recordPageBasketIcon />
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

<wdk:wdkTable tblName="AlignmentInfo" isOpen="false" attribution=""/>

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

<c:if test="${projectId != 'TrichDB' && projectId != 'CryptoDB'}">
  <wdk:wdkTable tblName="AssemblyInfo" isOpen="true" attribution=""/>
</c:if>

<br>
<%-- REFERENCE ----------------------------------------------------%>
<wdk:wdkTable tblName="ReferenceInfo" isOpen="true" attribution=""/>

<br>
<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<site:footer/>
