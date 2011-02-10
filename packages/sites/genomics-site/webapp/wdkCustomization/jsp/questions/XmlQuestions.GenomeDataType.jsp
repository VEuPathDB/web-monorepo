<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
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

<site:header  title="${project} :: Genomes & Data Types"
                 banner="${project} Genomes & Data Types"
                 parentDivision="${project}"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="genomeDataType"/>


<!--    <c:set var="ncbiTaxPage1" value="http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id="/>  -->
<c:set var="ncbiTaxPage1" value="http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id="/>
<c:set var="ncbiTaxPage2" value="&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock"/>


<%------------------------------------%>
<table width="100%">

<tr><td><h2>EuPathDB Genomes and Data Types</h2></td>
    <td align="right"><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">EuPathDB Gene Metrics >>></a></td>
</tr>

<tr><td colspan="2">The EuPathDB <a href="http://pathogenportal.org"><b>Bioinformatics Resource Center (BRC)</b></a> designs, develops and maintains the <a href="http://eupathdb.org">EuPathDB</a>, <a href="http://amoebadb.org">AmoebaDB</a>, <a href="http://cryptodb.org">CryptoDB</a>, <a href="http://giardiadb.org">GiardiaDB</a>, <a href="http://microsporidiadb.org">MicrosporidiaDB</a>, <a href="http://plasmodb.org">PlasmoDB</a>, <a href="http://toxodb.org">ToxoDB</a>, <a href="http://trichdb.org">TrichDB</a> (currently unsupported) and <a href="http://tritrypdb.org">TriTrypDB</a> (supported by the Bill and Melinda Gates Foundation) websites.<br><br>
<i>(Please mouse over organism names for the genus; mouse over column headers for details; click on red dots to access information on data sources.)</i><br>
</td>
</tr>
</table>

<%------------------------------------%>
<table class="mytableStyle" width="100%">
<tr class="mythStyle">
    <td width="7%" class="mythStyle" title="Website">Website</td>
    <td class="mythStyle" title="Species">Species</td>
    <td class="mythStyle" title="Click to access this Taxon ID in NCBI">Taxon ID</td>
    <td class="mythStyle" title="Strain">Strain</td>
    <td class="mythStyle" title="Provided by Data Source">Genome<br>Version</td>
    <td class="mythStyle" title="Data Source">Data<br>Source</td>
    <td class="mythStyle" title="Size in Mega bases">Available<br>Megabase Pairs</td>
    <td class="mythStyle" title="Gene Count">Gene<br>Count</td>
    <td class="mythStyle" title="For the species that we have multiple strains, the row represents the main strain. Please mouseover the red dot to read the additional strains we cover">Multiple<br>Strains</td>
 <%--   <td class="mythStyle" title="Additional Strains">Additional<br>Strains</td>    --%>
    <td class="mythStyle" title="Mouseover the red dot to read the organellar genomes">Organ<br>ellar</td>
    <td class="mythStyle" title="Isolates">Isol<br>ates</td>
    <td class="mythStyle" title="Single Nucleotide Polymorphisms">SNPs</td>
    <td class="mythStyle" title="Expressed Sequence Tags">ESTs</td>
    <td class="mythStyle" title="Microarray">Micro<br>array</td>
    <td class="mythStyle" title="Proteomics">Prote<br>omics</td>
    <td class="mythStyle" title="ChIP Chip">ChIP<br>chip</td>
    <td class="mythStyle" title="RNA Seq">RNA<br>Seq</td>
    <td class="mythStyle" title="Chip Seq">Chip<br>Seq</td>
    <td class="mythStyle" title="Sage Tags">SAGE<br>Tags</td>
    <td class="mythStyle" title="Metabolic Pathways">Path<br>ways</td>
</tr>

<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:set var="family" value="${record.attributesMap['Family']}"/>
<c:set var="website" value="${record.attributesMap['Website']}"/>
<c:set var="add_strains" value="${record.attributesMap['Additional_Strains']}"/>
<c:set var="org_genomes" value="${record.attributesMap['Organellar_Genomes']}"/>

<tr class="mytdStyle">
<c:choose>
<c:when test="${curWebsite != website}" >
        <c:set var="curWebsite" value="${website}"/>
        <c:set var="separation" value="border-top:3px solid grey"/>
	<td style="${separation}">${website}</td>
