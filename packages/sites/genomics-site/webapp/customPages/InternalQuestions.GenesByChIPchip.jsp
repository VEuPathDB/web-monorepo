<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="project"/>

<c:if test="${project == 'ToxoDB'}">
	<jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByChIPchipToxo" /> 
</c:if>
<c:if test="${project == 'PlasmoDB'}">
        <jsp:forward page="/showQuestion.do?questionFullName=GeneQuestions.GenesByChIPchipPlasmo" />
</c:if>

<site:header title="ChIP chip Evidence"
                 banner="Identify Genes by ChIp on chip Evidence"
                 parentDivision=""
                 parentUrl="/home.jsp"
                 divisionName=""
                 division=""/>


<wdk:errors/>

<table width="100%">
<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<c:choose>
<c:when test = "${project == 'EuPathDB'}">
<site:queryList2 questions="GeneQuestions.GenesByChIPchipToxo,GeneQuestions.GenesByChIPchipPlasmo"/>
</c:when>
</c:choose>

</table>


<site:footer/>
