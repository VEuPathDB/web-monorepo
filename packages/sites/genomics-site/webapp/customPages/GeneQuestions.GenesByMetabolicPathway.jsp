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
<p>
For metabolic pathway information please visit our CryptoCyc database at <p>

<a href="http://apicyc.apidb.org/CPARVUM/server.html"><b>http://apicyc.apidb.org/CPARVUM/server.html</b></a>

<%--
<p><jsp:getProperty name="wdkQuestion" property="description"/></p>
--%>

<p>
Maps of metabolic pathways were computationally constructed for <i>C. parvum</i>
and <i>C. hominis</i> with 
the <a href="http://bioinformatics.oxfordjournals.org/cgi/content/abstract/18/suppl_1/S225">Pathway Tools</a> software package.
</p>

<p>
Queries issued at CryptoCyc will <b>not</b> be recorded in your Query History.
<site:footer/>
