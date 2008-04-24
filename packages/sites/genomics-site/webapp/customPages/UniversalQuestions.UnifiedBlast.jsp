<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

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

<%--    <c:when test="${pNam eq 'BlastDatabaseType'}"> --%>
    <c:when test="${pNam eq 'BlastAlgorithm'}">
      <td>

	<c:set var="counter" value="0"/>
        <c:forEach items="${qP.vocab}" var="flatVoc">
              <input type="radio" name="algorithm" value="${flatVoc}" id="BlastAlgorithm_${flatVoc}" onClick="changeLabel();checkSequenceLength()" disabled><font id="${flatVoc}_font" color="gray">${flatVoc}</font></input>
	      <c:set var="counter" value="${counter+1}"/>
       </c:forEach>
        <input type="hidden" name="myMultiProp(${pNam})" id="blastAlgo"/>
      </td>
    </c:when>
    <c:when test="${pNam eq 'BlastDatabaseOrganism'}">
      <td>
	<select name="blastOrganism" id="BlastOrganism" multiple="multiple" onChange="updateOrganism()">
           <option value="-">Select Target Data Type to display appropriate organisms</option>
        </select><br>
	<input type="button" onClick="selectAll_None(true)" value="All"/>&nbsp;&nbsp;<input onClick="selectAll_None(false)" type="button" value="None"/><br>
        <input name="myMultiProp(${pNam})" type="hidden" id="blastOrg"/> 
      </td>
    </c:when>
<%--  <c:when test="${pNam eq 'BlastAlgorithm'}"> --%>
    <c:when test="${pNam eq 'BlastDatabaseType'}">
     <td>

       <c:set var="counter" value="0"/>
       <c:forEach items="${qP.vocab}" var="flatVoc">
              <input type="radio" name="type" value="${flatVoc}" id="BlastType_${counter}" onClick="getBlastAlgorithm();changeQuestion();checkSequenceLength()">${flatVoc}</input>
	      <c:set var="counter" value="${counter+1}"/>	
       </c:forEach>
       <input type="hidden" name="myMultiProp(${pNam})" id="blastType"/>

     </td>

    </c:when>
    <c:otherwise> <%-- not BlastDatabaseType --%>
    
      <%-- choose between enum param and straight text or number param --%>
      <c:choose>
        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
          <td>
            <wdk:enumParamInput qp="${qP}" />
          </td>
        </c:when>
        <c:otherwise>
          <td>
            <c:choose>
              <c:when test="${pNam == 'BlastQuerySequence'}">
                  <html:textarea property="myProp(${pNam})" styleId="sequence" cols="50" rows="4" onchange="checkSequenceLength()"/>
		  <br><div id="short_sequence_warning"></div>
              </c:when>
              <c:when test="${pNam == '-e'}">
                  <html:text property="myProp(${pNam})" styleId="e"/>
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


    <%-- display subType filter --%>
<c:set var="recordClass" value="${wdkQuestion.recordClass}"/>
<c:if test="${recordClass.hasSubType}">
    <c:set var="subTypeParam" value="${recordClass.subType.subTypeParam}"/>

        <tr>
            <td align="right" valign="top"><b>${subTypeParam.prompt}</b></td>
            <td align="left" valign="top">
                <wdk:enumParamInput qp="${subTypeParam}" />
            </td>
        </tr>

</c:if>


<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td><html:hidden property="altPageSize" value="1000000"/></td>
      <td>
        <table><tr>
  		<td><html:submit property="questionSubmit" value="Get Answer"/></td>
		<td><input type="button" value="Clear Sequence" onClick="document.getElementById('sequence').value='';"/></td>
		<td><html:reset>Reset All</html:reset></td>
        </tr></table>
      </td></tr>
</table>
</html:form>

<hr>

<%-- display description for wdkQuestion --%>
<p><b>Query description:</b> <jsp:getProperty name="wdkQuestion" property="description"/></p>


<%-- get the attributions of the question if not ApiDB --%>
<c:if test = "${project != 'EuPathDB'}">

<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />

</c:if>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
