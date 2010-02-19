<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>


<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Search ---- Mouse over to read description</b></td></tr>

<c:choose>
<c:when test = "${project == 'GiardiaDB'}">
<site:queryList2 questions="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile"/>
</c:when>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList2 questions="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming,GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByPromastigoteTimeSeries"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
<site:queryList2 questions="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming"/>
</table>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
<site:queryList2 questions="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression"/>
</c:when>
<c:when test = "${project == 'TriTrypDB'}">
<site:queryList2 questions="GeneQuestions.GenesByPromastigoteTimeSeries,GeneQuestions.GenesByTbruceiTimeSeries,GeneQuestions.GenesByMicroArrPaGETcruzi,GeneQuestions.GenesByMicroArrPaGETbrucei,GeneQuestions.GenesByMicroArrPaGELmajor,GeneQuestions.GenesByMicroArr_TbDRBD3,GeneQuestions.GenesByExpressionPercentileTbrucei,GeneQuestions.GenesByExpressionPercentileTcruzi,GeneQuestions.GenesByExpressionPercentileLinfantum,GeneQuestions.GenesByExpressionPercentileBrucei5stg"/>
</c:when>
</c:choose>

</table>

</div>
