<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<c:if test="${project == 'TriTrypDB'}">
	<jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByPromastigoteTimeSeries" /> 
</c:if>

<site:header title="Microarray Evidence"
                 banner="Identify Genes by Microarray Evidence"
                 parentDivision=""
                 parentUrl="/home.jsp"
                 divisionName=""
                 division=""/>


<wdk:errors/>

<table width="100%">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<c:choose>
<c:when test = "${project == 'GiardiaDB'}">
<site:queryList questions="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile"/>
</c:when>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList2 questions="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming,GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByExpressionTimingOne,GeneQuestions.GenesByExpressionTimingTwo,GeneQuestions.GenesByExpressionTimingThree,GeneQuestions.ToxoGenesByDifferentialMeanExpression,GeneQuestions.GenesByPromastigoteTimeSeries"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
<site:queryList2 questions="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming"/>
</table>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
<site:queryList questions="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.GenesByExpressionTimingOne,GeneQuestions.GenesByExpressionTimingTwo,GeneQuestions.GenesByExpressionTimingThree,GeneQuestions.ToxoGenesByDifferentialMeanExpression"/>
</c:when>
</c:choose>

</table>


<site:footer/>
