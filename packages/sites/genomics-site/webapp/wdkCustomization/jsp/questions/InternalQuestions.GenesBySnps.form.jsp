<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="project" value="${wdkModel.displayName}"/>

<%-- QUESTIONS --%>
<c:set var="amoebaQuestions" value="GeneQuestions.GenesByHtsSnps"/>
<c:set var="piroplasmaQuestions" value="GeneQuestions.GenesByHtsSnps"/>
<c:set var="giardiaQuestions" value="GeneQuestions.GenesByHtsSnps"/>
<c:set var="eupathQuestions" value="GeneQuestions.GenesBySnps,GeneQuestions.GenesByHtsSnps"/>
<c:set var="cryptoQuestions" value="GeneQuestions.GenesBySnps,GeneQuestions.GenesByHtsSnps"/>
<c:set var="plasmoQuestions" value="GeneQuestions.GenesBySnps,GeneQuestions.GenesByHtsSnps"/>
<c:set var="toxoQuestions" value="GeneQuestions.GenesBySnps,GeneQuestions.GenesByHtsSnps"/>
<c:set var="trypQuestions" value="GeneQuestions.GenesByHtsSnps"/>


<!-- show error messages, if any -->
<div class='usererror'><api:errors/></div>

<%-- div needed for Add Step --%>
<div>

<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<c:choose>
<c:when test = "${project == 'AmoebaDB'}">
	<imp:queryList columns="${columns}" questions="${amoebaQuestions}"/>
</c:when>
<c:choose>
<c:when test = "${project == 'CryptoDB'}">
	<imp:queryList columns="${columns}" questions="${cryptoQuestions}"/>
</c:when>
<c:when test = "${project == 'EuPathDB'}">
	<imp:queryList columns="${columns}" questions="${eupathQuestions}"/>
</c:when>
<c:when test = "${project == 'GiardiaDB'}">
	<imp:queryList columns="${columns}" questions="${giardiaQuestions}"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
	<imp:queryList columns="${columns}" questions="${plasmoQuestions}"/>
</c:when>
<c:when test = "${project == 'PiroplasmaDB'}">
	<imp:queryList columns="${columns}" questions="${piroplasmaQuestions}"/>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
	<imp:queryList columns="${columns}" questions="${toxoQuestions}"/>
</c:when>
<c:when test = "${project == 'TriTrypDB'}">
	<imp:queryList columns="${columns}" questions="${trypQuestions}"/>
</c:when>
</c:choose>

</table>
</center>
</div>


