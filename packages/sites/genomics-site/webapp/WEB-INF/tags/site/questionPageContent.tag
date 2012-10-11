<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="q" value="${wdkQuestion}"/>

<c:if test="${fn:contains(recordType, 'Assem') }">
  <c:set var="recordType" value="Transcript Assemblie" />
</c:if>

<c:set var="webProps" value="${wdkQuestion.propertyLists['websiteProperties']}" />
<c:set var="hideOperation" value="${false}" />
<c:set var="hideTitle" value="${false}" />
<c:set var="hideAttrDescr" value="${false}" />

<c:forEach var="prop" items="${webProps}">
  <c:choose>
    <c:when test="${prop == 'hideOperation'}"><c:set var="hideOperation" value="${true}" /></c:when>
    <c:when test="${prop == 'hideTitle'}"><c:set var="hideTitle" value="${true}" /></c:when>
    <c:when test="${prop == 'hideAttrDescr'}"><c:set var="hideAttrDescr" value="${true}" /></c:when>
  </c:choose>
</c:forEach>

<c:if test="${hideTitle == false}">
  <h1>Identify ${recordType}s based on ${wdkQuestion.displayName}

<!--
    <span style="font-size:55%;font-weight:bold;text-align:left;font-family: Arial,Helvetica,sans-serif;">
      <a title="Click to move the 'Description' section into focus" style="border:1px solid black;border-radius: 15px;padding:1px 4px;background-color:white" href="#query-description-section">Description</a>&nbsp;&nbsp;&nbsp;&nbsp;
      <a title="Click to move the 'Data sources' section into focus" style="border:1px solid black;border-radius: 15px;padding:1px 4px;background-color:white" href="#attributions-section">Data Sources</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <a title="The WADL is used to access this search via RESTful web services"
                           style="border:1px solid black;border-radius: 15px;padding:1px 4px;background-color:white"
                           href="<c:url value='/webservices/${wdkQuestion.questionSetName}/${wdkQuestion.name}.wadl' />">WADL</a>
    </span>
-->
          <imp:questionFeature question="${wdkQuestion}" />
  </h1>
</c:if>

<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<imp:questionForm />

<c:if test="${hideOperation == false}">
    <div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>
</c:if>
</html:form>

<%-- displays question description, can be overridden by the custom question form --%>
<c:if test="${hideAttrDescr == false}">
  <imp:questionDescription />
</c:if>