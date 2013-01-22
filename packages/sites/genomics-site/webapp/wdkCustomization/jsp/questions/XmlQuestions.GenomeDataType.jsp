<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>

<imp:pageFrame  title="${project} :: Genomes & Data Types"
                 banner="${project} Genomes & Data Types"
                 parentDivision="${project}"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="genomeDataType">



<!--    <c:set var="ncbiTaxPage1" value="http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id="/>  -->
<c:set var="ncbiTaxPage1" value="http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id="/>
<c:set var="ncbiTaxPage2" value="&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock"/>

<c:choose>
<c:when test="${project eq 'FungiDB'}" >
	<c:set var="siteTitle" value="FungiDB"/>
</c:when>
<c:otherwise>
	<c:set var="siteTitle" value="EuPathDB"/>
</c:otherwise>
</c:choose>


<script type="text/javascript">	
$(document).ready( function() {
  var oTable = $('#data-summary').dataTable({
    // "bJQueryUI": true, //this adds the sorting icons
    "bPaginate": false,
    // "aaSorting": [[ 0, 'asc']] 
    "aoColumnDefs": [
      { "asSorting" : ["asc", "asc"], "aTargets" : [ 0, 1] },
      { "sType" : "numeric", "aTargets" : [ 7, 8 ] }
    ],
    "oLanguage": {
      "sZeroRecords": "There are no organisms that include your keyword in this table.",
      "sSearch": "Enter keyword to filter rows:</>"
    }
  });
  new FixedHeader( oTable );
} );
</script>



<%------------------------------------%>
<table width="100%">

<tr><td width="35%"><h2>${siteTitle} Genomes and Data Types</h2></td>
    <td  width="15%"><a  title="Download the summary table in an XML file" href="<c:url value="/eupathGenomeXml.jsp"/>"><b>(XML)</b></td>
    <td align="right"><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">${siteTitle} Gene Metrics >>></a></td>
</tr>

<tr><td colspan="3">

<c:choose>
<c:when test="${project eq 'FungiDB'}" >

FungiDB is an integrated genomic and functional genomic database for the kingdom Fungi. In its 2.1 version (released in October 2012), FungiDB contains the genomes of <b>33 Fungi and 6 Oomycetes</b> (see below). FungiDB integrates whole genome sequence and annotation and will expand to include experimental data and environmental isolate sequences provided by the community of researchers. The database includes comparative genomics, analysis of gene expression, and supplemental bioinformatics analyses and a web interface for data-mining.


</c:when>
<c:otherwise>

The EuPathDB <a href="http://pathogenportal.org"><b>Bioinformatics Resource Center (BRC)</b></a> designs, develops and maintains the <a href="http://eupathdb.org">EuPathDB</a>, <a href="http://amoebadb.org">AmoebaDB</a>, <a href="http://cryptodb.org">CryptoDB</a>, <a href="http://giardiadb.org">GiardiaDB</a>, <a href="http://microsporidiadb.org">MicrosporidiaDB</a>, <a href="http://piroplasmadb.org">PiroplasmaDB</a>, <a href="http://plasmodb.org">PlasmoDB</a>, <a href="http://toxodb.org">ToxoDB</a>, <a href="http://trichdb.org">TrichDB</a> (currently unsupported) and <a href="http://tritrypdb.org">TriTrypDB</a> (supported by the Bill and Melinda Gates Foundation) websites.

</c:otherwise>
</c:choose>

