<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>
<c:set var="qForm" value="${requestScope.questionForm}"/>
<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<h1>test: '${showParams}'</h1>
<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${fn:contains(recordType, 'Assem') }">
        <c:set var="recordType" value="Assemblie" />
</c:if>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<c:choose>
    <c:when test="${showParams == true}">
        <%-- display params section only --%>
        <site:questionParams />
    </c:when>
    <c:otherwise>
        <%-- display question section --%>

<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
     <div id="question_Form">
</c:if>

<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

<!-- show error messages, if any -->
<wdk:errors/>

<%-- the js has to be included here in order to appear in the step form --%>
<script type="text/javascript" src='<c:url value="/assets/js/wdkQuestion.js"/>'></script>

<div class="params">

<%-- enter from original question page, display params here --%>
<c:if test="${showParams == null}">
    <site:questionParams />
</c:if>

</div> <%-- end of params div --%>

<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>
</html:form>

<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    </div><!--End Question Form Div-->
</c:if>

<hr>

<c:set var="descripId" value="query-description-section"/>
<c:if test="${wdkQuestion.fullName == 'IsolateQuestions.IsolateByCountry'}">
	<c:set var="descripId" value="query-description-noShowOnForm"/>
</c:if>


<%-- display description for wdkQuestion --%>
<div id="${descripId}"><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></div>



<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />
</c:if>

 <%-- </td>--%>
  <td valign=top class=dottedLeftBorder></td> 

</tr>
</table> 

    </c:otherwise> <%-- otherwise of showParams == true --%>
</c:choose>
