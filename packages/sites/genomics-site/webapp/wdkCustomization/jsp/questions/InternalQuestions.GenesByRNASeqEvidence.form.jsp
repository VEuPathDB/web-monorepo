<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>

<%-- QUESTIONS --%>
<c:set var="plasmoQuestions" value="P.f.study:Field Parasites from Pregnant Women and Children (Duffy),GeneQuestions.GenesByRNASeqPfExpressionFoldChange,P.f.study:Post Infection Time Series (Stunnenberg),GeneQuestions.GenesByRNASeqPfRBCFoldChange,GeneQuestions.GenesByRNASeqPfRBCExprnPercentile,P.f.study:Intraerythrocytic infection cycle (Newbold/Llinas),GeneQuestions.GenesByRNASeqExpressionTiming" />
<c:set var="tritrypQuestions" value="GeneQuestions.GenesByRNASeqExpressionFoldChange,GeneQuestions.GenesByRNASeqExpressionPercentile"/>
<c:set var="toxoQuestions" value="GeneQuestions.GenesByTgVegRNASeqExpressionFoldChange,GeneQuestions.GenesByTgVegRNASeqExpressionPercentile"/>



${Question_Header}
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

  <c:choose>
    <c:when test="${projectId == 'PlasmoDB'}">
      <site:queryList4 columns="${columns}" questions="${plasmoQuestions}"/>
    </c:when>    
    <c:when test="${projectId == 'TriTrypDB'}">
      <site:queryList3 columns="${columns}" questions="${tritrypQuestions}"/>
    </c:when>
    <c:when test="${projectId == 'ToxoDB'}">
      <site:queryList3 columns="${columns}" questions="${toxoQuestions}"/>
    </c:when>
    <c:otherwise>  <%-- it must be the portal --%>
      <site:queryList4 columns="${columns}" questions="${plasmoQuestions},${tritrypQuestions},${toxoQuestions}"/>
    </c:otherwise>
   </c:choose>


</table>
</center>
</div>

${Question_Footer}
