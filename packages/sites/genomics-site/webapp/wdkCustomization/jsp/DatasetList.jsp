<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="datasets" value="${requestScope.datasets}"/>
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
  <c:forEach items="${datasets}" var="category">
    <li>
      <span class="category">${category.key}</span>
      <ul>
        <c:forEach items="${category.value}" var="record">
          <c:set var="primaryKey" value="${record.primaryKey}"/>
          <c:set var="attributes" value="${record.attributes}"/>
          <c:set var="displayName" value="${attributes['display_name']}" />
          <LI><a href="getDataset.do${reference}#${primaryKey.value}">${displayName.value}</a></LI>
        </c:forEach>
      </ul>
    </li>
  </c:forEach>
</UL>
