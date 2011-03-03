<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="answer" value="${requestScope.dataSourceAnswer}"/>
<c:set var="question" value="${requestScope.question}" />
<c:set var="recordClass" value="${requestScope.recordClass}" />
<c:set var="reference">
  <c:choose>
    <c:when test="${question != null}">?question=${question}</c:when>
    <c:when test="${recordClass != null}">?recordClass=${recordClass}</c:when>
    <c:otherwise></c:otherwise>
  </c:choose>
</c:set>

<site:header banner="Data Contents" />

<style type="text/css">
.data-source {
  border-top: 1px solid blue;
  border-bottom: 1px solid blue;
  margin: 5px;
  padding: 5px;
}

</style>

<!-- show all xml question sets -->
<div id="data-sources">
  <c:forEach items="${answer.records}" var="record">
    <c:set var="wdkRecord" value="${record}" scope="request" />

    <c:set var="primaryKey" value="${record.primaryKey}"/>
    <c:set var="attributes" value="${record.attributes}"/>
    <c:set var="displayName" value="${attributes['display_name']}" />
    <c:set var="version" value="${attributes['version']}" />
    <c:set var="publicUrl" value="${attributes['public_url']}" />
    <c:set var="categories" value="${attributes['categories']}" />
    <c:set var="organism" value="${attributes['organism']}" />
    <c:set var="description" value="${attributes['description']}" />
    <c:set var="contact" value="${attributes['contact']}" />
    <c:set var="institution" value="${attributes['institution']}" />
    
    <c:set var="tables" value="${record.tables}" />
    <c:set var="publications" value="${tables['Publications']}" />
    <c:set var="references" value="${tables['References']}" />
    <div class="data-source">
      <div>
        <a name="${primaryKey.value}"></a>
        <b>${displayName.value}</b>
        (${version.displayName} : ${version.value})
      </div>
      <div class="detail">
        <p>${description.value}</p>
        <div>${publicUrl.displayName}: <a href="${publicUr.value}">${publicUrl.value}</a></div>
      </div>
      
      <wdk:wdkTable tblName="${publications.name}" />
      <wdk:wdkTable tblName="${references.name}" />
    </div>
    
  </c:forEach>
</div>

<p><a href="">Click here to see the complete list of Data Sources</a></p>

<site:footer/>
