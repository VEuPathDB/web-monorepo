<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>

<c:set var="CGI_URL" value="${wdkModel.properties['CGI_URL']}"/>
<c:set var="version" value="${wdkModel.version}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>
<c:set var="gqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>

<c:set var="geneByIdQuestion" value="${gqMap['GeneBySingleLocusTag']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="geneIdParam" value="${gidqpMap['single_gene_id']}"/>

<c:set var="geneByGeneTypeQuestion" value="${gqMap['GenesByGeneType']}"/>
<c:set var="grtqpMap" value="${geneByGeneTypeQuestion.paramsMap}"/>
<c:set var="geneTypeParam" value="${grtqpMap['geneType']}"/>

<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>

<c:set var="sqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="sqMap" value="${sqSet.questionsMap}"/>

<c:set var="seqBySourceIdQuestion" value="${sqMap['SequenceBySourceId']}"/>
<c:set var="ssiqpMap" value="${seqBySourceIdQuestion.paramsMap}"/>
<c:set var="sequenceIdParam" value="${ssiqpMap['sequenceId']}"/>




<%-- Genes --%>
<tr><td align="left" colspan="4"><b>Search Genes</b></td></tr>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr><td width="30"></td>
    <td align="left"><i>${geneByIdQuestion.displayName}</i></td>
    <td align="right">
        <input type="hidden" name="questionFullName" value="GeneQuestions.GeneBySingleLocusTag">
        ${geneIdParam.prompt}: 
        <html:text property="myProp(GeneQuestions_GeneBySingleLocusTag_${geneIdParam.name})"
                   value="${geneIdParam.default}" size="10"/></td>
    <td align="right" width="24">
        <input type="hidden" name="questionSubmit" value="Get Answer">
    <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td></tr>
</html:form>


<html:form method="get" action="/processQuestionSetsFlat.do">
	<c:choose>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ApiDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris,Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii,Toxoplasma gondii"/>
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris"/>
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
		<c:set var="listOrganisms" value="Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii"/>
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ToxoDB')}">
		<c:set var="listOrganisms" value="Toxoplasma gondii"/>
	</c:when>
 <c:when test="${fn:containsIgnoreCase(modelName, 'GiardiaDB')}">
		<c:set var="listOrganisms" value="Giardia lamblia"/>
	</c:when>
 <c:when test="${fn:containsIgnoreCase(modelName, 'TrichDB')}">
		<c:set var="listOrganisms" value="Trichomonas vaginalis"/>
	</c:when>
	</c:choose> 
<tr><td width="30"></td>
    <td align="left"><i>${geneByTextQuestion.displayName}</i></td>
    <td align="right">
        <input type="hidden" name="questionFullName" value="GeneQuestions.GenesByTextSearch">
        <input type="hidden" name="myMultiProp(text_search_organism)"
               value="${listOrganisms}">
        <input type="hidden" name="myMultiProp(text_fields)"
               value="Gene product,Gene notes,User comments,Protein domain names and descriptions,EC descriptions,GO terms and definitions,Metabolic pathway names and descriptions">
       
        <input type="hidden" name="myMultiProp(whole_words)" value="yes">
        <input type="hidden" name="myProp(max_pvalue)" value="-30">
         ${textParam.prompt}:
        <html:text property="myProp(GeneQuestions_GenesByTextSearch_${textParam.name})"
                   value="${textParam.default}" size="10"/>
    <td align="right" width="24">
        <input type="hidden" name="questionSubmit" value="Get Answer">
    <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td></tr>
</html:form>


<html:form method="get" action="/processQuestionSetsFlat.do">
<tr><td width="30"></td>
    <td align="left"><i>${geneByGeneTypeQuestion.displayName}</i></td>
    <td align="right">
        <c:set var="pNam" value="${geneTypeParam.name}"/>
        <input type="hidden" name="questionFullName" value="GeneQuestions.GenesByGeneType">    
        <input type="hidden" name="myMultiProp(organism)" value="${organismlist}">
        <input type="hidden" name="myMultiProp(includePseudogenes)" value="No">
        <table><tr><td align="right" valign="middle">${geneTypeParam.prompt}:</td>
                   <td><html:select  property="myMultiProp(${pNam})">
                           <c:forEach items="${geneTypeParam.vocab}" var="opt">
                               <html:option value="${opt}">${opt}</html:option>
                           </c:forEach>
                       </html:select></td></tr></table>
    <td align="right" width="24">
        <input type="hidden" name="questionSubmit" value="Get Answer">
    <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td></tr>
