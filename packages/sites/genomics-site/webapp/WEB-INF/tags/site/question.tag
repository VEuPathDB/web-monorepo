<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

${Question_Header}

<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set var="qForm" value="${requestScope.questionForm}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${fn:contains(recordType, 'Assem') }">
        <c:set var="recordType" value="Transcript Assemblie" />
</c:if>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>


<c:choose>
<c:when test="${showParams == true}">
<%-- display params section only --%>

<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

	<site:questionParams />

</html:form>
</c:when>

<c:otherwise>
<%-- display question section --%>

<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 
<tr>
<td bgcolor=white valign=top>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>



<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

<!-- show error messages, if any -->

<div class='usererror'><api:errors/></div>

<%-- the js has to be included here in order to appear in the step form --%>
<script type="text/javascript" src='<c:url value="/wdk/js/wdkQuestion.js"/>'></script>
<c:if test="${showParams == null}">
            <script type="text/javascript">
              $(document).ready(function() { initParamHandlers(); });
            </script>
</c:if>



<div class="params">
<c:if test="${showParams == null}">

	<site:questionParams />

</c:if>  <%--  <c:if test="${showParams == null}"> --%>
</div>   <%-- end of params div --%>



<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>

</html:form>

<hr>

<c:set var="attrId" value="attributions-section"/>
<c:set var="descripId" value="query-description-section"/>
<c:if test="${wdkQuestion.fullName == 'IsolateQuestions.IsolateByCountry'}">
	<c:set var="descripId" value="query-description-noShowOnForm"/>
</c:if>

<%-- display description for wdkQuestion --%>
<div id="${descripId}"><b>Description: </b><jsp:getProperty name="wdkQuestion" property="description"/></div>

<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<div id="${attrId}">
	<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>
	<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />
</div>
</c:if>


</td>
</tr>
</table> 

</c:otherwise> <%-- otherwise of showParams == true --%>
</c:choose>

${Question_Footer}
