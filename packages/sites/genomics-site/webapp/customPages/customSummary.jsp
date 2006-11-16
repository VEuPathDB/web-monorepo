<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<!-- get wdkAnswer from requestScope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set value="${requestScope.wdkHistory}" var="history"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="historyId" value="${param['wdk_history_id']}"/>
<c:if test="${historyId == null}">
    <c:set var="historyId" value="${requestScope.wdk_history_id}"/>
</c:if>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb')}" />

<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apiModel')}" />

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
<table border="0" cellspacing="5">

    <!-- display query name -->
    <tr>
       <td valign="top" align="right" width="10" nowrap><b>Query:</b></td>
       <td valign="top" align="left" style="padding-left: 40px;">${wdkAnswer.question.displayName}</td>
    </tr>

    <!-- display parameters -->
    <tr>
       <td valign="top" align="left" width="10" nowrap><b>Parameters:</b></td>
       <c:choose>
       <c:when test="${history.boolean}">
          <td>
              <!-- boolean question -->
              <nested:root name="wdkAnswer">
                 <jsp:include page="/WEB-INF/includes/bqShowNode.jsp"/>
              </nested:root>
	   </td>
        </c:when>
        <c:otherwise>
	   <td style="padding-left: 40px;">
              <!-- simple question -->
              <c:set value="${wdkAnswer.internalParams}" var="params"/>
              <c:set value="${wdkAnswer.question.paramsMap}" var="qParamsMap"/>
              <c:set value="${wdkAnswer.question.displayName}" var="wdkQuestionName"/>
              <table>
                 <c:forEach items="${qParamsMap}" var="p">
                    <c:set var="pNam" value="${p.key}"/>
                    <c:set var="qP" value="${p.value}"/>
                    <c:set var="aP" value="${params[pNam]}"/>
                    <c:if test="${qP.isVisible}">
                       <tr>
                          <td align="right"><i>${qP.prompt}</i></td>
                          <td>&nbsp;:&nbsp;</td>
                          <td>${aP}</td>
                       </tr>
                    </c:if>
                 </c:forEach>
              </table>
           </td>
         </c:otherwise>
       </c:choose>
    </tr>
    
    <!-- display result size -->
    <tr>
       <td valign="top" align="right" width="10" nowrap><b>Results:</b></td>
       <td valign="top" align="left" style="padding-left: 40px;">
          ${wdkAnswer.resultSize}
          <c:if test="${wdkAnswer.resultSize > 0}">
             (showing ${wdk_paging_start} to ${wdk_paging_end})
             <c:if test="${dispModelName eq 'ApiDB'}">
                 <site:apidbSummary/>
             </c:if>
          </c:if>
       </td>
    </tr>
    <tr>
       <td colspan="2" align="left">
           <a href="downloadHistoryAnswer.do?wdk_history_id=${historyId}">
               Download</a>&nbsp;|&nbsp;
           <a href="<c:url value="/showQueryHistory.do"/>">Combine with other results</a>
	       
           <c:set value="${wdkAnswer.recordClass.fullName}" var="rsName"/>
           <c:set var="isGeneRec" value="${fn:containsIgnoreCase(rsName, 'GeneRecordClass')}"/>
	       <c:if test="${isGeneRec && showOrthoLink}">
	           &nbsp;|&nbsp;
               <c:set var="datasetId" value="${wdkAnswer.datasetId}"/>
               <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${wdkUser.signature}:${historyId}&plasmodb_dataset=${datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
               <a href='<c:url value="${dsColUrl}"/>'>Orthologs</a>
           </c:if>
	       
               <c:set value="${wdkAnswer.question.fullName}" var="qName" />
	       <c:if test="${history.boolean == false}">
	           &nbsp;|&nbsp;
                   <c:set value="${wdkAnswer.questionUrlParams}" var="qurlParams"/>
	           <c:set var="questionUrl" value="" />
                   <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
	           Revise query</a>
	       </c:if>
       </td>
    </tr>
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
  <wdk:pager pager_id="top"/> 

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

<c:choose>
<c:when test="${dispModelName eq 'ApiDB'}">

  <c:set value="${record.primaryKey}" var="primaryKey"/>
<c:choose>
        <c:when test = "${primaryKey.projectId == 'cryptodb'}">
           <a href="http://qa.cryptodb.org/cryptodb/showRecord.do?name=${recNam}&project_id=&primary_key=${primaryKey.recordId}" target="cryptodb">CryptoDB:${primaryKey.recordId}</a>
        </c:when>
        <c:when test = "${primaryKey.projectId=='plasmodb'}" >
           <a href="http://qa.plasmodb.org/plasmo/showRecord.do?name=${recNam}&project_id=&primary_key=${primaryKey.recordId}"  target="plasmodb">PlasmoDB:${primaryKey.recordId}</a>
        </c:when>
        <c:when test = "${primaryKey.projectId=='toxodb'}" >
            <a href="http://qa.toxodb.org/toxo/showRecord.do?name=${recNam}&project_id=&primary_key=${primaryKey.recordId}"  target="toxodb">ToxoDB:${primaryKey.recordId}</a>
 </c:when>
</c:choose>

</c:when>
<c:otherwise>

	<!-- modified by Jerric -->
      <!-- <a href="showRecord.do?name=${recNam}&id=${record.primaryKey}">${fieldVal}</a> -->
	<c:set value="${record.primaryKey}" var="primaryKey"/>
        <a href="showRecord.do?name=${recNam}&project_id=${primaryKey.projectId}&primary_key=${primaryKey.recordId}">${fieldVal}</a>

</c:otherwise>
</c:choose>


      </c:when>   <%-- when j=0 --%>
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
  <wdk:pager pager_id="bottom"/>
</pg:pager>

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
