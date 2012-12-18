<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="recordType" value="${wdkRecord.recordClass.type}" />
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>
<c:set var="pathwayImageId" value="${attrs['image_id'].value}" />
<c:set var="pathwayName" value="${attrs['description'].value}" />

<imp:pageFrame title="${wdkModel.displayName} : Met Pathway ${id}"
             refer="recordPage"
             banner="Met Pathway ${id}"
             divisionName="${recordType} Record"
             division="queries_tools">

<c:choose>
  <c:when test="${!wdkRecord.validRecord}">
    <h2 style="text-align:center;color:#CC0000;">The ${recordType} '${id}' was not found.</h2>
  </c:when>
<c:otherwise>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />


<div class="h2center" style="font-size:160%">
 	Metabolic Pathway
</div>

<div class="h3center" style="font-size:130%">
	${id} -  ${pathwayName}<br>
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

<br>
<c:set var="popup" value="Active regions here"/>
<div align="center">
<img align="middle" src="/cgi-bin/colorKEGGmap.pl?model=${projectId}&pathway=${id}" usemap="#pathwayMap"/>
<imp:pathwayMap pathway="${id}" />
</div>
<br>



<%-- Reaction Table ------------------------------------------------%>
  <imp:wdkTable tblName="CompoundsMetabolicPathways" isOpen="true"/>

</c:otherwise>
</c:choose>

</imp:pageFrame>

