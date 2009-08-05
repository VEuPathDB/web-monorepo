<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />


 <c:choose>

<!--
    <c:when test="${projectId == 'CryptoDB' || projectId == 'ToxoDB' || projectId == 'TriTrypDB'}">
	<jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesBySageTagEvidence" /> 
    </c:when>
-->

    <c:when test="${projectId == 'GiardiaDB' || projectId == 'ToxoDB'}">
	<jsp:include page="/customPages/${projectId}/InternalQuestions.GenesBySageTagEvidence.jsp"/>
    </c:when>

  </c:choose>






