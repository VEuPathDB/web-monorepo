<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set value="${param['user_answer_id']}" var="uaId"/>
<c:set value="${requestScore.userAnswerId}" var="altUaId"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb')}" />

<!-- display page header with wdkAnswer's recordClass's type as banner -->
<c:set value="${wdkAnswer.recordClass.type}" var="wdkAnswerType"/>

<site:header title="Queries & Tools :: Summary Result"
                 banner="${wdkAnswerType} Results"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                  divisionName="Summary Result"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<!-- display question and param values and result size for wdkAnswer -->
<table>

<c:choose>
  <c:when test="${wdkAnswer.isCombinedAnswer}">
    <!-- combined answer from history boolean expression -->
    <tr><td valign="top" align="left"><b>Combined Answer:</b></td>
        <td valign="top" align="left">${wdkAnswer.userAnswerName}</td></tr>
  </c:when>
  <c:otherwise>

    <c:choose>
      <c:when test="${wdkAnswer.isBoolean}">
      <!-- boolean question -->

        <tr><td valign="top" align="left"><b>Expanded Question:</b></td>
            <td valign="top" align="left">
              <nested:root name="wdkAnswer">
                <jsp:include page="/WEB-INF/includes/bqShowNode.jsp"/>
              </nested:root>
            </td></tr>
      </c:when>
      <c:otherwise>
        <!-- simple question -->
        <c:set value="${wdkAnswer.internalParams}" var="params"/>
        <c:set value="${wdkAnswer.question.paramsMap}" var="qParamsMap"/>
        <c:set value="${wdkAnswer.question.displayName}" var="wdkQuestionName"/>
        <tr><td valign="top" align="left"><b>Query:</b></td>
                   <td colspan="3" valign="top" align="left">${wdkQuestionName}</td></tr>
               <tr><td valign="top" align="left"><b>Parameters:</b></td>
                   <td valign="top" align="left">
                     <table>
                       <c:forEach items="${qParamsMap}" var="p">
                         <c:set var="pNam" value="${p.key}"/>
                         <c:set var="qP" value="${p.value}"/>
                         <c:set var="aP" value="${params[pNam]}"/>
                         <c:if test="${qP.isVisible}">
                           <tr><td align="right">${qP.prompt}:</td><td><i>${aP}</i></td></tr>
                         </c:if>
                       </c:forEach>
                     </table></td></tr>
      </c:otherwise>
    </c:choose>

  </c:otherwise>
</c:choose>

       <tr><td valign="top" align="left"><b>Results:</b></td>
           <td valign="top" align="left">
               ${wdkAnswer.resultSize}
               <c:if test="${wdkAnswer.resultSize > 0}">
               (showing ${wdk_paging_start} to ${wdk_paging_end})</c:if></td></tr>
       <tr><td>&nbsp;</td>
           <td align="left">
               <c:choose>
                   <c:when test="${uaId == null}">
                       <a href="downloadConfig.jsp?user_answer_id=${altUaId}">
                   </c:when>
                   <c:otherwise>
                       <a href="downloadHistoryAnswer.do?user_answer_id=${uaId}">
                   </c:otherwise>
               </c:choose>
               Download</a>&nbsp;|&nbsp;
               <a href="<c:url value="/showQueryHistory.do"/>">Combine with other results</a>
	       
               <c:set value="${wdkAnswer.recordClass.fullName}" var="rsName"/>
               <c:set var="isGeneRec" value="${fn:containsIgnoreCase(rsName, 'GeneRecordClass')}"/>
	       <c:if test="${isGeneRec && showOrthoLink}">
	           &nbsp;|&nbsp;
                   <c:set var="datasetId" value="${wdkAnswer.datasetId}"/>
                   <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${uaId}&plasmodb_dataset=${datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
                   <a href='<c:url value="${dsColUrl}"/>'>Orthologs</a>
               </c:if>
	       
               <c:set value="${wdkAnswer.question.fullName}" var="qName" />
               <c:set var="isBooleanQuestion" value="${fn:containsIgnoreCase(qName, 'BooleanQuestion')}"/>
	       <c:if test="${isBooleanQuestion == false}">
	           &nbsp;|&nbsp;
                   <c:set value="${wdkAnswer.questionUrlParams}" var="qurlParams"/>
	           <c:set var="questionUrl" value="" />
                   <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
	           Refine query</a>
	       </c:if>
           </td></tr>
</table>


<hr>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    No results for your query
  </c:when>
  <c:otherwise>

<!-- pager -->
<pg:pager isOffset="true"
          scope="request"
          items="${wdk_paging_total}"
          maxItems="${wdk_paging_total}"
          url="${wdk_paging_url}"
          maxPageItems="${wdk_paging_pageSize}"
          export="currentPageNumber=pageNumber">
  <c:forEach var="paramName" items="${wdk_paging_params}">
    <pg:param name="${paramName}" id="pager" />
  </c:forEach>
  <!-- pager on top -->
  <wdk:pager /> 

<!-- content of current page -->
<table width="100%" border="0" cellpadding="8" cellspacing="0">
<tr class="headerRow">

<c:forEach items="${wdkAnswer.summaryAttributes}" var="sumAttrib">
    <th align="left">${sumAttrib.displayName}</th>
 </c:forEach>

<c:set var="i" value="0"/>
<c:forEach items="${wdkAnswer.records}" var="record">

<c:choose>
  <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
  <c:otherwise><tr class="rowMedium"></c:otherwise>
</c:choose>

  <c:set var="j" value="0"/>

  <c:forEach items="${wdkAnswer.summaryAttributeNames}" var="sumAttrName">
  <c:set value="${record.summaryAttributes[sumAttrName]}" var="recAttr"/>
 
    <td>
    <c:set var="recNam" value="${record.recordClass.fullName}"/>
    <c:set var="fieldVal" value="${recAttr.briefValue}"/>
    <c:choose>
      <c:when test="${j == 0}">

	<!-- modified by Jerric -->
      <!-- <a href="showRecord.do?name=${recNam}&id=${record.primaryKey}">${fieldVal}</a> -->
	<c:set value="${record.primaryKey}" var="primaryKey"/>
        <a href="showRecord.do?name=${recNam}&project_id=${primaryKey.projectId}&primary_key=${primaryKey.recordId}">${fieldVal}</a>
      </c:when>
      <c:otherwise>

        <!-- need to know if fieldVal should be hot linked -->
        <c:choose>
          <c:when test="${recAttr.value.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
            <a href="${recAttr.value.url}">${recAttr.value.visible}</a>
          </c:when>
          <c:otherwise>
            ${fieldVal}
          </c:otherwise>
        </c:choose>

      </c:otherwise>
    </c:choose>
    </td>
    <c:set var="j" value="${j+1}"/>

  </c:forEach>
</tr>
<c:set var="i" value="${i+1}"/>
</c:forEach>

</tr>
</table>

<br>

  <!-- pager at bottom -->
  <wdk:pager />
</pg:pager>

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
