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
<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>
<c:set var="pathwayImageId" value="${attrs['image_id'].value}" />
<c:set var="pathwayName" value="${attrs['description'].value}" />

<imp:pageFrame title="${wdkModel.displayName} : Met Pathway ${id}"
             refer="recordPage"
             banner="Met Pathway ${id}"
             divisionName="${recordName} Record"
             division="queries_tools">

<c:choose>
  <c:when test="${!wdkRecord.validRecord}">
    <h2 style="text-align:center;color:#CC0000;">The ${recordName} '${id}' was not found.</h2>
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
<%--
<br>
<div align="center">
<img align="middle" src="/cgi-bin/colorKEGGmap.pl?model=${projectId}&pathway=${id}" usemap="#pathwayMap"/>
<imp:pathwayMap projectId="${projectId}" pathway="${id}" />
</div>
<br>
--%>
<iframe  src="<c:url value='/pathway-dynamic-view.jsp?model=${projectId}&pathway=${id}' />"  width=100% height=800 align=middle>
</iframe> 

<%-- Reaction Table ------------------------------------------------%>
  <imp:wdkTable tblName="CompoundsMetabolicPathways" isOpen="true"/>

</c:otherwise>
</c:choose>


  <c:set var="reference">
 <br>Data for Metabolic Pathways were procured from the <a href="http://www.kegg.jp/">Kyoto Encyclopedia of Genes and Genomes (KEGG)</a>.<br>
 This data was mapped to EC Numbers obtained from <a href="<c:url value='/getDataset.do?display=detail#Genomes and Annotation'/>">the official genome annotations of organisms</a>, and Compounds from the NCBI repository.<br>
 The images and maps for KEGG pathways are copyright of <a href="http://www.kanehisa.jp/">Kanehisa Laboratories</a>.
Coloring of the KEGG maps was performed in house with custom scripts and annotation information.<br>
  </c:set>
<br>
<br>

<imp:panel 
    displayName="Data Source"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>

<hr>


</imp:pageFrame>

