<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set value="${requestScope.questionForm}" var="qForm"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : ${wdkQuestion.displayName}"
                 banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Question"
                 division="queries_tools"/>

<hr>
<table width="100%" cellpadding="4">

<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<site:queryList questions="GeneQuestions.GenesByPdbSimilarity,GeneQuestions.GenesBySecondaryStructure"/>

</table>
<hr>

<site:footer/>
