<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${id}"
             divisionName="Organism Record"
             refer="recordPage"
             division="queries_tools">

<br/>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	${projectId} Organism
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<imp:recordPageBasketIcon />
</div>

<%------------------------------------------------------------------%>

<c:set var="attr" value="${attrs['overview']}"/>
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}"
    attribute="${attr.name}" />
<br>


<imp:wdkTable tblName="Metrics" isOpen="true"/>

<%------------------------------------------------------------------%>




</imp:pageFrame>