</html:form>

<%-- Genomic Sequences --%>
<tr><td align="left" colspan="4"><b>Search Genomic Sequences</b></td></tr>

<html:form method="get" action="/processQuestionSetsFlat.do">
<tr><td width="30"></td>
    <td align="left"><i>${seqBySourceIdQuestion.displayName}</i></td>
    <td align="right">
        <input type="hidden" name="questionFullName" value="GenomicSequenceQuestions.SequenceBySourceId">
        ${sequenceIdParam.prompt}:
        <html:text property="myProp(GenomicSequenceQuestions_SequenceBySourceId_${sequenceIdParam.name})"
                   value="${sequenceIdParam.default}"  size="10"/>
    <td align="right" width="24">
        <input type="hidden" name="questionSubmit" value="Get Answer">
    <input name="go" value="go" type="image" src="<c:url value="/images/go.gif"/>" border="0" onmouseover="return true;">
</td></tr>
</html:form>

<%-- The rest --%>
<tr><td align="left" colspan="4"><br><b>All available queries:</b></td></tr>

<%-- show all questionSets in model --%>
<c:set value="${wdkModel.questionSets}" var="questionSets"/>
<c:forEach items="${questionSets}" var="qSet">
  <c:set value="${qSet.name}" var="qSetName"/>
  <c:if test="${qSet.internal == false}">
 
     <!-- load the question list by category -->
     <c:set var="isGeneQSet" value="${fn:containsIgnoreCase(qSetName, 'GeneQuestions')}"/>
     <c:if test="${isGeneQSet}">
        <c:set value="${qSet.questionsByCategory}" var="cats"/>
  
        <script type="text/javascript" lang="JavaScript 1.2">
        <!-- //

            var qsets = new Object();
            var qset = new Object();
            var cat_all = new Object();
            var cat_ind;
    
            // it's tricky to mix javascript and JSTL this way, but 
            // this is the way to expand data into javascript.
            <c:forEach items="${cats}" var="cat">
               <c:set value="${cat.key}" var="category"/>
               <c:set value="${cat.value}" var="qs"/>
       
               // add category to the all questions list
               var cat_name = '${category} ';
               var remain = 32 - cat_name.length;
               for (var i = 0; i < remain; i++) cat_name = cat_name + '=';
               cat_all['${category}'] = cat_name;
           
               cat_ind = new Array();
       
               <c:forEach items="${qs}" var="q">
                   <c:set value="${q.name}" var="qName"/>
                   <c:set value="${q.displayName}" var="qDispName"/>
              
                   cat_ind['${qSetName}.${qName}'] = '${qDispName}';
                   cat_all['${qSetName}.${qName}'] = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${qDispName}';
               </c:forEach>
       
               qset['${category}'] = cat_ind;
       
           </c:forEach>
    
           qset['all'] = cat_all;
           qsets['${qSetName}'] = qset;
    

    
           function selectCategory(qSetName)
           {
               var selCategory = document.getElementById('cat_' + qSetName);
               var idx = selCategory.selectedIndex;
               var catName = selCategory.options[idx].value;
    
               var stub = document.getElementById(qSetName + '_questions');
               var selQuestion = stub.getElementsByTagName("select")[0]; 
 
               selQuestion.options.length = 0;
    
               var qset = qsets[qSetName];
               var questions = qset[catName];
    
               var qName;
               idx = 0;
               for (qName in questions) {
                   var dispName = questions[qName];
                   var option = new Option(dispName, qName);
                   selQuestion.options[idx] = option;
                   option.innerHTML = dispName;
                   idx++;
               }
               selQuestion.selectedIndex = (catName == 'all') ? 1 : 0;
           }
    
    
           function gotoEntry(qSetName) {
               var stub = document.getElementById(qSetName + '_questions');
               var selQuestion = stub.getElementsByTagName("select")[0]; 
               var idx = selQuestion.selectedIndex;
               var key = selQuestion.options[idx].value;
        
               var qset = qsets[qSetName];
        
               // determine whether it's a category or a question
               var val = qset[key];
               if (typeof(val) != "undefined") {    // a category
                   var url = '<c:url value="/queries_tools.jsp"/>#' + key;
                   window.location = url;
                   return false;
               } else {    // a question
                   return true;
           }
       }

       // -->
       </script>


    </c:if> <!-- end of isGeneQSet test -->
  