<br><br>
<i style="color:#b45f04">(Please mouse over links for details; click on red dots <img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"> to access dataset information.)</i><br>
</td>
</tr>
</table>
<br>
<%------------------------------- TABLE ----------------------------------------%>
<!--  <div style="overflow-x:auto;overflow-y:hidden">  -->
<table class="mytableStyle" id="data-summary" width="100%">
<thead>
<!--
<tr>
<th>Website</th>
<th>Genus</th>
<th>Species</th>
<th>Strain</th>
<th>Taxon ID</th>
<th>Data<br>Source</th>
<th>Genome<br>Version</th>
<th>Available<br>Megabase Pairs</th>
<th>Gene<br>Count</th>
<th>Organ<br>ellar</th>
<th>Isol<br>ates</th>
<th>SNPs</th>
<th>ChIP<br>chip</th>
<th>ESTs</th>
<th>Micro<br>array</th>
<th>RNA<br>Seq</th>
<th>RT-<br>PCR</th>
<th>SAGE<br>Tags</th>
<th>Prote<br>omics</th>
<th>Path<br>ways</th>
-->


<tr class="mythStyle">
<c:choose>
<c:when test="${project eq 'FungiDB'}" >
    <th width="7%" class="mythStyle">Family</td>
</c:when>
<c:otherwise>
    <th width="7%" class="mythStyle">Website</td>
</c:otherwise>
</c:choose>

    <th class="mythStyle" title="Genus">Genus</th>
    <th class="mythStyle" title="Species">Species</th>
    <th class="mythStyle" title="Strain">Strain</th>
    <th class="mythStyle" title="Click to access this Taxon ID in NCBI">Taxon ID</th>
    <th class="mythStyle" title="Data Source">Data<br>Source</th>
    <th class="mythStyle" title="Click to access genome details in our Data Sources page">Genome<br>Version</th>
    <th class="mythStyle" title="Size in Mega bases; click to run a search and get all genomic sequences for this genome">Available<br>Megabase Pairs</th>
    <th class="mythStyle" title="Gene Count; click to run a search and get all genes annotated in this genome">Gene<br>Count</th>
    <th class="mythStyle" title="Mouseover the red dot to read the organellar genomes we have, if different">Organ<br>ellar</th>

    <th class="mythStyle" title="Isolates">Isol<br>ates</th>
    <th class="mythStyle" title="Single Nucleotide Polymorphisms">SNPs</th>
    <th class="mythStyle" title="ChIP Chip">ChIP<br>chip</th>
    <th class="mythStyle" title="Chip Seq">Chip<br>Seq</th>
    <th class="mythStyle" title="Expressed Sequence Tags">ESTs</th>
    <th class="mythStyle" title="Microarray">Micro<br>array</th>
    <th class="mythStyle" title="RNA Seq">RNA<br>Seq</th>
    <th class="mythStyle" title="RT PCR">RT-<br>PCR</th>
    <th class="mythStyle" title="Sage Tags">SAGE<br>Tags</th>
    <th class="mythStyle" title="Proteomics">Prote<br>omics</th>
    <th class="mythStyle" title="Metabolic Pathways">Path<br>ways</th>


</tr>
</thead>
<tbody>
<!-- LOOP -->
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
<c:set var="genomelink_message" value=""/>



<c:set var="fastaLink" value="${record.attributesMap['URLGenomeFasta']}"/>
<c:set var="gffLink" value="${record.attributesMap['URLgff']}"/>

<c:set var="genus" value="${record.attributesMap['Genus']}"/>
<c:set var="species" value="${record.attributesMap['Species']}"/>
<c:set var="strain" value="${record.attributesMap['Strain']}"/>
<c:set var="org_genomes" value="${record.attributesMap['Organellar_Genomes']}"/>

<c:set var="website" value="${record.attributesMap['Website']}"/>


<tr class="mytdStyle">

<c:choose>
<c:when test="${curWebsite != website}" >
	<c:set var="samesite" value=""/>
        <c:set var="curWebsite" value="${website}"/>
        <c:set var="separation" value="border-top:3px solid grey"/>
</c:when>
<c:otherwise>
	<c:set var="samesite" value="yes"/>
	<c:set var="separation" value=""/>
</c:otherwise>
</c:choose>

<td class="mytdStyle" style="${separation}">${website}</td> 



<!-- website/webapp for links to data sources -->
<c:set var="website" value="${fn:toLowerCase(website)}"/>
<c:set var="project" value="${fn:toLowerCase(project)}"/>

<c:choose>
<c:when test="${website eq 'amoebadb' || website eq 'plasmodb' || website eq 'toxodb'}" >
        <c:set var="webapp" value="${fn:substringBefore(website, 'db')}"/>
</c:when>
<c:when test="${website eq 'microsporidiadb'}" >
        <c:set var="webapp" value="micro"/>
</c:when>
<c:when test="${website eq 'piroplasmadb'}" >
        <c:set var="webapp" value="piro"/>
</c:when>
<c:otherwise>
        <c:set var="webapp" value="${website}"/>
</c:otherwise>
</c:choose>

<!-- if we are in FungiDB, website is really a family of organisms, we need to use project instead -->
<c:if test="${project eq fn:containsIgnoreCase(modelName, 'FungiDB')}" >
	<c:set var="website" value="fungidb"/>
	<c:set var="webapp" value="fungidb"/>
</c:if>

<!-- ORGANISM and link to NCBI -->
    <td class="mytdStyle"  style="${separation};border-left:1px solid grey;border-bottom:none">		<i>${genus}</i></td>
    <td class="mytdStyle" style="${separation}">							<i>${species}</i></td>
    <td class="mytdStyle" style="${separation}">							<i>${strain}</i></td>
    <td class="mytdStyle" style="${separation}" title="Click to access this Taxon ID in NCBI">
	<a href="${ncbiTaxPage1}${record.attributesMap['Taxon_ID']}${ncbiTaxPage2}">			${record.attributesMap['Taxon_ID']}</a></td>
	
<!-- DATA SOURCE, VERSION:  link to component site -->
    <td class="mytdStyle" style="${separation}">							${record.attributesMap['Data_Source']}</td>
    <td class="mytdStyle" style="${separation}" title="Click to access genome details in our Data Sources page">
        <a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		${record.attributesMap['Genome_Version']}</a></td>

<c:if test="${project ne website}" >
	<c:set var="genomelink_message" value="Notice that you will be moved to ${website}.org"/>
</c:if>

<!-- FILE SIZES -->
    <td class="mytdStyle" style="text-align:right;${separation}" title="Size in Mega bases; click to run a search and get all genomic sequences for this genome. ${genomelink_message}">
	<a href="http://${website}.org/${webapp}/showSummary.do?questionFullName=GenomicSequenceQuestions.SequencesByTaxon&array(organism)=${genus}%20${species}%20${strain}"> 
<!--  <a href="${fastaLink}"> -->
							${record.attributesMap['Genome_Size']}</a></td>
    <td class="mytdStyle" style="text-align:right;${separation}" title="Gene Count; click to run a search and get all genes annotated in this genome">
	<c:if test='${not empty gffLink}'>
		<a href="http://${website}.org/${webapp}/showSummary.do?questionFullName=GeneQuestions.GenesByTaxon&array(organism)=${genus}%20${species}%20${strain}">	
	</c:if>
							${record.attributesMap['Gene_Count']}</td>

<!-- ORGANELLAR -->
<c:choose>
<c:when test="${not empty record.attributesMap['Organellar_Genomes']}">
     <td class="mytdStyle" style="${separation}" title="${org_genomes}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>


<c:choose>
<c:when test="${record.attributesMap['Isolates'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>


<c:choose>
<c:when test="${record.attributesMap['SNPs'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ChIP_chip'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Chip_Seq'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ESTs'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">

  <c:choose>
  <c:when test="${website == 'eupathdb'}">
        <a href="/common/downloads/">
  </c:when> 
  <c:otherwise>
        <a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
  </c:otherwise>
  </c:choose>
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a>
    </td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Microarray'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>


<c:choose>
<c:when test="${record.attributesMap['RNA_Seq'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>


<c:choose>
<c:when test="${record.attributesMap['RT_PCR'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>


<c:choose>
<c:when test="${record.attributesMap['SageTags'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Proteomics'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Pathways'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/getDataset.do?display=detail">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

</tr>
</c:forEach>


</tbody>
</table>
<!--  </div> -->
<%------------------------------- END OF TABLE ----------------------------------------%>

<table width="100%">

<tr><td><br></td></tr>

<c:if test="${project ne fn:containsIgnoreCase(modelName, 'FungiDB') }" >
	<tr><td colspan="10"><font size="-2">
		<hr>* <i>G. lamblia</i> has 3766 deprecated genes that are not included in the official gene count.</font></td></tr>
</c:if>

</table>


</imp:pageFrame>
