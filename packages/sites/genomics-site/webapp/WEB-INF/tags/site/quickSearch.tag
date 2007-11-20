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
<c:set var="geneIdParam" value="${gidqpMap['single_gene_id']}"/>

<c:set var="geneByGeneTypeQuestion" value="${gqMap['GenesByGeneType']}"/>
<c:set var="grtqpMap" value="${geneByGeneTypeQuestion.paramsMap}"/>
<c:set var="geneTypeParam" value="${grtqpMap['rnatype']}"/>

<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>

<c:set var="orgParam" value="${gkwqpMap['text_search_organism']}"/>


<%-- CONTIG/GENOMIC SEQUENCE  --%>
<c:set var="cqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="cqMap" value="${cqSet.questionsMap}"/>

<c:set var="contigByIdQuestion" value="${cqMap['SequenceBySourceId']}"/>
<c:set var="cidqpMap" value="${contigByIdQuestion.paramsMap}"/>
<c:set var="contigIdParam" value="${cidqpMap['contig']}"/>

<c:set var="gowidth" value="5%"/>




<%-- END of ADDING fast queries --%>



<%-- FAST QUERIES --%>

<table width="100%" border="0" cellspacing="2" cellpadding="0">        <%-- FAST queries table --%>
<tr><td align="center" colspan="3">


	<table width="100%" border="0" cellspacing="2" cellpadding="2">  <%-- FAST queries table --%>

<%-- GENES BY FEATURE ID --%>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr>
<td  valign="top" align="center" width="10%"><font size="-1"><b>ID</b></td>

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
<td  valign="top" width="20%" align="right"><font size="-1"><b>Keyword</b></td>
<td width="20%" align="right">


	<c:choose>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ApiDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii,Toxoplasma gondii"/>
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum"/>
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
		<c:set var="listOrganisms" value="Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii"/>
	</c:when>
 <c:when test="${fn:containsIgnoreCase(modelName, 'GiardiaDB')}">
		<c:set var="listOrganisms" value="Giardia lamblia"/>
	</c:when>
 <c:when test="${fn:containsIgnoreCase(modelName, 'TrichDB')}">
		<c:set var="listOrganisms" value="Trichomonas vaginalis"/>
	</c:when>


	</c:choose> 

	<input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch">
        <input type="hidden" name="myMultiProp(${orgParam.name})" value="${listOrganisms}">
        <input type="hidden" name="myMultiProp(text_fields)"
               value="Gene product,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions">
        <input type="hidden" name="myMultiProp(whole_words)" value="yes">
        <input type="hidden" name="myProp(max_pvalue)" value="-30">
        <html:text property="myProp(GeneQuestions_GenesByTextSearch_${textParam.name})" value="${textParam.default}" size="28"/>&nbsp;


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



