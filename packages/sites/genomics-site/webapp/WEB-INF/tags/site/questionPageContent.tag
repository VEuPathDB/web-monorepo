<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="recordName" value="${wdkQuestion.recordClass.displayNamePlural}"/>
<c:set var="q" value="${wdkQuestion}"/>


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
  <h1>Identify ${recordName} based on ${wdkQuestion.displayName}
    <imp:questionFeature question="${wdkQuestion}"/></h1>
</c:if>



<a name="query-search-form"></a>

<div id="query-search-form">
  <html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
    <imp:questionForm />

    <c:if test="${hideOperation == false}">
        <div title="Click to run a search and generate the first step of a new strategy." class="filter-button">
					<html:submit property="questionSubmit" 
												value="Get Answer" 
												title="Click to run a search and generate the first step of a new strategy."  
												style="font-size:110%;font-family:Arial,Helvetica,sans-serif;"/>
				</div>	
				<imp:nameStep/>
    </c:if>

  </html:form>
</div>

<hr>

<%-- displays question description, can be overridden by the custom question form --%>
<c:if test="${hideAttrDescr == false}">
  <!-- <div class="content-pane snippet" style="padding:1em 2em"> -->
    <div><imp:questionDescription /></div>
    <!-- </div> -->
</c:if>
