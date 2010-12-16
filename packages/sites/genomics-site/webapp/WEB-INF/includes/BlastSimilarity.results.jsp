<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="wdkAnswer" value="${wdkStep.answerValue}"/>
<c:set var="qName" value="${wdkAnswer.question.fullName}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="recordName" value="${wdkAnswer.question.recordClass.fullName}" />
<c:set var="recHasBasket" value="${wdkAnswer.question.recordClass.hasBasket}" />
<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
<c:set var="answerRecords" value="${wdkAnswer.records}" />

<c:set var="strategy" value="${wdkStrategy}"/>

<c:set var="step_dataType" value="${wdkStep.displayType}" />
<c:choose>
	<c:when test="${fn:endsWith(step_dataType,'y')}">
		<c:set var="type" value="${fn:substring(step_dataType,0,fn:length(step_dataType)-1)}ies" />
	</c:when>
	<c:otherwise>
		<c:set var="type" value="${step_dataType}s" />
	</c:otherwise>	
</c:choose>

<c:set var="qsp" value="${fn:split(wdk_query_string,'&')}" />
<c:set var="commandUrl" value="" />
<c:forEach items="${qsp}" var="prm">
  <c:if test="${fn:split(prm, '=')[0] eq 'strategy'}">
    <c:set var="commandUrl" value="${commandUrl}${prm}&" />
  </c:if>
  <c:if test="${fn:split(prm, '=')[0] eq 'step'}">
    <c:set var="commandUrl" value="${commandUrl}${prm}&" />
  </c:if>
  <c:if test="${fn:split(prm, '=')[0] eq 'subquery'}">
    <c:set var="commandUrl" value="${commandUrl}${prm}&" />
  </c:if>
  <c:if test="${fn:split(prm, '=')[0] eq 'summary'}">
    <c:set var="commandUrl" value="${commandUrl}${prm}&" />
  </c:if>
</c:forEach>
<c:choose>
  <c:when test="${strategy != null}"> <%-- this is on the run page --%>
    <c:set var="commandUrl" value="${commandUrl}strategy_checksum=${strategy.checksum}" />
  </c:when>
  <c:otherwise> <%-- this is on the basket page --%>
    <c:set var="commandUrl" value="${commandUrl}from_basket=true" />
  </c:otherwise>
</c:choose>


<c:set var="commandUrl"><c:url value="/processSummary.do?${commandUrl}" /></c:set>

<c:if test="${strategy != null}">
    <wdk:filterLayouts strategyId="${strategy.strategyId}" 
                       stepId="${wdkStep.stepId}"
                       answerValue="${wdkAnswer}" />
</c:if>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${strategy != null && wdkAnswer.resultSize == 0}'>
	No results are retrieved<br><br>
  	<pre>${wdkAnswer.resultMessage}</pre>
  </c:when>
  <c:when test='${strategy == null && wdkUser.guest && wdkAnswer.resultSize == 0}'>
    Please login to use the basket
  </c:when>
  <c:when test='${strategy == null && wdkAnswer.resultSize == 0}'>
    Basket Empty
  </c:when>
  <c:otherwise>


<table width="100%"><tr>
<td class="h4left" style="vertical-align:middle;padding-bottom:7px;">
    <c:if test="${strategy != null}">
        <span id="text_strategy_number">${strategy.name}</span> 
        - step <span id="text_step_number">${strategy.length}</span> - 
    </c:if>
    <span id="text_step_count">${wdkAnswer.resultSize}</span> <span id="text_data_type">${type}</span>
</td>

<td  style="vertical-align:middle;text-align:right;white-space:nowrap;">
  <div style="float:right">
   <c:set var="r_count" value="${wdkAnswer.resultSize} ${type}" />
   <c:if test="${strategy != null}">
    <c:choose>
      <c:when test="${wdkUser.guest}">
        <c:set var="basketClick" value="popLogin();setFrontAction('basketStep');" />
      </c:when>
      <c:otherwise>
        <c:set var="basketClick" value="updateBasket(this, '${wdkStep.stepId}', '0', '${modelName}', '${recordName}');" />
      </c:otherwise>
    </c:choose>
    <c:if test="${recHasBasket}"><a id="basketStep" style="font-size:120%" href="javascript:void(0)" onClick="${basketClick}"><b>Add ${r_count} to Basket</b></a>&nbsp;|&nbsp;</c:if>
   </c:if>
    <a style="font-size:120%" href="downloadStep.do?step_id=${wdkStep.stepId}"><b>Download ${r_count}</b></a>
  <c:if test="${!empty sessionScope.GALAXY_URL}">
    &nbsp;|&nbsp;<a href="downloadStep.do?step_id=${wdkStep.stepId}&wdkReportFormat=tabular"><b>SEND TO GALAXY</b></a>
  </c:if>
  </div>
</td>
</tr></table>



<!-- content of blast result -->
<table width="100%" border="0" cellpadding="8" cellspacing="0">

<tr><td>


<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="headerI" value="${record.summaryAttributes['Header'].value}"/>
  <c:set var="footerI" value="${record.summaryAttributes['Footer'].value}"/>
  <c:if test="${ headerI != null }">
     <c:set var="headerStr" value="${headerI}"/>
  </c:if>
  <c:if test="${ footerI != null }">
     <c:set var="footerStr" value="${footerI}"/>
  </c:if>
</c:forEach>

<c:set var="junk" value="${wdkAnswer.resetAnswerRowCursor}"/>

<c:set var="sumSect" value=""/>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="tabRow" value="${record.summaryAttributes['TabularRow'].value}"/>
  <c:set var="tabRow" value="${fn:trim(tabRow)}"/>
  <c:set var="sumSect" value="${sumSect}<br>${tabRow}"/>
</c:forEach>
<PRE>${headerStr}${sumSect}</PRE>

<c:set var="junk" value="${wdkAnswer.resetAnswerRowCursor}"/>
<br>

<c:set var="algnSect" value=""/>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="algn" value="${record.summaryAttributes['Alignment'].value}"/>
  <c:set var="algnSect" value="${algnSect}${algn}"/>
</c:forEach>
<PRE>${algnSect}${footerStr}</PRE>


</td></tr>
</table>



  </c:otherwise>
</c:choose>

