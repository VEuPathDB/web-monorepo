<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['compound_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['compound_id']}"/>
</c:catch>


<imp:pageFrame  title="${recordType} : ${id}"
             divisionName="PubChem Compound Record"
             refer="recordPage"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<!-- Overview -->
<c:set var="attr" value="${attrs['overview']}" />
<imp:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />



<imp:wdkTable tblName="Properties" isOpen="true"/>

<imp:wdkTable tblName="SubstanceProps" isOpen="true"/>

</c:otherwise>
</c:choose>

</imp:pageFrame>

