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


<c:set var="AmoebaDBOrgs" value="Entamoeba dispar,Entamoeba histolytica,Entamoeba invadens" />
<c:set var="CryptoDBOrgs" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris" />				
<c:set var="GiardiaDBOrgs" value="Giardia Assemblage A isolate WB, Giardia Assemblage B isolate GS,Giardia Assemblage E isolate P15" />
<c:set var="MicrosporidiaDBOrgs" value="Encephalitozoon cuniculi,Encephalitozoon intestinalis,Enterocytozoon bieneusi" />
<c:set var="PlasmoDBOrgs" value="Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii" />
<c:set var="ToxoDBOrgs" value="Toxoplasma gondii,Neospora caninum" />
<c:set var="TrichDBOrgs" value="Trichomonas vaginalis"/>
<c:set var="TriTrypDBOrgs" value="Leishmania braziliensis,Leishmania infantum,Leishmania major,Leishmania mexicana,Trypanosoma brucei,Trypanosoma cruzi,Trypanosoma congolense,Trypanosoma vivax"/>
<c:set var="EuPathDBOrgs" value="${AmoebaDBOrgs},${CryptoDBOrgs},${GiardiaDBOrgs},${MicrosporidiaDBOrgs},${PlasmoDBOrgs},${ToxoDBOrgs},${TrichDBOrgs},${TriTrypDBOrgs},"/>
<c:choose>
  	 <c:when test="${fn:containsIgnoreCase(modelName, 'AmoebaDB')}">
                 <c:set var="listOrganisms" value="${AmoebaDBOrgs}" />
         </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
		<c:set var="listOrganisms" value="${EuPathDBOrgs}" />
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="${CryptoDBOrgs}" />
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'GiardiaDB')}">
                <c:set var="listOrganisms" value="${GiardiaDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'MicrosporidiaDB')}">
                <c:set var="listOrganisms" value="${MicrosporidiaDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
                <c:set var="listOrganisms" value="${PlasmoDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ToxoDB')}">
                <c:set var="listOrganisms" value="${ToxoDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'TrichDB')}">
                <c:set var="listOrganisms" value="${TrichDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'TriTrypDB')}">
                <c:set var="listOrganisms" value="${TriTrypDBOrgs}" />
        </c:when>
</c:choose> 

<div  style="width:460px;" id="quick-search" session-id="${sessionId}">
         <table style="width:460px;">
           <tr>
             <td><div align="right">
               <html:form method="get" action="/processQuestionSetsFlat.do">
          		<label><b><a href="<c:url value='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'/>" title="Enter a Gene ID. Use * as a wildcard (to obtain more than one). Click to enter multiple Gene IDs">Gene ID:</a></b></label>
         		<input type="hidden" name="questionFullName" value="GeneQuestions.GeneBySingleLocusTag"/>
	  			<input type="text" class="search-box" name="myProp(${geneIdParam.name})" value="${geneIdParam.default}" />  <!-- size is defined in class -->
	  			<input type="hidden" name="questionSubmit" value="Get Answer"/>
	  			<input name="go" value="go" type="image" src="/assets/images/mag_glass.png" alt="Click to search" width="23" height="23" class="img_align_middle" />
          	   </html:form>
			 </div></td>
             <td><div align="right">
               <html:form method="get" action="/processQuestionSetsFlat.do">
          		<label><b><a href="<c:url value='/showQuestion.do?questionFullName=GeneQuestions.GenesByTextSearch'/>" 
title="Enter a term to find genes. Use * as a wildcard. Use quotation marks to find phrase matches. Click to access the advanced gene search page">Gene Text Search:</a></b></label>

          <c:set var="textFields" value="Gene ID,Alias,Gene product,GO terms and definitions,Gene notes,User comments,Protein domain names and descriptions,EC descriptions"/>
          <c:if test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
             <c:set var="textFields" value="${textFields},Release 5.5 Genes"/>
          </c:if>
          <c:if test="${fn:containsIgnoreCase(modelName, 'TriTrypDB') || fn:containsIgnoreCase(modelName, 'EuPathDB')}">
             <c:set var="textFields" value="${textFields},Phenotype"/>
          </c:if>
          <c:if test="${fn:containsIgnoreCase(modelName, 'ToxoDB') || fn:containsIgnoreCase(modelName, 'GiardiaDB')}">
             <c:set var="textFields" value="${textFields},Community annotation"/>
          </c:if>
          <c:if test="${not fn:containsIgnoreCase(modelName, 'CryptoDB') && not fn:containsIgnoreCase(modelName, 'GiardiaDB') && not fn:containsIgnoreCase(modelName, 'TrichDB') && not fn:containsIgnoreCase(modelName, 'TriTrypDB')}">
             <c:set var="textFields" value="${textFields},Metabolic pathway names and descriptions"/>
          </c:if>
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
