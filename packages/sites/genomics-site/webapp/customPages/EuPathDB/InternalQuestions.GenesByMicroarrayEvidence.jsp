<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="headElement">
<%--  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>--%>
  <script src="js/Top_menu.js" type="text/javascript"></script>
  <link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
</c:set>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header title="EuPathDB : Microarray Evidence"
                 banner="Identify Genes by Microarray Evidence"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
		 headElement="${headElement}"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<!-- display wdkModel introduction text, if any -->
<!--<b><jsp:getProperty name="wdkModel" property="introduction"/></b>-->

<!-- show error messages, if any -->
<wdk:errors/>

<table width="100%" cellpadding="4">

<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>


<site:queryList2 questions="GeneQuestions.GenesByExpressionTiming,GeneQuestions.GenesByProfileSimilarity,GeneQuestions.GenesByExpressionPercentile,GeneQuestions.GenesByGametocyteExpression,GeneQuestions.GenesByDifferentialMeanExpression,GeneQuestions.GenesByExpressionPercentileA,GeneQuestions.BergheiGenesByExpressionPercentile,GeneQuestions.GenesByWatersDifferentialExpression,GeneQuestions.GenesByKappeFoldChange,GeneQuestions.GenesByVivaxExpressionTiming,GeneQuestions.ToxoGenesByDifferentialExpression,GeneQuestions.ToxoGenesByExpressionPercentile,GeneQuestions.ToxoGenesByDifferentialExpressionChooseComparisons,GeneQuestions.GiardiaGenesByDifferentialExpression,GeneQuestions.GiardiaGenesByExpressionPercentileProfile,GeneQuestions.GenesByPromastigoteTimeSeries"/>

</table>

<script type="text/javascript" src='/gbrowse/wz_tooltip.js'></script>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
