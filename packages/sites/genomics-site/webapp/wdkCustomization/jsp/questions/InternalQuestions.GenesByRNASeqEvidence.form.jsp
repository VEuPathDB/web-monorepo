<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>

<%-- QUESTIONS --%>
<c:set var="fungiQuestions" value="Cneostudy:Capsule Regulation,GeneQuestions.GenesByRnaSeqFoldChangeCneoCapReg,GeneQuestions.GenesByRnaSeqPercentileCapReg,Cneostudy:NRG1 KO and Overexpression,GeneQuestions.GenesByRnaSeqFoldChangeCneo,GeneQuestions.GenesByRnaSeqPercentileCneo,Ncrastudy:Hyphal Growth,GeneQuestions.GenesByRnaSeqFoldChangeNcra,GeneQuestions.GenesByRnaSeqPercentileNcra,Ncrastudy:Population Genomics,GeneQuestions.GenesByRnaSeqFoldChangeNcraPopGen,GeneQuestions.GenesByRnaSeqPercentileNcraPopGen,Calbstudy:Comprehensive Annotation,GeneQuestions.GenesByRnaSeqFoldChangeCalbCompAnn,GeneQuestions.GenesByRnaSeqPercentileCalbCompAnn,Spomstudy:Dicer Protein,GeneQuestions.GenesByRnaSeqFoldChangeSpomDicer,GeneQuestions.GenesByRnaSeqPercentileSpomDicer,Ccinstudy:Hyphal Growth Time Series,GeneQuestions.GenesByRnaSeqFoldChangeCcinHyphalGrowth,GeneQuestions.GenesByRnaSeqPercentileCcinHyphalGrowth,Rorystudy:Hyphal Growth Time Series,GeneQuestions.GenesByRnaSeqFoldChangeRoryHyphalGrowth,GeneQuestions.GenesByRnaSeqPercentileRoryHyphalGrowth,Cimmstudy:Comparative Transcriptomics,GeneQuestions.GenesByRnaSeqFoldChangeCimmComTran,GeneQuestions.GenesByRnaSeqPercentileCimmComTran,Cposstudy:Comparative Transcriptomics,GeneQuestions.GenesByRnaSeqFoldChangeCposComTran,GeneQuestions.GenesByRnaSeqPercentileCposComTran,Phyrastudy:Condition Expression,GeneQuestions.GenesByRnaSeqFoldChangePhyraCondition,GeneQuestions.GenesByRnaSeqPercentilePhyraCondition,Hyaarstudy:Infection Expression,GeneQuestions.GenesByRnaSeqPercentileHyaarInfection"/>

<c:set var="plasmoQuestions" value="P.f.study:Field Parasites from Pregnant Women and Children (Duffy),GeneQuestions.GenesByRNASeqPfExpressionFoldChange,GeneQuestions.GenesByRNASeqPfExpressionPercentile,GeneQuestions.GenesByRNASeqPfExpressionPValue,P.f.study:Post Infection Time Series (Stunnenberg),GeneQuestions.GenesByRNASeqPfRBCFoldChange,GeneQuestions.GenesByRNASeqPfRBCExprnPercentile,GeneQuestions.GenesByRNASeqPfRBCFoldChangePValue,P.f.study:Intraerythrocytic infection cycle (Newbold/Llinas),GeneQuestions.GenesByRNASeqExpressionTiming,GeneQuestions.GenesByRNASeqPercentileNewbold,GeneQuestions.GenesByRNASeqExpressionTimingPValue,P.f.study:RNASeq from seven stages - ring | early and late troph | schizont | gametocyte II and V | ookenete (Su),GeneQuestions.GenesByRNASeqSuStrandSpecific,GeneQuestions.GenesByRNASeqSuStrandSpecificPercentile,GeneQuestions.GenesByRNASeqSuSevenStages,GeneQuestions.GenesByRNASeqSuSevenStagesPercentile,GeneQuestions.GenesByRNASeqSuSevenStagesPValue" />

<c:set var="toxoQuestions" value="T.g.study:ME49 Bradyzoite (Sibley),GeneQuestions.ToxoGenesBySibleyRNASeqBradyzoitePct,T.g.study:VEG/ME49 Tachyzoite Time Series (Diaz/Beiting/Gregory),GeneQuestions.ToxoGenesByGregoryRNASeqTsFC,GeneQuestions.ToxoGenesByGregoryRNASeqTsPct,T.g.study:M4 Oocyst Time Series (Fritz/Boothroyd),GeneQuestions.ToxoGenesByBoothroydRNASeqOocystFC,GeneQuestions.ToxoGenesByBoothroydRNASeqOocystPct,T.g.study:VEG Tachyzoite Day 3/4 (Reid),GeneQuestions.GenesByTgVegRNASeqExpressionPercentile,N.c.study:NcanLIV Tachyzoite Day 3/4 (Reid),GeneQuestions.GenesByNcLivRNASeqExpressionPercentile" />

