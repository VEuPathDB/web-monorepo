<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="answer" value="${requestScope.dataSourceAnswer}"/>
<c:set var="question" value="${requestScope.question}" />
<c:set var="recordClass" value="${requestScope.recordClass}" />
<c:set var="reference">
  <c:choose>
    <c:when test="${question != null}">?question=${question}</c:when>
    <c:when test="${recordClass != null}">?recordClass=${recordClass}</c:when>
    <c:otherwise></c:otherwise>
  </c:choose>
</c:set>

<!-- show all xml question sets -->
<UL>
  <c:forEach items="${answer.records}" var="record">
    <c:set var="primaryKey" value="${record.primaryKey}"/>
    <c:set var="attributes" value="${record.attributes}"/>
    <c:set var="displayName" value="${attributes['display_name']}" />
    <LI><a href="getDataSource.do${reference}#${primaryKey.value}">${displayName.value}</a></LI>
    </c:forEach>
  </c:forEach>
</UL>
