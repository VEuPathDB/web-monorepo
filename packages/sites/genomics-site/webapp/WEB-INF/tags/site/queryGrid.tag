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

<tr><td colspan="3">  
    <div class="smallBlack" align="center">
	(Click on &nbsp; 
	<img src="/assets/images/eupathdb_letter.gif" border='0' alt='eupathdb'/> &nbsp; to access a search in <b><a href="http://eupathdb.org">EuPathDB.org</a></b>)
	</div>
</td></tr>


<%-----------------------------------------------------------------------------%>
<%--  All Gene Queries  --%>
<tr class="headerrow2"><td colspan="4" align="center"><b>Identify Genes by:</b></td></tr>

<tr><td colspan="3" align="center">
	<site:queryGridGenes/>
</td></tr>

<%-----------------------------------------------------------------------------%>
<%--  Isolates  --%>


  <tr class="headerrow2"><td colspan="4" align="center"><b>Identify Isolates by:</b></td></tr>
  <tr><td colspan="3" align="center">
	<site:queryGridIsolates/> 
  </td></tr>


<%-----------------------------------------------------------------------------%>
<%--  All Genomic and SNP  --%>
<tr>
    <%-- All Genomic Sequences (CONTIG) Queries TABLE  --%>
    <td >     
<div class="innertube2">
	<table width="100%" border="0" cellspacing="10" cellpadding="10"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify Genomic Sequences by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridContigs/>
		</td></tr>	
	</table> 
</div>
    </td>

    <%--  All Genomic Segments Queries TABLE --%>
    <td > 
<div class="innertube2">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify Genomic Segments by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSegms/>
		</td></tr>
   	</table> 
</div>
    </td>
</tr>

<%-----------------------------------------------------------------------------%>
<%--  All EST and EST Assemblies --%>
<tr>
    <%-- All EST Queries TABLE  --%>
    <td >     
<div class="innertube2"> 
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify ESTs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridESTs/>
		</td></tr>	
	</table> 
</div>
</div>
    </td>

    <%--  All SNP Queries TABLE --%>
    <td >    
<div class="innertube2"> 
	<table width="100%" border="0" cellspacing="10" cellpadding="10"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify SNPs by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSNPs/>
		</td></tr>
   	</table> 
</div>
    </td>


</tr>


<%-----------------------------------------------------------------------------%>
<%--  All Sage Tags and ORF --%>
<tr>
    <%-- All SageTags Queries TABLE  --%>
    <td > 
<div class="innertube2">     
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify Sage Tag Alignments by:</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridSage/>
		</td></tr>	
	</table>
</div> 
    </td>

    <%--  All ORF Queries TABLE --%>
    <td >   
<div class="innertube2">   
	<table width="100%" border="0" cellspacing="0" cellpadding="0"> 
		<tr class="headerrow2">
			<td   align="center"><b>Identify ORFs by:</b></td>
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
