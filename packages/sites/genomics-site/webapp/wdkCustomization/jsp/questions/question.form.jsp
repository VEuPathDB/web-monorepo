<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- join the Question_Footer var in Question.jsp; as is, it was removing the footer tag
<c:set var="Question_Footer" scope="request">
	<imp:questionDescription />
</c:set>
--%>

<c:choose>
  <c:when test = "${fn:containsIgnoreCase(wdkQuestion.name, 'Blast') || fn:containsIgnoreCase(wdkQuestion.name, 'BySimilarity')}">
    <imp:blast/>
  </c:when>
  <c:otherwise>
    <imp:question/>
  </c:otherwise>
</c:choose>
