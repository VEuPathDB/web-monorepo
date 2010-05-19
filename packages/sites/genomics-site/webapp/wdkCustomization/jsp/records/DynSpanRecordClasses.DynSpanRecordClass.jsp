<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<site:header title="${wdkModel.displayName} : DynSpan ${id}"
             banner="DynSpan ${id}"
             divisionName="DynSpan Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The DynSpan '${id}' was not found.</h2>
</c:when>
<c:otherwise>


<%-- download box  and title  ----%>
<site:recordToolbox />
<h2><center>${id}</center></h2>
<br><br>

<!-- Overview -->
<c:set var="attr" value="${attrs['overview']}" />
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />

<br><br>
<!-- SRT -->
<c:set var="attr" value="${attrs['otherInfo']}" />
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />

<br>
<wdk:wdkTable tblName="Genes" isOpen="true"
                 attribution=""/>

<br>
<wdk:wdkTable tblName="Orfs" isOpen="true"
                 attribution=""/>

<br>
<wdk:wdkTable tblName="SNPs" isOpen="true"
                 attribution=""/>

<br>
<wdk:wdkTable tblName="SageTags" isOpen="true"
                 attribution=""/>

</c:otherwise>
</c:choose>

<site:footer/>
