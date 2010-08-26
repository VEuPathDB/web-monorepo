<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<%-- QUESTIONS --%>
<c:set var="amoebaQuestions" value="GeneQuestions.GenesByEHistolyticaExpressionTiming" />


 <c:choose>
    <c:when test="${projectId == 'AmoebaDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=${amoebaQuestions}" /> 
    </c:when>
    <c:otherwise>


${Question_Header}

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<wdk:errors/>

<div id="form_question">

<center><table width="90%">
     
<c:set value="2" var="columns"/>    <%-- affects display of questions --%>

<c:set var="giardiaQuestions" value="G.l.study:Stress Response (Hehl),GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,G.l.study:Encystation (Hehl),GeneQuestions.GiardiaGenesByDifferentialExpressionTwo,GeneQuestions.GiardiaGenesByExpressionPercentileProfileTwo,GeneQuestions.GiardiaGenesFoldChangeTwo,G.l.study:Host Parasite Interaction (Svard),GeneQuestions.GenesByRingqvistFoldChange,GeneQuestions.GenesByRingqvistPercentile" />

<c:set var="plasmoQuestions" value="P.f.study:Intraerythrocytic Infection Cycle (DeRisi),GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,P.f.study:Profiling of the Malaria Parasite Life Cycle (Winzeler),InternalQuestions.GenesByIntraerythrocyticExpression,P.f.study:Sexual Development - Gametocyte (Winzeler),InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExpression,P.f.study:Invasion Pathways (Cowman),GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByExpressionPercentileA,P.f.study:Sir2 Paralogues cooperate to Regulate Virulence Genes (Cowman),GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,P.f.study:Chloroquine Selected Mutations in the crt gene (Su),GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,P.b.study:Regulation of Sexual Development (Waters),GeneQuestions.GenesByWatersDifferentialExpression,P.b.study:Plasmodium Life Cycle Survey (Waters),GeneQuestions.BergheiGenesByExpressionPercentile,P.y.study:Parasite Liver Stages Survey (Kappe),GeneQuestions.GenesByKappeFoldChange,P.v.study:Intraerythrocytic Infection Cycle (Carlton),GeneQuestions.GenesByVivaxExpressionTiming" />


<c:set var="toxoQuestions" value="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression,GeneQuestions.GenesByToxoCellCycleFoldChange,GeneQuestions.GenesByToxoCellCycleSpline,GeneQuestions.GenesByToxoProfileSimilarity,GeneQuestions.ToxoGenesByExpressionPercentile" />

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
    <site:queryList4 columns="${columns}" questions="${giardiaQuestions}"/>
  </c:when>
  <c:when test = "${project == 'EuPathDB'}">
    <site:queryList4 columns="${columns}" questions="${amoebaQuestions},${giardiaQuestions},${plasmoQuestions},${toxoQuestions},${tritrypQuestions}"/>
  </c:when>
  <c:when test = "${project == 'PlasmoDB'}">
    <site:queryList4  columns="${columns}"  questions="${plasmoQuestions}"/>
  </c:when>
  <c:when test = "${project == 'ToxoDB'}">
    <site:queryList4 columns="${columns}" questions="${toxoQuestions}"/>
  </c:when>
  <c:when test = "${project == 'TriTrypDB'}">
    <site:queryList4 columns="${columns}" questions="${tritrypQuestions}"/>
  </c:when>
</c:choose>
    

</table></center>

</div>


 </c:otherwise>
</c:choose>


${Question_Footer}
