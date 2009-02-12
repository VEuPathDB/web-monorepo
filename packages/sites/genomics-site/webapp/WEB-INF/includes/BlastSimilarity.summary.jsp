<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<!-- get wdkAnswer from requestScope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="strategy" value="${requestScope.wdkStrategy}"/>
<c:set var="step" value="${requestScope.wdkHistory}"/>
<c:set var="stepId" value="${step.stepId}"/>
<c:set var="wdkAnswer" value="${requestScope.wdkAnswer}"/>
<c:set var="qName" value="${wdkAnswer.question.fullName}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="summaryUrl" value="${wdk_summary_url}" />
<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>


<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb')}" />

<c:set var="global" value="${wdkUser.globalPreferences}"/>
<c:set var="showParam" value="${global['preference_global_show_param']}"/>

<!-- display page header with wdkAnswer's recordClass's type as banner -->
<c:set value="${wdkAnswer.recordClass.type}" var="wdkAnswerType"/>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    <pre>${wdkAnswer.resultMessage}</pre>
  </c:when>
  <c:otherwise>

<h2><table width="100%"><tr><td><span id="text_strategy_number">${strategy.name}</span> 
    (step <span id="text_step_number">${strategy.length}</span>) 
    - ${wdkAnswer.resultSize} <span id="text_data_type">${type}</span></td><td align="right"><a href="downloadStep.do?step_id=${wdkHistory.stepId}">Download Result</a></td></tr></table>
</h2>

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

  <%-- as required in federated context, the blast webservice plugin will do the record linking instead --%>
  <%--
  <c:set var="tabRowFields" value="${fn:split(tabRow, ' ')}"/>
  <c:set var="f1" value="${tabRowFields[0]}"/>
  <c:set var="f2" value="${fn:substringAfter(tabRow, f1)}"/>
  <c:set var="recNam" value="${record.recordClass.fullName}"/>
  <c:set var="projId" value="${record.primaryKey.projectId}"/>
  <c:set var="recUrl" value="showRecord.do?name=${recNam}&project_id=${projId}&primary_key=${f1}"/>
  <c:set var="sumSect" value="${sumSect}<br><a href='${recUrl}'>${f1}</a>${f2}"/>
  --%>

  <c:set var="sumSect" value="${sumSect}<br>${tabRow}"/>
</c:forEach>
<PRE>${headerStr}${sumSect}</PRE>

<c:set var="junk" value="${wdkAnswer.resetAnswerRowCursor}"/>

<c:set var="algnSect" value=""/>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="algn" value="${record.summaryAttributes['Alignment'].value}"/>

  <%-- as required in federated context, the blast webservice plugin will do the record linking instead --%>
  <%--
  <c:set var="recNam" value="${record.recordClass.fullName}"/>
  <c:set var="recId" value="${record.primaryKey.recordId}"/>
  <c:set var="projId" value="${record.primaryKey.projectId}"/>
  <c:set var="recUrl" value="showRecord.do?name=${recNam}&project_id=${projId}&primary_key=${recId}"/>
  <c:set var="recLink" value="<a href='${recUrl}'>${recId}</a>"/>
  <c:set var="algnSect" value="${algnSect}${fn:replace(algn, recId, recLink)}"/>
  --%>

  <c:set var="algnSect" value="${algnSect}${algn}"/>
</c:forEach>
<PRE>${algnSect}${footerStr}</PRE>


</td></tr>
</table>

  </c:otherwise>
</c:choose>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table>
