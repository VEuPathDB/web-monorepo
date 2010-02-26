<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>



<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />


 <c:choose>
    <c:when test="${projectId == 'TriTrypDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByRNASeqExpressionFoldChange" /> 
    </c:when>
    <c:when test="${projectId == 'PlasmoDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByRNASeqExpressionTiming" /> 
    </c:when>
    <c:otherwise>


${Question_Header}
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%">
<c:set value="1" var="columns"/>
<tr class="headerRow"><td colspan="${columns}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

	<site:queryList2 columns="${columns}" questions="GeneQuestions.GenesByRNASeqExpressionFoldChange,GeneQuestions.GenesByRNASeqExpressionTiming"/>

</table>
</div>
    </c:otherwise>

</c:choose>

${Question_Footer}
