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

<site:header title="${wdkModel.displayName} : SNP ${id}"
             banner="SNP ${id}"
             divisionName="SNP Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The SNP '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<%-- quick tool-box for the record --%>
<site:recordToolbox />

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white
       class=thinTopBorders>
 <tr>
  <td bgcolor=white valign=top>



<table width="90%" align="center" cellspacing="5">
<tr><td>

<!-- Overview -->
<c:set var="attr" value="${attrs['snp_overview']}" />
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />

<!-- Gene context -->
<c:set var="attr" value="${attrs['gene_context']}" />
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />


<wdk:wdkTable tblName="Strains" isOpen="true"/>

</td></tr>
</table>

</c:otherwise>
</c:choose>

<site:footer/>
