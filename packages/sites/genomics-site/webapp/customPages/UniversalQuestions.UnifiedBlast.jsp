<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<c:set var="partial" value="${requestScope.partial}" />

<c:choose>
  <c:when test="${partial}">
    <site:blast />
  </c:when>
  <c:otherwise>
    <site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
    <site:blast />
    <site:footer />
  </c:otherwise>
</c:choose>


