<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="sName" value="${fn:substringBefore(modelName,'DB')}" />
<c:set var="cycName" value="${sName}Cyc" />
<c:set var="urlBase" value="${pageContext.request.contextPath}"/>

<div class="tools">
    	<ul> 
		<li><a href="${urlBase}/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"><strong>BLAST</strong></a>
			<ul><li style="border:0">Identify Sequence Similarities</li></ul>
		</li>
	 	<li><a href="${urlBase}/analysisTools.jsp"><strong>Results Analysis</strong></a>
			<ul><li  style="border:0">Analyze Your Strategy Results</li></ul>
		</li>
		<li><a href="${urlBase}/srt.jsp"><strong>Sequence Retrieval</strong></a>
			<ul><li  style="border:0">Retrieve Specific Sequences using IDs and coordinates</li></ul>
		</li>
<!--	  <li><a href="http://rnaseq.pathogenportal.org"><strong>Pathogen Portal</strong></a>
			<ul><li  style="border:0">RNA sequence analysis, interactome maps and more</li></ul>
		</li>  -->
    <li><a href="https://companion.sanger.ac.uk"><strong>Companion</strong></a>
		  <ul><li  style="border:0">Annotate your sequence and determine orthology, phylogeny & synteny</li></ul>
    </li>
    <li><a href="http://grna.ctegd.uga.edu"><strong>EuPaGDT</strong></a>
			<ul><li  style="border:0">Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool</li></ul>
		</li>
		<li><a href="/pubcrawler/${modelName}"><strong>PubMed and Entrez</strong></a>
			<ul><li  style="border:0">View the Latest Pubmed and Entrez Results</li></ul>
		</li>

<c:if test="${sName != 'EuPath'}">
		<li><a href="/cgi-bin/gbrowse/${fn:toLowerCase(modelName)}/"><strong>Genome Browser</strong></a>
			<ul><li  style="border:0">View Sequences and Features in the genome browser</li></ul>
		</li>
</c:if> 
    
        

<c:choose>   <%-- SITES WITH FEW TOOLS, SO THERE IS SPACE IN BUCKET FOR DESCRIPTIONS --%>
<c:when test="${sName != 'Plasmo'}">

	<c:choose>
	<c:when test="${sName == 'Crypto'}">
		<li><a href="${urlBase}/serviceList.jsp"><strong>Searches via Web Services</strong></a>
			<ul><li style="border:0">Learn about web service access to our data</li></ul>
		</li>
	</c:when>
	<c:when test="${sName == 'EuPath'}">
		<li><a href="${urlBase}/serviceList.jsp"><strong>Searches via Web Services</strong></a>
			<ul><li style="border:0">Learn about web service access to our data</li></ul>
		</li>
	</c:when>
	<c:when test="${sName == 'Toxo'}">
		<li><a href="http://ancillary.toxodb.org"><strong>Ancillary Genome Browse</strong></a>
                        <ul><li  style="border:0">Access Probeset data and <i>Toxoplasma</i> Array info</li></ul>
    </li>
		<li><p>
			<i>For additional tools, use the </i><b>Tools</b><i> menu in the gray toolbar above.....</i></p>
		</li>

	</c:when>
	<c:otherwise>   <%----- Giardia, Trich and TriTryp:  fill in 2 empty lines to keep buckets aligned -----%>

		<li><a href="${urlBase}/serviceList.jsp"><strong>Searches via Web Services</strong></a>
			<ul><li style="border:0">Learn about web service access to our data</li></ul>
		</li>
                <%-- <li>&nbsp;<ul><li  style="border:0">&nbsp;</li></ul></li> --%>

	</c:otherwise>
	</c:choose>

    	</ul>
</c:when>
<c:otherwise>   <%-- PLASMO: LOTS OF TOOLS, add descriptions as mouseovers --%>

  		<li><p><i>For additional tools, use the </i><b>Tools</b><i> menu in the gray toolbar above.....</i></p>
		</li>

	</ul>

</c:otherwise>
</c:choose>

</div>

