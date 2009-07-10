<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- TRANSPARENT PNGS for IE6 --%>
<%--  <script defer type="text/javascript" src="/assets/js/pngfix.js"></script>   --%>

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

<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>
<c:set var="orgParam" value="${gkwqpMap['text_search_organism']}"/>
<c:set var="timestampParam" value="${gkwqpMap['timestamp']}"/>
<c:set var="sessionId" value="${sessionScope['sessionId']}"/>


<c:choose>
	<c:when test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris,Giardia lamblia,Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii,Toxoplasma gondii,Trichomonas vaginalis,Leishmania braziliensis,Leishmania infantum,Leishmania major,Trypanosoma brucei,Trypanosoma cruzi"/>
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris"/>
	</c:when>
<c:when test="${fn:containsIgnoreCase(modelName, 'ToxoDB')}">
                <c:set var="listOrganisms" value="Toxoplasma gondii"/>
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

 <c:when test="${fn:containsIgnoreCase(modelName, 'TriTrypDB')}">
		<c:set var="listOrganisms" value="Leishmania braziliensis,Leishmania infantum,Leishmania major,Trypanosoma brucei,Trypanosoma cruzi"/>
	</c:when>

</c:choose> 


<div id="quick-search" session-id="${sessionId}">
         <table width="450" border="0" cellpadding="3">
           <tr>
             <td><div align="right">
               <html:form method="get" action="/processQuestionSetsFlat.do">
          		<label><b><a href="<c:url value='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'/>" title="Click to input several Gene IDs">Gene ID:</a></b></label>
         		<input type="hidden" name="questionFullName" value="GeneQuestions.GeneBySingleLocusTag"/>
	  			<input type="text" class="search-box" name="myProp(${geneIdParam.name})" value="${geneIdParam.default}" size="15"/>
	  			<input type="hidden" name="questionSubmit" value="Get Answer"/>
	  			<input name="go" value="go" type="image" src="/assets/images/mag_glass.png" alt="Click to search" width="23" height="23" class="img_align_middle" />
          	   </html:form>
			 </div></td>
             <td><div align="right">
               <html:form method="get" action="/processQuestionSetsFlat.do">
          		<label><b><a href="<c:url value='/showQuestion.do?questionFullName=GeneQuestions.GenesByTextSearch'/>" title="Click to access an advanced gene search">Gene Text Search:</a></b></label>
          <c:set var="textFields" value="Gene product,Gene notes,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions"/>
    <c:choose> 
          <c:when test="${fn:containsIgnoreCase(modelName, 'TriTrypDB')}">
             <c:set var="textFields" value="Gene product,Gene notes,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions,Phenotype"/>
          </c:when>
    </c:choose> 
           		<input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch"/>
		        <input type="hidden" name="myMultiProp(${orgParam.name})" value="${listOrganisms}"/>
          		<input type="hidden" name="myMultiProp(text_fields)" value="${textFields}"/>
          		<input type="hidden" name="myMultiProp(whole_words)" value="no"/>
          		<input type="hidden" name="myProp(max_pvalue)" value="-30"/>
          		<input type="text" class="search-box ts_ie" name="myProp(${textParam.name})" value="${textParam.default}"/>
                        <input type="hidden" name="myProp(timestamp)" value="${timestampParam.default}"/>
          		<input type="hidden" name="questionSubmit" value="Get Answer"/>
	  			<input name="go" value="go" type="image" src="/assets/images/mag_glass.png" alt="Click to search" width="23" height="23" class="img_align_middle" />
          	   </html:form>
			 </div></td>
            </tr>
         </table>
</div>
