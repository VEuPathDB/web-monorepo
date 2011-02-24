<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="Question_Header" scope="request">
  <site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
</c:set>

<c:set var="Question_Footer" scope="request">
  <site:footer />
</c:set>

${Question_Header}

<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:if test="${fn:contains(recordType, 'Assem') }">
  <c:set var="recordType" value="Transcript Assemblie" />
</c:if>
<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>

<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">

    <wdk:questionForm />

    <div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>

</html:form>

${Question_Footer}
