<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="project" value="${wdkModel.displayName}"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>

<%-- QUESTIONS --%>
<c:set var="pathwayQuestions" value="GeneQuestions.GenesByMetabolicPathwayKegg,GeneQuestions.GenesByReactionCompounds"/>
<c:set var="plasmoToxo_pathwayQuestions" value="GeneQuestions.GenesByMetabolicPathwayHagai" />
<%-- END OF QUESTIONS --%>

<imp:errors/>

<%-- div needed for Add Step --%>
<div>

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
<c:when test = "${project == 'PlasmoDB' || project == 'ToxoDB'}">
      <imp:queryList columns="${columns}" questions="${plasmoToxo_pathwayQuestions},${pathwayQuestions}"/>
</c:when>
<c:otherwise>
      <imp:queryList columns="${columns}" questions="${pathwayQuestions}"/>
</c:otherwise>
</c:choose>





</table>
</center>
</div>

