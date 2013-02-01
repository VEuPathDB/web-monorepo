<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordName" value="${wdkQuestion.recordClass.displayName}"/>
<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<imp:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">

<table width="100%">

<c:set value="1" var="columns"/>

<tr class="headerRow"><td colspan="${columns +2 }" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

 <c:choose>
    <c:when test="${projectId == 'PlasmoDB' || projectId == 'EuPathDB'}">
	<imp:queryList columns="${columns}" questions="GeneQuestions.GenesByMassSpec,GeneQuestions.GenesByProteomicsProfile"/>
    </c:when>
    <c:otherwise>
	<imp:queryList columns="${columns}" questions="GeneQuestions.GenesByMassSpec"/>
    </c:otherwise>
</c:choose>

</table>

</div>



