
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<%-- QUESTIONS --%>
<%-- 	study is a keyword --if the questionset name contains "study" we will revise this....
	when the keyword "study" is found, queryList4.tag will make a new row
	a study belongs to an organism and contains questions, 
	questions will be displayed in columns --number of columns is determined below
	several studies can belong to the same organism 
	queryList4.tag contains the organism mapping (from E.hi to Entamoeba histolytica, etc)
	of this becomes difficult to maintain, we would show acronyms.
--%>

<c:set var="amoebaQuestions" value="E.hi.study:Colonization-Invasion and Stage Conversion (Gilchrist),GeneQuestions.GenesByEHistolyticaExpressionTiming" />

<c:set var="giardiaQuestions" value="G.l.study:Stress Response (Hehl),GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,G.l.study:Encystation (Hehl),GeneQuestions.GiardiaGenesByDifferentialExpressionTwo,GeneQuestions.GiardiaGenesByExpressionPercentileProfileTwo,GeneQuestions.GiardiaGenesFoldChangeTwo,G.l.study:Host Parasite Interaction (Svard),GeneQuestions.GenesByRingqvistFoldChange,GeneQuestions.GenesByRingqvistPercentile" />

<c:set var="plasmoQuestions" value="P.f.study:Intraerythrocytic Infection Cycle (DeRisi),GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,P.f.study:Profiling of the Malaria Parasite Life Cycle (Winzeler),InternalQuestions.GenesByIntraerythroExprFoldChange,InternalQuestions.GenesByIntraerythrocyticExpression,P.f.study:Sexual Development - Gametocyte (Winzeler),InternalQuestions.GenesByExtraerythroExprFoldChange,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExprFoldChange,GeneQuestions.GenesByGametocyteExpression,P.f.study:Invasion Pathways (Cowman),GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByExpressionPercentileA,P.f.study:Sir2 Paralogues cooperate to Regulate Virulence Genes (Cowman),GeneQuestions.GenesByCowmanSir2FoldChange,GeneQuestions.GenesByCowmanSir2Percentile,P.f.study:Chloroquine Selected Mutations in the crt gene (Su),GeneQuestions.GenesBySuCqPage,GeneQuestions.GenesBySuCqPercentile,P.b.study:Regulation of Sexual Development (Waters),GeneQuestions.GenesByWatersDifferentialExpression,P.b.study:Plasmodium Life Cycle Survey (Waters),GeneQuestions.BergheiGenesByExpressionPercentile,P.y.study:Parasite Liver Stages Survey (Kappe),GeneQuestions.GenesByKappeFoldChange,P.v.study:Intraerythrocytic Infection Cycle (Carlton),GeneQuestions.GenesByVivaxExpressionTiming" />

<c:set var="toxoQuestions" value="T.g.study:3 archetypal T. gondii lineages (Roos),GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,T.g.study:Bradyzoite Induction Time Series (Roos/Boothroyd/White),GeneQuestions.GenesByTimeSeriesFoldChangeBradyRoos,GeneQuestions.GenesByTimeSeriesFoldChangeBradyFl,GeneQuestions.GenesByTimeSeriesFoldChangeBradyBoothroyd,GeneQuestions.ToxoGenesByDifferentialMeanExpression,GeneQuestions.ToxoGenesByExpressionPercentile,T.g.study:Tachyzoite Cell Cycle (White),GeneQuestions.GenesByToxoCellCycleFoldChange,GeneQuestions.GenesByToxoCellCyclePercentile,GeneQuestions.GenesByToxoProfileSimilarity,T.g.study:Oocyst/Tachyzoite/Bradyzoite Development (Boothroyd/Conrad),GeneQuestions.GenesByToxoFoldChangeBoothroyd,GeneQuestions.GenesByExpressionPercentileBoothroyd" />

<c:set var="tritrypQuestions" value="L.d.study:Promastigote to Amastigote Differentiation Time Series (Myler),GeneQuestions.GenesByPromastigoteTimeSeries,GeneQuestions.GenesByExpressionPercentileLinfantum,L.i.study: Axenic vs Intracellular Amastigotes Comparison (Papadopoulou),GeneQuestions.GenesByMicroArrPaGELinfantum,GeneQuestions.GenesByMicroArrPaGELinfantumPct,T.c.study:Life-Cycle Stages (Tarleton),GeneQuestions.GenesByMicroArrPaGETcruzi,GeneQuestions.GenesByExpressionPercentileTcruzi,T.b.study:Differentiation Time Series (Clayton/Matthews),GeneQuestions.GenesByTbruceiTimeSeries,GeneQuestions.GenesByExpressionPercentileTbrucei,T.b.study:RNA helicase DHH1 and post transcriptional regulation (Carrington),GeneQuestions.GenesByMicroArrPaGE_Tbrucei_DHH1,GeneQuestions.GenesByMicroArrPaGE_Tbrucei_DHH1_Pct,T.b.study:Heat shock and post transcriptional regulation (Carrington),GeneQuestions.GenesByMicroArrPaGE_Tbrucei_HeatShock,GeneQuestions.GenesByMicroArrPaGE_Tbrucei_HeatShock_Pct,T.b.study:Life-Cycle Stages (Parsons),GeneQuestions.GenesByMicroArrPaGETbrucei,GeneQuestions.GenesByExpressionPercentileBrucei5stg,T.b.study:Procyclic Trypanosomes Depleted of TbDRBD3 (Estevez),GeneQuestions.GenesByMicroArr_TbDRBD3,L.m.study:Developmental Stages (Beverley),GeneQuestions.GenesByMicroArrPaGELmajor,GeneQuestions.GenesByMicroArrPaGELmajorPct" />
<%-- END OF QUESTIONS --%>


<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>

<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">

<center><table width="90%">
     
<c:set value="2" var="columns"/>    <%-- affects display of questions --%>

   <tr class="headerRow">
      <td colspan="${columns + 2}" align="center">
        <b>Choose a Search</b>
        <br>
        <i style="font-size:80%">Mouse over to read description</i>
      </td>
    </tr>

<c:choose>
 <c:when test = "${project == 'AmoebaDB'}">
    <site:queryList4 columns="${columns}" questions="${amoebaQuestions}"/>
  </c:when>
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


