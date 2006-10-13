<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="userAnswers" value="${wdkUser.recordAnswerMap}"/>
<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>
<c:if test="${dsCol == null}"><c:set var="dsCol" value=""/></c:if>
<c:if test="${dsColVal == null}"><c:set var="dsColVal" value="orthologs"/></c:if>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb')}" />

<site:header title="${wdkModel.displayName} : Query History"
                 banner="My Query History"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Query History"
                 division="query_history"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- show error messages, if any -->
<wdk:errors/>

<!-- decide whether history is empty -->
<c:choose>
  <c:when test="${wdkUser.answerCount == 0}">

<table align="center"><tr><td> *** Your history is empty *** </td></tr></table>

  </c:when>
  <c:otherwise>

<!-- show user answers grouped by RecordTypes -->

<c:set var="typeC" value="0"/>
<c:forEach items="${userAnswers}" var="recAnsEntry">
  <c:set var="rec" value="${recAnsEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(rec, 'GeneRecordClass')}"/>
  <c:set var="recAns" value="${recAnsEntry.value}"/>
  <c:set var="recDispName" value="${recAns[0].answer.question.recordClass.type}"/>

  <!-- deciding whether to show only selected sections of history -->
  <c:choose>
    <c:when test="${param.historySectionId != null && param.historySectionId != rec}">
    </c:when>
    <c:otherwise>

<c:set var="typeC" value="${typeC+1}"/>
<c:choose><c:when test="${typeC != 1}"><hr></c:when></c:choose>

<h3>${recDispName} query history</h3>

  <!-- show user answers one per line -->
  <c:set var="NAME_TRUNC" value="80"/>
  <table border="0" cellpadding="2">
      <tr class="headerRow">
          <th>ID</th> 
          <th>Query</th>
          <th>Size</th>
          <c:if test="${isGeneRec}"><th>${dsCol}</th></c:if>
          <th></th>
          <th></th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
       </tr>

      <c:set var="i" value="0"/>
      <c:forEach items="${recAns}" var="ua">
        <jsp:setProperty name="ua" property="nameTruncateTo" value="${NAME_TRUNC}"/>

        <c:choose>
          <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
          <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>

        <td>${ua.answerID}</td>
        <td>
               <c:set var="dispNam" value="${ua.name}"/>
               <c:if test="${fn:length(dispNam) > 53}">
                  <c:set var="dispNam" value="${fn:substring(dispNam, 0, 125)}..."/>
               </c:if>
               ${dispNam}
        </td>
        <td>${ua.answer.resultSize}</td>
 
           <c:if test="${isGeneRec && showOrthoLink}">
                <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${ua.answerID}&plasmodb_dataset=${ua.answer.datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <td><a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a></td>
            </c:if>
	    
            <td><a href="showSummary.do?user_answer_id=${ua.answerID}">view</a></td>
            <td><a href="downloadHistoryAnswer.do?user_answer_id=${ua.answerID}">download</a></td>

            <c:set value="${ua.answer.question.fullName}" var="qName" />
            <c:set var="isBooleanQuestion" value="${fn:containsIgnoreCase(qName, 'BooleanQuestion')}"/>
            <c:if test="${isBooleanQuestion == false}">
                <td>
		    <c:set value="${ua.answer.questionUrlParams}" var="qurlParams"/>
	            <c:set var="questionUrl" value="" />
                    <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
	            refine</a>
                </td>
	    </c:if>

            <td><a href="deleteHistoryAnswer.do?user_answer_id=${ua.answerID}">delete</a></td>
        </tr>
      <c:set var="i" value="${i+1}"/>
      </c:forEach>

      <tr>
        <c:choose>
          <c:when test="${isGeneRec && showOrthoLink}"><td colspan="7" align="left"></c:when>
          <c:otherwise><td colspan="6" align="left"></c:otherwise>
	</c:choose>
            <br>
            <html:form method="get" action="/processBooleanExpression.do">
              Combine results:
              <html:text property="booleanExpression" value=""/>
                <font size="-1">[eg: 1 or ((4 and 3) not 2)]</font><br>
              <html:hidden property="historySectionId" value="${rec}"/>
              <html:reset property="reset" value="Clear"/>
              <html:submit property="submit" value="Get Combined Result"/>
            </html:form>
          </td>
          <td colspan="1"></td></tr>

  </table>

    </c:otherwise>
  </c:choose> <!-- end of deciding sections to show -->

</c:forEach>

<table>
<tr><td><br></td></tr>
<tr><td><font face="Arial,Helvetica" size="-1">
The boolean operators AND, OR and NOT are defined as in <a href="http://www.ncbi.nlm.nih.gov/entrez/query/static/help/helpdoc.html#Boolean_Operators">NCBI Entrez</a>.
<ul>
<li>(1 AND 2) finds all genes that appear in BOTH 1 and 2 results (i.e., the intersection of 1 and 2)

<li>(1&nbsp;&nbsp;  OR 2) finds all genes that appear in EITHER 1 or 2 (i.e., the union of 1 and 2).

<li>(1 NOT 2) finds all genes that appear in result 1 BUT NOT in result 2 (i.e., the difference 1 - 2).
</ul>
</font></td></tr>
</table>


  </c:otherwise>
</c:choose> <!-- end of deciding history emptiness -->


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
