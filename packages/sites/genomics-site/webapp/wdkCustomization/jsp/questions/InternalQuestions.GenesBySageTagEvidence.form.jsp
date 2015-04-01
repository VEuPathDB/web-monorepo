<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>

<c:set value="2" var="columns"/>

<!-- show error messages, if any -->
<div class='usererror'><api:errors/></div>

<%-- div needed for Add Step --%>
<div>


<!--    questions will be displayed in columns -number of columns is determined above
        queryList.tag relies on EITHER the question displayName having the organism acronym (P.f.) as first characters 
				OR having questions grouped by "study", here the study tells about the organism as in "P.f.study:"
        queryList.tag contains the organism mapping (from P.f. to Plasmodium falciparum, etc)
	if organism is not found (a new organism), no header will be displayed
-->

<table width="100%" cellpadding="4">
<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<imp:queryList columns="${columns}" questions="GeneQuestions.GenesBySageTag,GeneQuestions.GenesBySageTagRStat"/>

</table>
</div>


