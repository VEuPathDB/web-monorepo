<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="headElement">
  <script src="js/blast.js" type="text/javascript"></script>
</c:set>

<site:header title="${wdkModel.displayName} : BLAST"
                 banner="${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="BLAST"
                 division="queries_tools"
                 headElement="${headElement}"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<!-- put an anchor here for linking back from help sections -->
<A name="${fromAnchorQ}"></A>
<html:form method="post" action="/processQuestion.do">
<input type="hidden" name="questionFullName" id="questionFullName" value="EstQuestions.EstsBySimilarity"/>
<table>

<!-- show error messages, if any -->
<wdk:errors/>

<c:set value="${wdkQuestion.params}" var="qParams"/>
<c:forEach items="${qParams}" var="qP">

  <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
  <c:set value="${qP.name}" var="pNam"/>
  <tr>
  <c:choose>
   <c:when test="${pNam eq 'BlastQuerySequence'}">
   <td align="right" id="parameter_label"><b><jsp:getProperty name="qP" property="prompt"/></b></td>
  </c:when>
  <c:otherwise>
   <td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>
  </c:otherwise>
  </c:choose>
  <%-- Handle database-type parm in HTML, so it can set questionFullName --%>
  <c:choose>

    <c:when test="${pNam eq 'BlastDatabaseType'}">
      <td>

      <div name="type_div" id="BlastDatabaseType">
	<c:set var="counter" value="0"/>
    <%--<c:forEach items="${qP.vocab}" var="flatVoc">
              <input type="radio" name="type" value="${flatVoc}" id="BlastType_${counter}" onClick="getOrganismTerms()" disabled>${flatVoc}</input>
	      <c:set var="counter" value="${counter+1}"/>	--%>
	      <input type="radio" name="type" value="Genome" id="BlastType_Genome" onClick="getOrganismTerms(); changeQuestion('genome'); updateOrganism()" disabled>Genome</input>
	      <input type="radio" name="type" value="EST" id="BlastType_EST" onClick="getOrganismTerms(); changeQuestion('est'); updateOrganism()" disabled>EST</input>
	      <input type="radio" name="type" value="ORF" id="BlastType_ORF" onClick="getOrganismTerms(); changeQuestion('orf'); updateOrganism()" disabled>ORF</input>
	      <input type="radio" name="type" value="Transcripts" id="BlastType_Transcripts" onClick="getOrganismTerms(); changeQuestion('transcripts'); updateOrganism()" disabled>Transcripts</input>
	      <input type="radio" name="type" value="Proteins" id="BlastType_Proteins" onClick="getOrganismTerms(); changeQuestion('genome'); updateOrganism()" disabled>Proteins</input>
      <%--  </c:forEach>--%>
        <input type="hidden" name="myMultiProp(${pNam})" id="blastType"/>
      </div>
<%--
      <select name="myMultiProp(BlastDatabaseType)" id="BlastDatabaseType" onChange="getOrganismTerm()">
      </select>
--%>
      </td>
    </c:when>
    <c:when test="${pNam eq 'BlastDatabaseOrganism'}">
      <td>
	<select name="blastOrganism" id="BlastOrganism" multiple="multiple" onChange="updateOrganism()">
      
        </select>
        <input name="myMultiProp(${pNam})" type="hidden" id="blastOrg"/> 
      </td>
    </c:when>
    <c:when test="${pNam eq 'BlastAlgorithm'}">
     <td>

       <c:set var="counter" value="0"/>
       <c:forEach items="${qP.vocab}" var="flatVoc">
              <input type="radio" name="algorithm" value="${flatVoc}" id="BlastAlgorithm_${counter}" onClick="getBlastTerms()">${flatVoc}</input>
	      <c:set var="counter" value="${counter+1}"/>	
       </c:forEach>
       <input type="hidden" name="myMultiProp(${pNam})" id="blastAlgo"/>
   <%--  <select  name="myMultiProp(${pNam})" id="BlastAlgorithm" onChange="getBlastTerms()" styleId="${qP.id}">
       <c:forEach items="${qP.vocab}" var="flatVoc">
              <option value="${flatVoc}">${flatVoc}</option>
       </c:forEach>
     </select>--%>

     </td>

    </c:when>
    <c:otherwise> <%-- not BlastDatabaseType --%>
    
      <%-- choose between flatVocabParam and straight text or number param --%>
      <c:choose>
        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.FlatVocabParamBean'}">
          <td>
            <site:flatVocabParamInput qp="${qP}" />
          </td>
        </c:when>
        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
          <td>
            <site:enumParamInput qp="${qP}" />
          </td>
        </c:when>
        <c:otherwise>
          <td>
            <c:choose>
              <c:when test="${pNam == 'BlastQuerySequence'}">
                  <html:textarea property="myProp(${pNam})" styleId="sequence" cols="50" rows="4"/>
              </c:when>
              <c:otherwise>
                <html:text property="myProp(${pNam})" styleId="${qP.id}" />
              </c:otherwise>
            </c:choose>
          </td>
        </c:otherwise>
      </c:choose>

    </c:otherwise> <%-- not BlastDatabaseType --%>
  </c:choose>

      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
      </td>
  </tr>
</c:forEach>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td><html:hidden property="altPageSize" value="1000000"/></td>
      <td>
        <table><tr>
  		<td><html:submit property="questionSubmit" value="Get Answer"/></td>
		<td><input type="button" value="Clear Sequence" onClick="this.form.elements[4].value='';"/></td>
		<td><html:reset>Reset All</html:reset></td>
        </tr></table>
      </td></tr>
</table>
</html:form>

<hr>

<%-- display description for wdkQuestion --%>
<p><b>Query description:</b> <jsp:getProperty name="wdkQuestion" property="description"/></p>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
