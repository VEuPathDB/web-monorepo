<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header  title="EuPathDB :: Genome & Data Type Summary"
                 banner="EuPathDB Genome & Data Type Summary"
                 parentDivision="EuPathDB"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="genomeDataType"/>


<c:set var="ncbiTaxPage" value="http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=237895&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock"/>

<c:set var="mytableStyle" value="empty-cells:show;border-width:1px;border-spacing:2px;border-style:outset;border-color:gray;border-collapse:separate;background-color:white" />
<c:set var="mytdStyle" value="vertical-align:middle;border-width:0.5px;padding:3px;border-style:inset;border-color:gray;-moz-border-radius:0px;"/>
<c:set var="mythStyle" value="background-color:#eaeaea;vertical-align:middle;text-align:center;font-weight:bold;border-width:0.5px;padding:3px;border-style:inset;border-color:gray;-moz-border-radius:0px;"/>

<table width="100%">
<tr><td><h2>EuPathDB Data Summary</h2></td>
    <td align="right" colspan="5"><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">EuPathDB Gene Metrics</a></td>
</tr>

<tr><td><h3>Genomes and Data Types</h3></td>
     <td align="right" style="font-size:10px;">(<b>Micrry</b>=Microarray,  <b>Protmc</b>=Proteomics,  <b>Ch_ch</b>=ChIP chip,  <b>SageTg</b>=Sage Tags, <b>Pathw</b>=Pathway)</td></tr>
</table>


<table  width="100%">
<tr>
    <td style="${mythStyle}">Organisms</td>
    <td style="${mythStyle}">Taxon ID</td>
    <td style="${mythStyle}">Strain</td>
    <td style="${mythStyle}">Genome<br>Version</td>
    <td style="${mythStyle}">Data<br>Source</td>
    <td style="${mythStyle}" title="Size in Mega bases">Genome<br>Size</td>
    <td style="${mythStyle}">Gene<br>Count</td>
    <td style="${mythStyle}">Multiple<br>Strains</td>
<!--    <td style="${mythStyle}">Additional<br>Strains</td>    -->
    <td style="${mythStyle}">Organellar<br>Genomes</td>
    <td style="${mythStyle}">Isolates</td>
    <td style="${mythStyle}">SNPs</td>
    <td style="${mythStyle}">ESTs</td>
    <td style="${mythStyle}" title="Microarray">Micrry</td>
    <td style="${mythStyle}" title="Proteomics">Protmc</td>
    <td style="${mythStyle}" title="ChIP Chip">Ch_ch</td>
    <td style="${mythStyle}" title="Sage Tags">SageTg</td>
    <td style="${mythStyle}" title="Metabolic Pathways">Pathw</td>
</tr>

<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:set var="title" value="${record.attributesMap['Family']}"/>

<tr>

    <td title="${title}" style="text-align:left;${mytdStyle}"><i>${record.attributesMap['Organism']}</i></td>
    <td title="Click to access this Taxon ID in NCBI" style="text-align:center;${mytdStyle}"><a href="${ncbiTaxPage}">${record.attributesMap['Taxon_ID']}</a></td>
    <td style="text-align:center;${mytdStyle}">${record.attributesMap['Strain']}</td>
    <td style="text-align:center;${mytdStyle}">${record.attributesMap['Genome_Version']}</td>
    <td style="text-align:center;${mytdStyle}">${record.attributesMap['Data_Source']}</td>
    <td style="text-align:right;${mytdStyle}">${record.attributesMap['Genome_Size']}</td>
    <td style="text-align:right;${mytdStyle}">${record.attributesMap['Gene_Count']}</td>

<c:choose>
<c:when test="${record.attributesMap['Multiple_Strains'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Organellar_Genomes'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Isolates'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['SNPs'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ESTs'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Microarray'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Proteomics'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['ChIP_chip'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['SageTags'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${record.attributesMap['Pathways'] == 'yes'}">
    <td style="text-align:center;${mytdStyle}"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
</c:when>
<c:otherwise>
    <td style="${mytdStyle}"></td>
</c:otherwise>
</c:choose>

</tr>
</c:forEach>

</table>


<table align="center" width="100%" border="0" cellpadding="2" cellspacing="2">
<tr><td colspan="10"><font size="-2"><hr>* In addition, <i>G. lamblia</i> has 4778 deprecated genes that are not included in the official gene count.</font
></td></tr>
<tr><td colspan="10"><font size="-2">** <i>T. gondii</i> gene groups identified in ToxoDB across the three strains (ME49, GT1, VEG) and the Apicoplast.</fo
nt></td></tr>
</table>


<site:footer/>
