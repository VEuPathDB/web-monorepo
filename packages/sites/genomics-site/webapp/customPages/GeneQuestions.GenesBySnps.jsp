<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />
<c:set var="partial" value="${requestScope.partial}" />

 <c:choose>
   
    <c:when test="${projectId == 'EuPathDB'}">
		<c:choose>
			<c:when test="${partial == true}">
				<jsp:include page="/customPages/${projectId}/GeneQuestions.GenesBySnps.partial.jsp"/>
			</c:when>
			<c:otherwise>
				<jsp:include page="/customPages/${projectId}/GeneQuestions.GenesBySnps.jsp"/>
			</c:otherwise>
		</c:choose>
    </c:when>
    <c:otherwise>
		<jsp:include page="/customPages/customQuestion.jsp"/>
    </c:otherwise>

  </c:choose>






