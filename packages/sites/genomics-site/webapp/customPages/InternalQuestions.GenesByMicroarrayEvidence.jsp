<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<c:if test="${projectId == 'TriTrypDB'}">
	<jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByPromastigoteTimeSeries" /> 
</c:if>

<site:header title="Microarray Evidence"
                 banner="Identify Genes by Microarray Evidence"
                 parentDivision=""
                 parentUrl="/home.jsp"
                 divisionName=""
                 division=""/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 
<tr>
<td bgcolor=white valign=top>

<!-- show error messages, if any -->
<wdk:errors/>

<table width="100%" cellpadding="4">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<c:choose>
<c:when test = "${project == 'GiardiaDB'}">
<site:queryList questions="GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile"/>
</c:when>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList2 questions="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,GeneQuestions.GenesByPromastigoteTimeSeries"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
<site:queryList questions="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,InternalQuestions.GenesByIntraerythrocyticExpression,InternalQuestions.GenesByExtraerythrocyticExpression,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming"/>
</table>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
<site:queryList questions="GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile"/>
</c:when>
</c:choose>

</table>

<%-- get the attributions of the question if not EuPathDB : 
	here it serves no purpose;
	it gets done in queryList (normal question page) and should be done in queryList2

<c:if test = "${project != 'EuPathDB'}">
<hr>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />
</c:if>
--%>


</td>
<td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