</c:when>
<c:otherwise>
	<c:set var="separation" value=""/>
	<td></td>
</c:otherwise>
</c:choose>

<!-- website/webapp for links to data sources -->
<c:set var="website" value="${fn:substringBefore(website, ',')}"/>
<c:if test="${empty website}" >
        <c:set var="website" value="EuPathDB"/>
</c:if>
<c:set var="website" value="${fn:toLowerCase(website)}"/>

<c:choose>
<c:when test="${website eq 'amoebadb' || website eq 'plasmodb' || website eq 'toxodb'}" >
        <c:set var="webapp" value="${fn:substringBefore(website, 'db')}"/>
</c:when>
<c:when test="${website eq 'microsporidiadb'}" >
        <c:set var="webapp" value="micro"/>
</c:when>
<c:otherwise>
        <c:set var="webapp" value="${website}"/>
</c:otherwise>
</c:choose>


    <td class="mytdStyle" style="text-align:left;${separation}" title="${family}, in ${website}"><i>${record.attributesMap['Organism']}</i></td>
    <td class="mytdStyle" style="${separation}" title="Click to access this Taxon ID in NCBI">
	<a href="${ncbiTaxPage1}${record.attributesMap['Taxon_ID']}${ncbiTaxPage2}">${record.attributesMap['Taxon_ID']}</a></td>
    <td class="mytdStyle" style="${separation}">					${record.attributesMap['Strain']}</td>
    <td class="mytdStyle" style="${separation}">
  	<c:choose>
  	<c:when test="${website == 'eupathdb'}">
        	<a href="/common/downloads/">
  	</c:when>
  	<c:otherwise>
        	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
  	</c:otherwise>
  	</c:choose>
		${record.attributesMap['Genome_Version']}</a></td>
    <td class="mytdStyle" style="${separation}">					${record.attributesMap['Data_Source']}</td>
    <td class="mytdStyle" style="text-align:right;${separation}">			${record.attributesMap['Genome_Size']}</td>
    <td class="mytdStyle" style="text-align:right;${separation}">			${record.attributesMap['Gene_Count']}</td>

<c:choose>
<c:when test="${record.attributesMap['Multiple_Strains'] == 'yes'}">
    <td class="mytdStyle" style="${separation}" title="${add_strains}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>
<%--
<c:choose>
<c:when test="${not empty record.attributesMap['Additional_Strains']}">
    <td class="mytdStyle">${record.attributesMap['Additional_Strains']}</td>
</c:when>
<c:otherwise>
    <td class="mytdStyle"></td>
</c:otherwise>
</c:choose>
--%>
<%-- <td class="mytdStyle">${record.attributesMap['Organellar_Genomes']}</td> --%>
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
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['SNPs'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ESTs'] == 'yes'}">
    <td class="mytdStyle" style="${separation}"

  <c:choose>
  <c:when test="${website == 'eupathdb'}">
        <a href="/common/downloads/">
  </c:when> 
  <c:otherwise>
        <a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
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
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Proteomics'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ChIP_chip'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['RNA_Seq'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Chip_Seq'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['SageTags'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">	
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Pathways'] == 'yes'}">
    <td class="mytdStyle" style="${separation}">
	<a href="http://${website}.org/${webapp}/showXmlDataContent.do?name=XmlQuestions.DataSources">
		<img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></a></td>
</c:when>
<c:otherwise>
    <td class="mytdStyle" style="${separation}"></td>
</c:otherwise>
</c:choose>

</tr>
</c:forEach>

</table>


<table width="100%">
<tr><td colspan="10"><font size="-2"><hr>* In addition, <i>G. lamblia</i> has 3766 deprecated genes that are not included in the official gene count.</font></td></tr>
<tr><td colspan="10"><font size="-2">** <i>T.gondii</i> gene groups identified in ToxoDB across the three strains (ME49, GT1, VEG) and the Apicoplast.</font></td></tr>
<tr><td colspan="10"><font size="-2">*** <i>T.cruzi</i> shows the number of distinct genes among the Esmeraldo like and Non-Esmeraldo like genes, plus the unassigned.</font></td></tr>
</table>


<site:footer/>
