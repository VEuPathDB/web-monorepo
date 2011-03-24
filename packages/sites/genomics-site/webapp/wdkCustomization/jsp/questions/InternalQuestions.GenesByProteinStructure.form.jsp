<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="projectId" value="${wdkModel.displayName}"/>

<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">

<table width="100%">
<c:set value="1" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<c:choose>
<c:when test = "${projectId == 'GiardiaDB'}">
	<site:queryList4 columns="${columns}"  questions="GeneQuestions.GenesByProteinStructure"/>
</c:when>
<c:when test = "${projectId == 'CryptoDB' || projectId == 'TriTrypDB'}">
	<site:queryList4 columns="${columns}"  questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesBySecondaryStructure"/>
</c:when>
<c:otherwise>  <%-- EuPathDB and PlasmoDB, Toxo --%>
	<site:queryList4 columns="${columns}" questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesWithStructurePrediction,GeneQuestions.GenesBySecondaryStructure"/>
</c:otherwise>
</c:choose>


</table>
</div>

