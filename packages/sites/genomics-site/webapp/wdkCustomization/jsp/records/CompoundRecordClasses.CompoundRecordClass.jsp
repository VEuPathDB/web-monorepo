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
<c:set var="source_id" value="${pkValues['source_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['source_id']}"/>
</c:catch>


<imp:pageFrame  title="${recordType} : ${source_id}"
             divisionName="PubChem Compound Record"
             refer="recordPage"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${source_id}' was not found.</h2>
</c:when>
<c:otherwise>

<!-- Overview -->
<c:set var="attr" value="${attrs['overview']}" />
<imp:panel attribute="${attr.name}" 
    displayName="${attr.displayName}" 
    content="${attr.value}" />

<!-- image-->
<table border="0" class="paneltoggle"  
       bgcolor="#DDDDDD" 
       cellpadding="0" 
       cellspacing="1" 
       width="100%">
<tr><td style="padding:3px;"><font size="-2" face="Arial,Helvetica">
    <b>2D Structure</b></font></td></tr></table>
<table border="0" 
       cellpadding="5" 
       width="100%" 
       bgcolor="#FFFFFF">
<td></td>
<td>
 <img src="http://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?t=l&cid=${attrs['compound_id']}&width=100&height=100"/>
</td>
</tr>
</table>

<imp:wdkTable tblName="Properties" isOpen="true" attribution=""/>

<imp:wdkTable tblName="SubstanceProps" isOpen="true" attribution=""/>

<imp:wdkTable tblName="CompoundsMetabolicPathways" isOpen="true" attribution=""/>

<imp:wdkTable tblName="RelatedCompounds" isOpen="true" attribution=""/>

<imp:profileGraphs type='compound' tableName="MassSpecGraphs"/>


</c:otherwise>
</c:choose>
  <c:set var="reference">
<br> Compounds were procured from the <a href="http://pubchem.ncbi.nlm.nih.gov/">PubChem Compound Database</a> and associations were identified with KEGG Metabolic Pathways.<br>
     Compounds were associated to genes via their interactions with enzymes in pathways (EC Numbers).<br><br>
Graphs for the compounds were provided by <a href="http://www.molbio1.princeton.edu/labs/llinas/">Llinas lab</a><br>
  </c:set>
<br>
<br>

<imp:panel 
    displayName="PubChem Compounds and Graphs"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>

</imp:pageFrame>

