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

<c:set var="PORTAL" value="${ fn:containsIgnoreCase(modelName, 'eupath')    }"     />
<c:set var="COMPONENT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto') || fn:containsIgnoreCase(modelName, 'giardia') || fn:containsIgnoreCase(modelName, 'trich')   || fn:containsIgnoreCase(modelName, 'tritryp')  }"     />


<%--------------------------------------------------------------------%>
<%-- these divs are needed because they do NOT come from header.... problem associated with having a sidebar --%>

<c:if test="${from != 'tab'}">
<div id="contentwrapper">
  <div id="contentcolumn">
	<div class="innertube">
</c:if>


<%-- QUERIES --%>
<%-- the cellspacing is what allows for separation between Genomic and SNP (EST and ORF) titles --%>
<%-- with new UI design the cellspacing/cellpdding of the table seems useless, innertube2 class provdes the padding --%>

<div style="padding-top:5px;" class="h3center">
	Select a search, which will be the first step in you new strategy.
</div>


<table id="queryGrid" width="100%" border="0" cellspacing="0" cellpadding="0">

<c:if test="${PORTAL}">
<tr><td colspan="3">  
    <div class="smallBlack" align="center">
	<b>Search Availability in Organism Specific Sites:</b> &nbsp;&nbsp; &nbsp;
	<img src="/assets/images/A_letter.gif" border='0' alt='amoeba' width="10" height="10"/> = AmoebaDB &nbsp;&nbsp;
	<img src="/assets/images/cryptodb_letter.gif" border='0' alt='crypto' /> = CryptoDB &nbsp;&nbsp;
	<img src="/assets/images/giardiadb_letter.gif" border='0' alt='giardia' /> = GiardiaDB &nbsp; &nbsp;
	<img src="/assets/images/M_letter.gif" border='0' alt='micro'  width="10" height="10"/> = MicrosporidiaDB &nbsp; &nbsp;
	<img src="/assets/images/plasmodb_letter.gif" border='0' alt='plasmo' /> = PlasmoDB &nbsp;&nbsp;
	<img src="/assets/images/toxodb_letter.gif" border='0' alt='toxo' /> = ToxoDB &nbsp; &nbsp;
	<img src="/assets/images/trichdb_letter.gif" border='0' alt='trich' /> = TrichDB &nbsp; &nbsp;
        <img src="/assets/images/tritrypdb_letter.gif" border='0' alt='Tt' /> = TriTrypDB &nbsp; &nbsp;
	</div>
</td></tr>
</c:if>

<c:if test="${COMPONENT}">
<tr><td colspan="3">  
    <div class="smallBlack" align="center">
	(Click on &nbsp; 
	<img src="/assets/images/eupathdb_letter.gif" border='0' alt='eupathdb'/> &nbsp; to access a search in <b><a href="http://eupathdb.org">EuPathDB.org</a></b>)
	</div>
</td></tr>
</c:if>

<%-----------------------------------------------------------------------------%>
<%--  All Gene Queries  --%>
<tr class="headerrow2"><td colspan="4" align="center"><b>Identify Genes by:</b></td></tr>

<tr><td colspan="3" align="center">
	<site:queryGridGenes/>
</td></tr>

<%-----------------------------------------------------------------------------%>
<%--  Isolates  --%>

<c:if test = "${project == 'CryptoDB' || project == 'EuPathDB' || project == 'PlasmoDB' || project == 'ToxoDB' || project == 'GiardiaDB'}">
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
			<td  valign="top" align="center"><b>Identify Transcript Assemblies by:</b></td>
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

<%-- these divs need to be closed because they do NOT come from header.... problem associated with having a sidebar --%>

<c:if test="${from != 'tab'}">
    </div>
  </div>
</div>
</c:if>
