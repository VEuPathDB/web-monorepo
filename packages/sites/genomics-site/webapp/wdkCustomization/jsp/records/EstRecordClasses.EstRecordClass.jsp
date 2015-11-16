<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />

<!-----------  SET ISVALIDRECORD  ----------------------------------->
<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['source_id']}"/>
</c:catch>

<imp:pageFrame title="${wdkModel.displayName} : EST ${id}"
             divisionName="EST Record"
             refer="recordPage"
             division="queries_tools">


<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${recordName} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<br/>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	EST
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<imp:recordPageBasketIcon />
</div>

<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}" />
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" 
    attribute="${attr.name}"/>

<br>
<%------------------------------------------------------------------%>

<imp:wdkTable tblName="AlignmentInfo" isOpen="false"/>

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
<imp:panel 
    displayName="${attr.displayName}"
    content="${seq}" />

<br>
<%-- REFERENCE ----------------------------------------------------%>
<imp:wdkTable tblName="ReferenceInfo" isOpen="true"/>

<br>
<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%--  if wdkRecord.attributes['organism'].value --%>

</imp:pageFrame>
