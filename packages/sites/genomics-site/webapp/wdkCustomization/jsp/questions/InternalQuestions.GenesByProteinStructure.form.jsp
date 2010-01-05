<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="projectId"/>

<c:choose>
<c:when test="${projectId == 'GiardiaDB' || projectId == 'TrichDB' }">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByProteinStructure" /> 
    </c:when>
<c:otherwise>

<wdk:errors/>
<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Search ---- Mouse over to read description</b></td></tr>


<c:choose>
<c:when test = "${projectId == 'CryptoDB' || projectId == 'TriTrypDB'}">
	<site:queryList2 questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesBySecondaryStructure"/>
</c:when>
<c:otherwise>  <%-- EuPathDB and PlasmoDB, Toxo still does not have this kind of data --%>
	<site:queryList2 questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesWithStructurePrediction,GeneQuestions.GenesBySecondaryStructure"/>
</c:otherwise>
</c:choose>


</table>
</div>

</c:otherwise>
</c:choose>
