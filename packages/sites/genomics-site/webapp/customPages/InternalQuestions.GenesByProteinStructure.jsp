<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />


<c:choose>
<c:when test="${projectId == 'GiardiaDB' || projectId == 'TrichDB' }">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByProteinStructure" /> 
    </c:when>
<c:otherwise>
	<jsp:include page="/customPages/${projectId}/InternalQuestions.GenesByProteinStructure.jsp"/>
</c:otherwise>
</c:choose>







