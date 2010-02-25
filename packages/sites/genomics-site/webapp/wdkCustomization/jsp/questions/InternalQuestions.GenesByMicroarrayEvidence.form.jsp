<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

${Question_Header}
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%">

<c:set value="2" var="columns"/>

<c:set var="giardiaQuestions" value="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile" />

<c:set var="plasmoQuestions" value="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming" />

<c:set var="toxoQuestions" value="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression" />

<c:set var="tritrypQuestions" value="GeneQuestions.GenesByPromastigoteTimeSeries,GeneQuestions.GenesByExpressionPercentileLinfantum,GeneQuestions.GenesByMicroArrPaGELmajor,GeneQuestions.GenesByMicroArr_TbDRBD3,GeneQuestions.GenesByTbruceiTimeSeries,GeneQuestions.GenesByExpressionPercentileTbrucei,GeneQuestions.GenesByMicroArrPaGETbrucei,GeneQuestions.GenesByExpressionPercentileBrucei5stg,GeneQuestions.GenesByMicroArrPaGETcruzi,GeneQuestions.GenesByExpressionPercentileTcruzi" />

<tr class="headerRow"><td colspan="${columns}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<c:choose>
<c:when test = "${project == 'GiardiaDB'}">
<site:queryList2 columns="${columns}" questions="${giardiaQuestions}"/>
</c:when>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList3 columns="${columns}" questions="${giardiaQuestions},${plasmoQuestions},${toxoQuestions},${tritrypQuestions}"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
<site:queryList3 columns="${columns}" questions="${plasmoQuestions}"/>
</table>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
<site:queryList2 columns="${columns}" questions="${toxoQuestions}"/>
</c:when>
<c:when test = "${project == 'TriTrypDB'}">
<site:queryList3 columns="${columns}" questions="${tritrypQuestions}"/>
</c:when>
</c:choose>

</table>

</div>

${Question_Footer}
