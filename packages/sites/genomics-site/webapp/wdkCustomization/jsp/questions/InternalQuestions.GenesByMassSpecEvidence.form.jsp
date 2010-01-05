<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>



<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />


 <c:choose>
    <c:when test="${projectId == 'CryptoDB' || projectId == 'GiardiaDB' || projectId == 'ToxoDB' || projectId == 'TriTrypDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByMassSpec" /> 
    </c:when>

    <c:otherwise>
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%">

<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Search ---- Mouse over to read description</b></td></tr>

	<site:queryList2 questions="GeneQuestions.GenesByMassSpec,GeneQuestions.GenesByProteomicsProfile"/>

</table>
</div>
    </c:otherwise>

</c:choose>
