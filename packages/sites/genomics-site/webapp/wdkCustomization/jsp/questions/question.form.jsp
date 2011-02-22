<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="Question_Footer" scope="request">
<%-- displays question description, can be overridden by the custom question form --%>
<site:questionDescription />
</c:set>


<c:choose>
  <c:when test = "${fn:containsIgnoreCase(wdkQuestion.name, 'Blast') || fn:containsIgnoreCase(wdkQuestion.name, 'BySimilarity')}">
    <site:blast/>
  </c:when>
  <c:otherwise>
    <site:question/>
  </c:otherwise>
</c:choose>
