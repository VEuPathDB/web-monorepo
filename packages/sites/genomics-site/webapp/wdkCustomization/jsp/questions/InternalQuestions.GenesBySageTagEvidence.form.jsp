<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set value="${wdkQuestion.name}" var="qname"/>

${Question_Header}
<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<table width="100%" cellpadding="4">
<c:set value="1" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>

<c:choose>
<c:when test = "${project == 'EuPathDB' || project == 'GiardiaDB' || project == 'PlasmoDB' || project == 'ToxoDB'}">
	<site:queryList3  columns="${columns}" questions="GeneQuestions.GenesBySageTag,GeneQuestions.GenesBySageTagRStat"/>
</c:when>
</c:choose>

</table>
</div>

${Question_Footer}
