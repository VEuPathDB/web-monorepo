<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>


<site:header title="${wdkModel.displayName} : SNP ${id}"
             banner="SNP ${id}"
             divisionName="SNP Record"
             division="queries_tools"/>

<%----c:set value="${wdkRecord.recordClass.type}" var="recordType"/----%>


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

<wdk:wdkTable tblName="Providers_other_SNPs" isOpen="true"/>

</td></tr>
</table>

<site:footer/>
