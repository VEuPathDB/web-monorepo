<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<%--
<c:set var="ACPT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto') || fn:containsIgnoreCase(modelName, 'api')    }"     />
--%>
<c:set var="API" value="${ fn:containsIgnoreCase(modelName, 'api')    }"     />
<c:set var="COMPONENT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto')    }"     />

<%--------------------------------------------------------------------%>

<%-- the cellspacing is what allows for separation between Genomic and SNP (EST and ORF) titles --%>
<table width="100%" border="0" cellspacing="3" cellpadding="0">


<c:if test="${API}">
<tr><td colspan="3">  
    <div class="smallBlack" align="middle">
	<b>Query Availability in Organism Specific Sites:</b> &nbsp;&nbsp; &nbsp;
	<img src='<c:url value="/images/cryptodb_letter.gif" />' border='0' alt='cryptodb' /> = CryptoDB &nbsp;&nbsp;
	<img src='<c:url value="/images/plasmodb_letter.gif" />' border='0' alt='plasmodb' /> = PlasmoDB &nbsp;&nbsp;
	<img src='<c:url value="/images/toxodb_letter.jpg" />' border='0' alt='toxodb' /> = ToxoDB &nbsp; &nbsp;
	</div>
</td></tr>
</c:if>

<c:if test="${COMPONENT}">
<tr><td colspan="3">  
    <div class="smallBlack" align="middle">
	<b>Query Availability: </b> &nbsp; click on &nbsp; 
	<img src='<c:url value="/images/apidb_letter.gif" />' border='0' alt='apidb'/> &nbsp; to access a query in <b><a href="http://apidb.org">ApiDB.org</a></b>
	</div>
</td></tr>
</c:if>


<%--  All Gene Queries  --%>
<tr class="headerRow"><td colspan="4" align="center"><b>Identify Genes by:</b></td></tr>

<tr><td colspan="3" align="center">
 	<site:quickSearch/>
</td></tr>

<tr><td colspan="3" align="center">
	<site:queryGridGenes/>
</td></tr>


<%--  Isolates  --%>

<c:if test = "${project == 'CryptoDB' || project == 'ApiDB'}">
  <tr class="headerRow"><td colspan="4" align="center"><b>Identify Isolates by:</b></td></tr>
  <tr><td colspan="3" align="center">
	<site:queryGridIsolates/> 
  </td></tr>
</c:if>


<%--  All Genomic and SNP  --%>
<tr>
    <%-- All Genomic Sequences (CONTIG) Queries TABLE  --%>
    <td valign="top">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerRow">
			<td  valign="top" align="center"><b>Identify Genomic Sequences by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridContigs/>
		</td></tr>	
	</table> 
    </td>

    <%--  All SNP Queries TABLE --%>
    <td valign="top">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerRow">
			<td  valign="top" align="center"><b>Identify SNPs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSNPs/>
		</td></tr>
   	</table> 
    </td>
</tr>

<%--  All EST and ORF --%>
<tr>
    <%-- All EST Queries TABLE  --%>
    <td valign="top">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerRow">
			<td  valign="top" align="center"><b>Identify ESTs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridESTs/>
		</td></tr>	
	</table> 
    </td>

    <%--  All ORF Queries TABLE --%>
    <td valign="top">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerRow">
			<td  valign="top" align="center"><b>Identify ORFs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridORFs/>
		</td></tr>
   	</table> 
    </td>
</tr>



</table>
