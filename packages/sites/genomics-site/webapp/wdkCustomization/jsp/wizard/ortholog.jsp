<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>



<c:set var="wdkQuestion" value="${requestScope.question}"/>
<c:set var="spanOnly" value="false"/>
<c:set var="checked" value=""/>
<c:set var="buttonVal" value="Run Step"/>
<c:set var="wdkStrategy" value="${requestScope.wdkStrategy}"/>
<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="allowBoolean" value="${requestScope.allowBoolean}"/>
<c:set var="action" value="${requestScope.action}"/>

<c:if test="${wdkQuestion.recordClass.fullName != wdkStep.dataType}">
	<c:set var="checked" value="checked=''"/>
	<c:set var="buttonVal" value="Continue...."/>
	<c:set var="spanOnly" value="true"/>
</c:if>

<c:set var="wizard" value="${requestScope.wizard}"/>
<c:set var="stage" value="${requestScope.stage}"/>


<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processFilter.do" onsubmit="callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">
<span style="display:none" id="strategyId">${wdkStrategy.strategyId}</span>
<span style="display:none" id="stepId">${wdkStep.stepId}</span>

<c:set var="Question_Header" scope="request">
<%-- has nothing --%>
</c:set>

<c:set var="Question_Footer" scope="request">
<%-- displays question description, can be overridden by the custom question form --%>
<imp:questionDescription />
</c:set>

${Question_Header}

<%-- display question param section --%>
<div class="filter params">

<%-- debug 
<c:forEach var='parameter' items='${paramValues}'>  
	<c:out value='${parameter.key}'/> = 
	<c:forEach var='value' items='${parameter.value}'>
		<c:out value='${value}' escapeXml="false"/><br> 
	</c:forEach>         
</c:forEach>

<br>${wdkStep.frontId}
<br>${requestScope.wdkQuestion.displayName}
<br>${requestScope.question.displayName}
<br>
--%>
<%-- while wdkStep.frontId is not correctly set up (seems always 1) we do not display step number
  <span class="form_subtitle">
    Transform Step ${wdkStep.frontId}
    : ${wdkQuestion.displayName}
  </span>
--%>
  <span class="h2center">
     ${wdkQuestion.displayName}
  </span>

  <imp:questionForm />
</div>

<html:hidden property="stage" styleId="stage" value="process_ortholog"/>

<div id="transform_button" class="filter-button"><html:submit property="questionSubmit" value="${buttonVal}"/></div>
</html:form>

${Question_Footer}
