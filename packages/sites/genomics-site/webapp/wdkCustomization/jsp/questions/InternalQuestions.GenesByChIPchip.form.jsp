<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<%-- QUESTIONS --%>
<c:set var="plasmoQuestions" value="GeneQuestions.GenesByChIPchipPlasmo" />
<c:set var="toxoQuestions" value="GeneQuestions.GenesByChIPchipToxo"/>

<c:if test="${project == 'ToxoDB'}">
	<jsp:forward page="/showQuestion.do?questionFullName=${toxoQuestions}" /> 
</c:if>

<c:if test="${project == 'PlasmoDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=${plasmoQuestions}" />
</c:if>

${Question_Header}

<wdk:errors/>

<%-- div needed for Add Step --%>
<div id="form_question">
<center><table width="90%">

<c:set value="2" var="columns"/>

<tr class="headerRow"><td colspan="${columns + 2}" align="center"><b>Choose a Search</b><br><i style="font-size:80%">Mouse over to read description</i></td></tr>


<c:choose>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList3 columns="${columns}" questions="${plasmoQuestions},${toxoQuestions}"/>
</c:when>
</c:choose>

</table>
</center>
</div>

${Question_Footer}
