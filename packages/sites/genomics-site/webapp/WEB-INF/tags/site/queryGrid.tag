<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- ADDING fast queries --%>

<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>


<%-- GENE  --%>
<c:set var="gqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>

<c:set var="geneByIdQuestion" value="${gqMap['GeneByLocusTag']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="geneIdParam" value="${gidqpMap['locus_tag']}"/>

<c:set var="geneByGeneTypeQuestion" value="${gqMap['GenesByGeneType']}"/>
<c:set var="grtqpMap" value="${geneByGeneTypeQuestion.paramsMap}"/>
<c:set var="geneTypeParam" value="${grtqpMap['rnatype']}"/>

<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['keyword']}"/>
<c:set var="orgParam" value="${gkwqpMap['organism']}"/>


<%-- CONTIG/GENOMIC SEQUENCE  --%>
<c:set var="cqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="cqMap" value="${cqSet.questionsMap}"/>

<c:set var="contigByIdQuestion" value="${cqMap['SequenceBySourceId']}"/>
<c:set var="cidqpMap" value="${contigByIdQuestion.paramsMap}"/>
<c:set var="contigIdParam" value="${cidqpMap['contig']}"/>

<c:set var="gowidth" value="10%"/>

<%-- end of adding fast queries --%>

<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="2" cellpadding="0">
<tr class="headerRow"><td align="center"><b>Fast Gene Queries</b></td></tr>

<tr><td align="center">

	<table width="45%" border="0" cellspacing="2" cellpadding="1">

<%-- GENES BY GENE ID --%>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr>

<td  valign="top" align="left" width="40%"><font size="-1"><b>Genes by Feature ID</b></td>

<td width="35%" align="right">
	<input type="hidden" name="questionFullName" value="GeneQuestions.GeneByLocusTag">
	<html:text property="myProp(GeneQuestions_GeneByLocusTag_${geneIdParam.name})" value="${geneIdParam.default}" size="14"/>&nbsp;
</td>

<td  valign="top" align="right" width="${gowidth}">
	<input type="hidden" name="questionSubmit" value="Get Answer">
	<input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td>

</tr>
</html:form>


<%-- GENES BY KEYWORD --%>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr>

<td  valign="top" align="left"><font size="-1"><b>Genes by Keyword</b></td>

<td align="right">
	<input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch">
	<input type="hidden" name="myMultiProp(organism)" value="Cryptosporidium hominis">

	<html:text property="myProp(GeneQuestions_GenesByTextSearch_${textParam.name})" value="${textParam.default}" size="14"/>&nbsp;
</td>

<td  valign="top" align="right" width="${gowidth}">
               <input type="hidden" name="questionSubmit" value="Get Answer">
               <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td>

</tr>
</html:form>

	</table>

</td>
</tr>
</table>

<%--------------------------------------------------------------------%>

<%-- the cellspacing is what allows for separation between Genomic and SNP (EST and ORF) titles --%>
<table width="100%" border="0" cellspacing="2" cellpadding="0">

<%--  All Gene Queries  --%>
<tr class="headerRow"><td colspan="3" align="center"><b>All Gene Queries</b></td></tr>

<tr><td colspan="3">  
	<div class="smallBlack" align="middle">
		<b>Query Availability:</b> &nbsp;&nbsp; &nbsp;
		<img src='/images/apidb_letter.gif' border='0' alt='apidb'/> = ApiDB &nbsp;&nbsp;
		<img src='/images/cryptodb_letter.gif' border='0' alt='cryptodb' /> = CryptoDB &nbsp;&nbsp;
		<img src='/images/plasmodb_letter.gif' border='0' alt='plasmodb' /> = PlasmoDB &nbsp;&nbsp;
		<img src='/images/toxodb_letter.jpg' border='0' alt='toxodb' /> = ToxoDB &nbsp; &nbsp;
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
			<td  valign="top" align="center"><b>All Genomic Sequences Queries</b></td>
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
			<td  valign="top" align="center"><b>All SNP Queries</b></td>
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
			<td  valign="top" align="center"><b>All EST Queries</b></td>
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
			<td  valign="top" align="center"><b>All ORF Queries</b></td>
		</tr>
		<tr><td align="center">
			<site:queryGridORFs/>
		</td></tr>
   	</table> 
    </td>
</tr>


</table>
