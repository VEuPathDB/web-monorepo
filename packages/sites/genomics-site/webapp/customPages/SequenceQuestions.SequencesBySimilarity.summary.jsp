<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>

<c:set value="${param['user_answer_id']}" var="uaId"/>

<!-- display page header with wdkAnswer's recordClass's type as banner -->
<c:set value="${wdkAnswer.recordClass.type}" var="wdkAnswerType"/>

<site:header title="Queries & Tools :: BLAST Result"
                 banner="${wdkAnswerType} Result [BLAST]"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="BLAST Result"
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
        <c:set value="${wdkAnswer.params}" var="params"/>
        <c:set value="${wdkAnswer.question.displayName}" var="wdkQuestionName"/>
        <tr><td valign="top" align="left"><b>Query:</b></td>
                   <td colspan="3" valign="top" align="left">${wdkQuestionName}</td></tr>
               <tr><td valign="top" align="left"><b>Parameters:</b></td>
                   <td valign="top" align="left">
                     <table>
                       <c:forEach items="${params}" var="p">
                         <c:set var="paramVal" value="${p.value}"/>
                         <c:if test="${fn:length(paramVal) > 43}">
                           <c:set var="paramVal" value="${fn:substring(paramVal, 0, 40)}..."/>
                         </c:if>
                         <tr><td align="right">${p.key}:</td><td><i>${paramVal}</i></td></tr> 
                       </c:forEach>
                     </table></td></tr>
      </c:otherwise>
    </c:choose>

  </c:otherwise>
</c:choose>

</table>

<hr>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    No results for your query
  </c:when>
  <c:otherwise>

<!-- content of blast result -->
<c:set var="wdkAnswer1" value="${wdkAnswer.clonedAnswer}"/>
<c:set var="wdkAnswer2" value="${wdkAnswer.clonedAnswer}"/>
<table width="100%" border="0" cellpadding="8" cellspacing="0">

<tr><td>
<c:forEach items="${wdkAnswer1.records}" var="record">
  <c:set var="headerI" value="${record.summaryAttributes['Header'].value}"/>
  <c:set var="footerI" value="${record.summaryAttributes['Footer'].value}"/>
  <c:if test="${ headerI != '' }">
     <c:set var="headerStr" value="${headerI}"/>
  </c:if>
  <c:if test="${ footerI != '' }">
     <c:set var="footerStr" value="${footerI}"/>
  </c:if>
</c:forEach>

<c:set var="sumSect" value=""/>
<c:forEach items="${wdkAnswer2.records}" var="record">
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

<site:footer/>