<c:set var="tritrypQuestions" value="T.b.study:Blood Form vs. Procyclic Form (Cross),GeneQuestions.GenesByRNASeqExpressionFoldChange,GeneQuestions.GenesByRNASeqExpressionPercentile,T.b.study:Splice Sites (Nilsson),GeneQuestions.GenesByTrypFoldChangeNilssonTbrucei,GeneQuestions.GenesByExprPercentileNilssonTbruceiSpliceSites,GeneQuestions.GenesByTbruceiSpliceSites,T.b.study:Cell Cycle (Archer),GeneQuestions.GenesByCellCycleRnaSeq,GeneQuestions.GenesByExprPercentileTbCellCyc,GeneQuestions.GenesByTbCellCycFoldChange,T.b.study:Transcriptome Mapping (Tschudi),GeneQuestions.GenesByExprPercentileTbTranscriptomeMapping"/>

<%--
<c:set var="cryptoQuestions" value="C.p.study:Intestinal Stage (Lippuner),GeneQuestions.GenesByFoldChangeCparvumLippuner,GeneQuestions.GenesByExprPercentileCpLippuner"/>
--%>

<c:set var="giardiaQuestions" value="G.l.study:Three Strains (Svard),GeneQuestions.GenesByRNASeqSvard3StagesFC,GeneQuestions.GenesByRNASeqSvard3StagesPercentile"/>

<c:set var="hostQuestions" value="T.g.study:ME49 Infection (Gregory),GeneQuestions.GenesByRNASeqTgME49HumanFoldChange,GeneQuestions.GenesByRNASeqTgME49HumanPercentile"/>

<c:set var="microsporidiaQuestions" value="N.p.study:N. parisii Infection Time Series in C. elegans (Cuomo et al.),GeneQuestions.GenesByRNASeqTroemelCeInfectionFC,GeneQuestions.GenesByRNASeqTroemelCeInfectionPercentile"/>

<%-- END OF QUESTIONS --%>

<imp:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">

<!--    questions will be displayed in columns -number of columns is determined above
        queryList.tag relies on EITHER the question displayName having the organism acronym (P.f.) as first characters 
				OR having questions grouped by "study", here the study tells about the organism as in "P.f.study:"
        queryList.tag contains the organism mapping (from P.f. to Plasmodium falciparum, etc)
	if organism is not found (a new organism), no header will be displayed
-->
<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

  <c:choose>

    <c:when test="${projectId == 'FungiDB'}">
      <imp:queryList columns="${columns}" questions="${fungiQuestions}"/>
    </c:when>    
    <c:when test="${projectId == 'PlasmoDB'}">
      <imp:queryList columns="${columns}" questions="${plasmoQuestions}"/>
    </c:when>    
    <c:when test="${projectId == 'TriTrypDB'}">
      <imp:queryList columns="${columns}" questions="${tritrypQuestions}"/>
    </c:when>
    <c:when test="${projectId == 'ToxoDB'}">
      <imp:queryList columns="${columns}" questions="${toxoQuestions}"/>
    </c:when>
    <c:when test="${projectId == 'GiardiaDB'}">
      <imp:queryList columns="${columns}" questions="${giardiaQuestions}"/>
    </c:when>
    <c:when test="${projectId == 'HostDB'}">
      <imp:queryList columns="${columns}" questions="${hostQuestions}"/>
    </c:when>

    <c:when test="${projectId == 'MicrosporidiaDB'}">
      <imp:queryList columns="${columns}" questions="${microsporidiaQuestions}"/>
    </c:when>


		<%--
    <c:when test="${projectId == 'CryptoDB'}">
      <imp:queryList columns="${columns}" questions="${cryptoQuestions}"/>
    </c:when>
		--%>
    <c:otherwise>  <%-- it must be the portal --%>
      <imp:queryList columns="${columns}" questions="${plasmoQuestions},${toxoQuestions},${tritrypQuestions},${giardiaQuestions},${hostQuestions},${microsporidiaQuestions}"/>
    </c:otherwise>
   </c:choose>


</table>
</center>
</div>

