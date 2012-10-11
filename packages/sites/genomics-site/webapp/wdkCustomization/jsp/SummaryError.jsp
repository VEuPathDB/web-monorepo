<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- 
   there are four attributes set by the showSummary action:
   - questionDisplayName: the display name of the question; if the question doesn't
     exist in the current model, the question's full name will be used
   - customName: the custom name for this history; if the custom name doesn't exist, 
     corresponding question's display name will be used; if no corresponding question,
     the questionFullName will be used; 
   - params: a map of paramName-paramValue tuples;
   - paramNames: a map of paramName-paramDisplayName tuples;
--%>

<c:choose>
  <c:when test="${resultOnly}">
    <imp:pageFrame refer="summaryError" title="Query cannot be executed">
      <imp:summaryError/>
    </imp:pageFrame>
  </c:when>
  <c:otherwise>
    <imp:summaryError/>
  </c:otherwise>
</c:choose>

