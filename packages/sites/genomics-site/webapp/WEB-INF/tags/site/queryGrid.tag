<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- ADDING fast queries --%>

<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<%-- GENE  --%>
<c:set var="gqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>

<c:set var="geneByIdQuestion" value="${gqMap['GeneBySingleLocusTag']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="geneIdParam" value="${gidqpMap['locus_tag']}"/>

<c:set var="geneByGeneTypeQuestion" value="${gqMap['GenesByGeneType']}"/>
<c:set var="grtqpMap" value="${geneByGeneTypeQuestion.paramsMap}"/>
<c:set var="geneTypeParam" value="${grtqpMap['rnatype']}"/>

<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>

<c:set var="PorT" value="${fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo')}" />
<c:choose>
<c:when test="${PorT}">
	<c:set var="orgParam" value="${gkwqpMap['species_name']}"/>
</c:when>
<c:otherwise>
	<c:set var="orgParam" value="${gkwqpMap['organism']}"/>
</c:otherwise>
</c:choose>


<%-- CONTIG/GENOMIC SEQUENCE  --%>
<c:set var="cqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="cqMap" value="${cqSet.questionsMap}"/>

<c:set var="contigByIdQuestion" value="${cqMap['SequenceBySourceId']}"/>
<c:set var="cidqpMap" value="${contigByIdQuestion.paramsMap}"/>
<c:set var="contigIdParam" value="${cidqpMap['contig']}"/>

<c:set var="gowidth" value="5%"/>




<%-- END of ADDING fast queries --%>


<%-- FAST QUERIES --%>



<table width="100%" border="0" cellspacing="2" cellpadding="0">

<tr><td align="center">
	<table width="100%" border="0" cellspacing="2" cellpadding="2">  <%-- FAST queries table --%>

<%-- GENES BY FEATURE ID --%>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr>
<td  valign="top" align="left" width="10%"><font size="-1"><b>Genes by ID</b></td>

<td width="10%" align="left">
	<input type="hidden" name="questionFullName" value="GeneQuestions.GeneBySingleLocusTag">
	<html:text property="myProp(GeneQuestions_GeneBySingleLocusTag_${geneIdParam.name})" value="${geneIdParam.default}" size="15"/>&nbsp;
</td>

<td  valign="top" align="left" width="${gowidth}">
	<input type="hidden" name="questionSubmit" value="Get Answer">
	<input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td>

</html:form>


<%-- GENES BY KEYWORD --%>
<html:form method="get" action="/processQuestionSetsFlat.do">
<td  valign="top" width="20%" align="right"><font size="-1"><b>Genes by Keyword</b></td>
<td width="20%" align="right">

<c:choose>

<%-- TOXO:  no organism parameter, different values for datasets parameter? --%>
<c:when test="${fn:containsIgnoreCase(modelName, 'ToxoDB')}">
	<input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch">
        <input type="hidden" name="myMultiProp(datasets)"
               value="Gene product,Gene notes,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions,Metabolic pathway names and descriptions">
        <input type="hidden" name="myMultiProp(whole_words)" value="no">
        <input type="hidden" name="myProp(max_pvalue)" value="-30">
        <html:text property="myProp(GeneQuestions_GenesByTextSearch_${textParam.name})" value="${textParam.default}" size="40"/>&nbsp;
</c:when>


<%-- PLASMO OR API or CRYPTO using same interface --%>
<c:otherwise>
	<c:choose>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ApiDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii,Toxoplasma gondii"/>
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="C. hominis,C. parvum"/>
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
		<c:set var="listOrganisms" value="Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii"/>
	</c:when>
	</c:choose> 

	<input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch">
        <input type="hidden" name="myMultiProp(${orgParam.name})" value="${listOrganisms}">
        <input type="hidden" name="myMultiProp(datasets)"
               value="Gene product,Gene notes,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions,Metabolic pathway names and descriptions">
        <input type="hidden" name="myMultiProp(whole_words)" value="no">
        <input type="hidden" name="myProp(max_pvalue)" value="-30">
        <html:text property="myProp(GeneQuestions_GenesByTextSearch_${textParam.name})" value="${textParam.default}" size="40"/>&nbsp;
</c:otherwise>

</c:choose> <%-- Toxo or the others --%>

</td>
<td  valign="top" align="right" width="${gowidth}">
	<input type="hidden" name="questionSubmit" value="Get Answer">
        <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td>
</tr>
</html:form>
	
	</table>  <%-- END OF FAST queries table --%>

</td>
</tr>
</table>

<%--------------------------------------------------------------------%>

<%-- the cellspacing is what allows for separation between Genomic and SNP (EST and ORF) titles --%>
<table width="100%" border="0" cellspacing="3" cellpadding="0">

<%--  All Gene Queries  --%>
<tr class="headerRow"><td colspan="3" align="center"><b>Identify Genes by:</b></td></tr>

<tr><td colspan="3">  
	<div class="smallBlack" align="middle">
		<b>Query Availability:</b> &nbsp;&nbsp; &nbsp;
		<img src='<c:url value="/images/apidb_letter.gif" />' border='0' alt='apidb'/> = ApiDB &nbsp;&nbsp;
		<img src='<c:url value="/images/cryptodb_letter.gif" />' border='0' alt='cryptodb' /> = CryptoDB &nbsp;&nbsp;
		<img src='<c:url value="/images/plasmodb_letter.gif" />' border='0' alt='plasmodb' /> = PlasmoDB &nbsp;&nbsp;
		<img src='<c:url value="/images/toxodb_letter.jpg" />' border='0' alt='toxodb' /> = ToxoDB &nbsp; &nbsp;
	</div>
</td></tr>

<tr><td colspan="2" align="center">
	<site:queryGridGenes/>
</td></tr>

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
