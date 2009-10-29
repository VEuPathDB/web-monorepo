<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>

<c:set var="headElement">
  <script src="js/prototype.js" type="text/javascript"></script>
<%--  <script src="js/scriptaculous.js" type="text/javascript"></script>
  <script src="js/Top_menu.js" type="text/javascript"></script>--%>
  <link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
</c:set>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />


<c:choose>
<c:when test="${projectId == 'GiardiaDB' || projectId == 'TrichDB' }">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByProteinStructure" /> 
    </c:when>
<c:otherwise>

<site:header title="Protein Structure"
                 banner="Identify Genes by Protein Structure"
                 parentDivision=""
                 parentUrl="/home.jsp"
                 divisionName=""
		 headElement="${headElement}"
                 division="queries_tools"/>

<wdk:errors/>

<table width="100%">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>


<c:choose>
<c:when test = "${project == 'CryptoDB' || projectId == 'TriTrypDB'}">
	<site:queryList questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesBySecondaryStructure"/>
</c:when>
<c:otherwise>
	<site:queryList questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesWithStructurePrediction,GeneQuestions.GenesBySecondaryStructure"/>
</c:otherwise>
</c:choose>


</table>

<site:footer/>

</c:otherwise>
</c:choose>
