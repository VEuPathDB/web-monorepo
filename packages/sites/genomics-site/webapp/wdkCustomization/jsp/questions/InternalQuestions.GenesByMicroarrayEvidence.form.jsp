<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

${Question_Header}

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<wdk:errors/>

<div id="form_question">
  <center>
    <table width="90%">
<c:set value="2" var="columns"/>

<c:set var="giardiaQuestions" value="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,GeneQuestions.GenesByRingqvistFoldChange,GeneQuestions.GenesByRingqvistPercentile" />

<c:set var="plasmoQuestions" value="GeneQuestions.GenesByExpressionTiming,InternalQuestions.GenesByIntraerythrocyticExpression,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming" />

<c:set var="toxoQuestions" value="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression" />

<c:set var="tritrypQuestions" value="GeneQuestions.GenesByPromastigoteTimeSeries,GeneQuestions.GenesByExpressionPercentileLinfantum,GeneQuestions.GenesByMicroArrPaGETcruzi,GeneQuestions.GenesByExpressionPercentileTcruzi,GeneQuestions.GenesByTbruceiTimeSeries,GeneQuestions.GenesByExpressionPercentileTbrucei,GeneQuestions.GenesByMicroArrPaGETbrucei,GeneQuestions.GenesByExpressionPercentileBrucei5stg,GeneQuestions.GenesByMicroArr_TbDRBD3,GeneQuestions.GenesByMicroArrPaGELmajor" />

   <tr class="headerRow">
      <td colspan="${columns + 2}" align="center">
        <b>Choose a Search</b>
        <br>
        <i style="font-size:80%">Mouse over to read description</i>
      </td>
    </tr>

<c:choose>
  <c:when test = "${project == 'GiardiaDB'}">
    <site:queryList3 columns="${columns}" questions="${giardiaQuestions}"/>
  </c:when>
  <c:when test = "${project == 'EuPathDB'}">
    <site:queryList3 columns="${columns}" questions="${giardiaQuestions},${plasmoQuestions},${toxoQuestions},${tritrypQuestions}"/>
  </c:when>
  <c:when test = "${project == 'PlasmoDB'}">
    <site:queryList3  columns="${columns}"  questions="${plasmoQuestions}"/>
  </c:when>
  <c:when test = "${project == 'ToxoDB'}">
    <site:queryList3 columns="${columns}" questions="${toxoQuestions}"/>
  </c:when>
  <c:when test = "${project == 'TriTrypDB'}">
    <site:queryList3 columns="${columns}" questions="${tritrypQuestions}"/>
  </c:when>
</c:choose>
    </table>
  </center>
</div>

${Question_Footer}
