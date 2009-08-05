<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>


<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>


<!-- display page header with wdkQuestion displayName as banner -->
<site:header title="${wdkModel.displayName} : Expression Timing"
                 banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Life Cycle Queries"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<jsp:useBean scope="page" id="childQuestions" class="java.util.LinkedHashMap"/>
<c:set var="cqSetName" value="InternalQuestions"/>
<c:set target="${childQuestions}" property="GenesByIntraerythrocyticExpression" value=""/>
<c:set target="${childQuestions}" property="GenesByExtraerythrocyticExpression" value=""/>
<c:set target="${childQuestions}" property="GenesByExpression" value=""/>

<!-- show all params of question, collect help info along the way -->
<c:set value="Help for question: ${wdkQuestion.displayName} :: ${childQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
     <div id="question_Form">
</c:if>

<c:forEach items="${childQuestions}" var="cqEntry">
<c:set var="cqName" value="${cqEntry.key}"/>
<c:set var="questionFullName" value="${cqSetName}.${cqName}"/>
<c:set var="cqSet" value="${wdkModel.questionSetsMap[cqSetName]}"/>
<c:set var="childQuestion" value="${cqSet.questionsMap[cqName]}"/>

<hr>

<!-- put an anchor here for linking back from help sections -->
<A name="${fromAnchorQ}"></A>
<html:form styleId="form_question" method="post" action="/processQuestionSetsFlat.do">
<input type="hidden" name="questionFullName" value="${questionFullName}"/>

<table>

<!-- show error messages, if any -->
<wdk:errors/>

<tr><td colspan="2"><p><b>${childQuestion.displayName}:</b>${childQuestion.description}</p></td></tr>

<c:set value="${childQuestion.params}" var="qParams"/>

<c:forEach items="${qParams}" var="qP">


  <!-- an individual param (can not use fullName, w/ '.', for mapped props) -->

  <c:set value="${cqSetName}_${childQuestion.name}_${qP.name}" var="pNam"/>
  <tr>
  <td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>

<td>

  <%-- choose between enum param and straight text or number param --%>
  <c:choose>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
        <wdk:enumParamInput qp="${qP}" />
    </c:when>
    <c:otherwise>
      <html:text property="myProp(${pNam})"/>
    </c:otherwise>
  </c:choose>

</td>

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

  <tr><td><html:hidden property="pageSize" value="20"/></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
  </tr>

</table>
</html:form>


</c:forEach>


<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
     </div>
</c:if>

<hr>

<!-- display description for wdkQuestion -->
	
<div id="query-description-section"><b>Query description:</b> <jsp:getProperty name="wdkQuestion" property="description"/></div>

<%-- get the attributions of the question --%>
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
