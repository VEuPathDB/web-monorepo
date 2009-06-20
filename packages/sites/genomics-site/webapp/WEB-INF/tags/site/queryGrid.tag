<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="from"
              description="jsp that calls this tag"
%>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="PORTAL" value="${ fn:containsIgnoreCase(modelName, 'api')    }"     />
<c:set var="COMPONENT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto') || fn:containsIgnoreCase(modelName, 'giardia') || fn:containsIgnoreCase(modelName, 'trich')   || fn:containsIgnoreCase(modelName, 'tritryp')  }"     />


<%--------------------------------------------------------------------%>
<%-- these divs are needed because they do NOT come from header.... problem associated with having a sidebar --%>

<c:if test="${from != 'tab'}">
<div id="contentwrapper">
  <div id="contentcolumn">
	<div class="innertube">
</c:if>

<%-- TOOLS --%>
<%--
	<p align="center"><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"><strong>BLAST</strong></a> &nbsp;|&nbsp;<a href="<c:url value="/srt.jsp"/>"><strong>Sequence Retrieval</strong></a> &nbsp;|&nbsp; <a href="/common/PubCrawler/"><strong>PubMed and Entrez</strong></a> &nbsp;|&nbsp; <a href="#"><strong>GBrowse</strong></a> &nbsp;|&nbsp; <a href="#"><strong>CryptoCyc</strong></a></p> <br>
--%>

<%-- QUERIES --%>
<%-- the cellspacing is what allows for separation between Genomic and SNP (EST and ORF) titles --%>
<%-- with new UI design the cellspacing/cellpdding of the table seems useless, innertube2 class provdes the padding --%>
<table width="100%" border="0" cellspacing="0" cellpadding="0">


<c:if test="${PORTAL}">
<tr><td colspan="3">  
    <div class="smallBlack" align="middle">
	<b>Query Availability in Organism Specific Sites:</b> &nbsp;&nbsp; &nbsp;
	<img src='<c:url value="/images/cryptodb_letter.gif" />' border='0' alt='crypto' /> = CryptoDB &nbsp;&nbsp;
	<img src='<c:url value="/images/giardiadb_letter.gif" />' border='0' alt='giardia' /> = GiardiaDB &nbsp; &nbsp;
	<img src='<c:url value="/images/plasmodb_letter.gif" />' border='0' alt='plasmo' /> = PlasmoDB &nbsp;&nbsp;
	<img src='<c:url value="/images/toxodb_letter.gif" />' border='0' alt='toxo' /> = ToxoDB &nbsp; &nbsp;
	<img src='<c:url value="/images/trichdb_letter.gif" />' border='0' alt='trich' /> = TrichDB &nbsp; &nbsp;
        <img src='<c:url value="/images/tritrypdb_letter.gif" />' border='0' alt='Tt' /> = TriTrypDB &nbsp; &nbsp;
	</div>
</td></tr>
</c:if>

<span style="position: relative;left:1.5em;" class="h3left">Select a search to start a new strategy
<c:if test="${from != 'tab'}">
 	or  click on "My Searches: " to enter your strategy workspace.</span>
</c:if>
<c:if test="${from == 'tab'}">
 	or  click on the "Run" or "Browse" tabs above, to access your strategies.</span>
</c:if>

<c:if test="${COMPONENT}">
<tr><td colspan="3">  
    <div class="smallBlack" align="middle">
	(Click on &nbsp; 
	<img src="/images/eupath_e.gif" border='0' alt='eupathdb'/> &nbsp; to access a query in <b><a href="http://eupathdb.org">EuPathDB.org</a></b>)
	</div>
</td></tr>
</c:if>

<%-----------------------------------------------------------------------------%>
<%--  All Gene Queries  --%>
<tr class="headerrow2"><td colspan="4" align="center"><b>Identify Genes by:</b></td></tr>

<%-- portal does not need currently these queries in front page (home) --%>
<c:if test="${COMPONENT || from != 'home'}">
<%--
<tr><td colspan="3" align="center">
 	<site:quickSearch/>
</td></tr>
--%>
</c:if>


<tr><td colspan="3" align="center">
	<site:queryGridGenes/>
</td></tr>

<%-----------------------------------------------------------------------------%>
<%--  Isolates  --%>

<c:if test = "${project == 'CryptoDB' || project == 'EuPathDB' || project == 'PlasmoDB' || project == 'ToxoDB'}">
  <tr class="headerrow2"><td colspan="4" align="center"><b>Identify Isolates by:</b></td></tr>
  <tr><td colspan="3" align="center">
	<site:queryGridIsolates/> 
  </td></tr>
</c:if>

<%-----------------------------------------------------------------------------%>
<%--  All Genomic and SNP  --%>
<tr>
    <%-- All Genomic Sequences (CONTIG) Queries TABLE  --%>
    <td valign="top">     
<div class="innertube2">
	<table width="100%" border="0" cellspacing="10" cellpadding="10"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify Genomic Sequences by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridContigs/>
		</td></tr>	
	</table> 
</div>
    </td>

    <%--  All SNP Queries TABLE --%>
    <td valign="top">    
<div class="innertube2"> 
	<table width="100%" border="0" cellspacing="10" cellpadding="10"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify SNPs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSNPs/>
		</td></tr>
   	</table> 
</div>
    </td>
</tr>

<%-----------------------------------------------------------------------------%>
<%--  All EST and EST Assemblies --%>
<tr>
    <%-- All EST Queries TABLE  --%>
    <td valign="top">     
<div class="innertube2"> 
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify ESTs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridESTs/>
		</td></tr>	
	</table> 
</div>
</div>
    </td>

    <%--  All EST Assemblies Queries TABLE --%>
    <td valign="top"> 
<div class="innertube2">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify EST Assemblies by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridAssem/>
		</td></tr>
   	</table> 
</div>
    </td>
</tr>


<%-----------------------------------------------------------------------------%>
<%--  All Sage Tags and ORF --%>
<tr>
    <%-- All SageTags Queries TABLE  --%>
    <td valign="top"> 
<div class="innertube2">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify Sage Tag Alignments by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSage/>
		</td></tr>	
	</table>
</div> 
    </td>

    <%--  All ORF Queries TABLE --%>
    <td valign="top">   
<div class="innertube2">   
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td  valign="top" align="center"><b>Identify ORFs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridORFs/>
		</td></tr>
   	</table> 
</div>
    </td>
</tr>


</table>


	</div>
  	</div>
</div>
