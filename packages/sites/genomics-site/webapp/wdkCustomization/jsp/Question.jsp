<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="Question_Header" scope="request">
  <c:if test="${requestScope.partial != 'true'}">
    <site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
  </c:if>
</c:set>



${Question_Header}

<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
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
	<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
</c:if>

<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">

<wdk:questionForm />

<c:if test="${hideOperation == false}">
    <div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>
</c:if>

</html:form>


<c:set var="Question_Footer" scope="request">

  <%-- displays question description, can be overridden by the custom question form --%>
<c:if test="${hideAttrDescr == false}">
  <site:questionDescription />
</c:if>

<%-- I think partial is not used anymore.... --%>
<c:if test="${requestScope.partial != 'true'}">
  <site:footer />
</c:if>

</c:set>

${Question_Footer}
