<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="project" value="${wdkModel.displayName}"/>

<%-- QUESTIONS --%>
<c:set var="plasmoQuestions" value="GeneQuestions.GenesByChIPchipPlasmo" />
<c:set var="toxoQuestions" value="GeneQuestions.GenesByChIPchipToxo"/>

<!-- show error messages, if any -->
<div class='usererror'><api:errors/></div>

<%-- div needed for Add Step --%>
<div id="form_question">

<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>


<!--	questions will be displayed in columns -number of columns is determined above
	queryList3.tag relies on the question displayName having the organism acronym (P.f.) as first characters (unlike queryList4.tag)
        queryList3.tag contains the organism mapping (from P.f. to Plasmodium falciparum, etc)
        if this becomes difficult to maintain, we would show acronyms.
-->
<c:choose>
<c:when test = "${project == 'EuPathDB'}">
	<site:queryList3 columns="${columns}" questions="${plasmoQuestions},${toxoQuestions}"/>
</c:when>
<c:when test = "${project == 'PlasmoDB'}">
	<site:queryList3 columns="${columns}" questions="${plasmoQuestions}"/>
</c:when>
<c:when test = "${project == 'ToxoDB'}">
	<site:queryList3 columns="${columns}" questions="${plasmoQuestions}"/>
</c:when>
</c:choose>

</table>
</center>
</div>


