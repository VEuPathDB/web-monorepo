<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<%-- QUESTIONS --%>
<c:set var="plasmoQuestions" value="GeneQuestions.GenesByRNASeqExpressionTiming" />
<c:set var="tritrypQuestions" value="GeneQuestions.GenesByRNASeqExpressionFoldChange,GeneQuestions.GenesByRNASeqExpressionPercentile"/>

 <c:choose>
    <c:when test="${projectId == 'PlasmoDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=${plasmoQuestions}" /> 
    </c:when>
    <c:otherwise>

${Question_Header}
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

  <c:choose>
    <c:when test="${projectId == 'TriTrypDB'}">
	<site:queryList3 columns="${columns}" questions="${tritrypQuestions}"/>
    </c:when>
    <c:otherwise>  <%-- it must be the portal --%>
	<site:queryList3 columns="${columns}" questions="${plasmoQuestions},${tritrypQuestions}"/>
    </c:otherwise>
   </c:choose>


</table>
</center>
</div>
    </c:otherwise>

</c:choose>

${Question_Footer}
