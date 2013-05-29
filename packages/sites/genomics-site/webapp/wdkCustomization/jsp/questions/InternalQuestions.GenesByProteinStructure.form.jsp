<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="projectId" value="${wdkModel.displayName}"/>

<imp:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">

<table width="100%">
<c:set value="1" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<c:choose>
<c:when test = "${projectId ==  'TrichDB'}">
	<imp:queryList columns="${columns}"  questions="GeneQuestions.GenesBySecondaryStructure"/>
</c:when>

<c:when test = "${projectId == 'AmoebaDB' || projectId == 'MicrosporidiaDB' || projectId == 'PiroplasmaDB'}">
	<imp:queryList columns="${columns}"  questions="GeneQuestions.GenesByPdbSimilarity"/>
</c:when>

<c:when test = "${projectId == 'CryptoDB' || projectId == 'ToxoDB' || projectId == 'GiardiaDB' || projectId == 'TriTrypDB'} ">
	<imp:queryList columns="${columns}"  questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesBySecondaryStructure"/>
</c:when>
<c:otherwise>  <%-- EuPathDB and PlasmoDB --%>
	<imp:queryList columns="${columns}" questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesWithStructurePrediction,GeneQuestions.GenesBySecondaryStructure"/>
</c:otherwise>
</c:choose>


</table>
</div>