<%-- FORM that presents all available queries --%>

  <html:form method="get" action="/showQuestion.do">
  <tr>
      <td width="30"></td>

      <td colspan="2">
         <table width="100%" border="0">
            <tr>
               <td align="left">
                  <i><jsp:getProperty name="qSet" property="displayName"/></i>
               </td>
               <td align="right" nowrap>
                  <c:choose>
                     <c:when test="${isGeneQSet}">
                        <!-- load category list -->
                        <c:set value="${qSet.questionsByCategory}" var="cats"/>
                        <select id="cat_${qSetName}" onchange="selectCategory('${qSetName}')">
                           <option value="all" selected>All Categories</option>
                           <c:forEach items="${cats}" var="cat">
                              <c:set value="${cat.key}" var="category"/>
                              <option value="${category}">${category}</option>
                           </c:forEach>
                        </select>
                        <span id="${qSetName}_questions">
                           <html:select property="questionFullName">
                              <script type="text/javascript" lang="JavaScript 1.2">
                              <!-- //
                                 var selCategory = document.getElementById('cat_${qSetName}');
                                 selCategory.selectedIndex = 0;

                                 selectCategory('${qSetName}');
                              // -->
                              </script>
                           </html:select>
                        </span>
                     </c:when>
                     <c:otherwise>
                        <c:set value="${qSet.questions}" var="questions"/>
                        <html:select property="questionFullName">
                           <c:forEach items="${questions}" var="q">
                               <c:set value="${q.name}" var="qName"/>
                               <c:set value="${q.displayName}" var="qDispName"/>
                               <c:set value="${q.category}" var="category"/>
                               <html:option value="${qSetName}.${qName}">${qDispName}</html:option>
                           </c:forEach>
                       </html:select>
                    </c:otherwise>
                 </c:choose>
               </td>
            </tr>
         </table>


      </td>
      <td align="right" width="24">
          <input type="hidden" name="submit" value="Show Question">
      <c:choose>
             <c:when test="${isGeneQSet}">
                <input name="go" value="go" type="image" 
               src="<c:url value="/images/go.gif"/>" border="0" 
               onclick="return gotoEntry('${qSetName}');">
         </c:when>
         <c:otherwise>
                <input name="go" value="go" type="image" 
               src="<c:url value="/images/go.gif"/>" border="0" 
               onclick="return true;">
         </c:otherwise>
      </c:choose>
      </td>


   </tr>
   </html:form>

   </c:if> <!-- end of questionSet.internal() test -->
</c:forEach>

<c:if test = "${project == 'PlasmoDB'}">

<tr><td align="left" colspan="3"><br><b>PlasmoDB 4.4 queries/tools not yet in 5.4 >> 
    <td align="right"><a href="http://v4-4.plasmodb.org/restricted/Queries.shtml">
                      <img src="<c:url value="/images/go.gif"/>" alt="PlasmoDB 4.4" border="0"></a>
    </td>
</tr>

</c:if>

<c:if test = "${project == 'ToxoDB'}">

<tr><td align="right" colspan="3">[<a href="./queries_tools.jsp" class="blue">complete list of Queries & Tools</a>]</td><td></td></tr>

<tr><td align="left" colspan="3"><br><b>ToxoDB 3.3 queries/tools not yet in 4.0  
    <td align="right"><a href="http://v3-0.toxodb.org/restricted/Queries.shtml">
                      <img src="<c:url value="/images/go.gif"/>" alt="ToxoDB 3.3" border="0"></a></td></tr>

</c:if>

