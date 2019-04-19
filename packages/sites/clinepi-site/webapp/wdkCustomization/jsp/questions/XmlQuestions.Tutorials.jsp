<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="nested" uri="http://struts.apache.org/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="banner" value="${wdkModel.displayName} ${xmlAnswer.question.displayName}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="tutAnswer" value="${requestScope.wdkXmlAnswer}"/>

<imp:pageFrame title="${wdkModel.displayName} : Tutorials"
                 banner="${banner}">

<c:choose>
  <c:when test="${tutAnswer.resultSize < 1}">
    No tutorials.
  </c:when>
  <c:otherwise>

<div id="clinepi-tutorials">
  <h1>ClinEpiDB Tutorials</h1>
  <ul>
  <c:forEach items="${tutAnswer.recordInstances}" var="record" varStatus="loopCount">
   <c:if test="${loopCount.count < 4}">
    <c:set var="attrs" value="${record.attributesMap}"/>
    <c:forEach items="${record.tables}" var="table">
      <c:forEach items="${table.rows}" var="row">
        <c:set var="projects" value="${row[0].value}"/>
        <c:if test="${fn:containsIgnoreCase(projects, project)}">
          <c:set var="urlPdf" value="${row[1].value}"/>
          <c:if test="${urlPdf != 'unavailable' &&  ! fn:startsWith(urlPdf, 'http://')}">
            <c:set var="urlPdf">https://eupathdb.org/tutorials/${urlPdf}</c:set>
          </c:if>
          <c:set var="size" value="${row[2].value}"/>
          <li id='t-${attrs['uid']}'>
            <a href="${urlPdf}" title="${size} - ${attrs['description']}"><i class="fa fa-file-pdf-o"><jsp:text/></i>${attrs['title']}</a>
          </li>
        </c:if>
      </c:forEach>
    </c:forEach>
   </c:if>
  </c:forEach>
  </ul>
</div>

<br><br>
<div id="clinepi-resources">
  <h1>ClinEpiDB Resources</h1>
  <ul>
  <c:forEach items="${tutAnswer.recordInstances}" var="record" varStatus="loopCount">
    <c:if test="${loopCount.count > 3}">
    <c:set var="attrs" value="${record.attributesMap}"/>
    <c:forEach items="${record.tables}" var="table">
      <c:forEach items="${table.rows}" var="row">
        <c:set var="projects" value="${row[0].value}"/>
        <c:if test="${fn:containsIgnoreCase(projects, project)}">
          <c:set var="urlPdf" value="${row[1].value}"/>
          <c:if test="${urlPdf != 'unavailable' &&  ! fn:startsWith(urlPdf, 'http://')}">
            <c:set var="urlPdf">https://eupathdb.org/tutorials/${urlPdf}</c:set>
          </c:if>
          <c:set var="size" value="${row[2].value}"/>
          <li id='t-${attrs['uid']}'>
            <a href="${urlPdf}" title="${size} - ${attrs['description']}"><i class="fa fa-file-pdf-o"><jsp:text/></i>${attrs['title']}</a>
          </li>
        </c:if>
      </c:forEach>
    </c:forEach>
   </c:if>
  </c:forEach>
  </ul>
</div>
<br><br><br>
  </c:otherwise>
  </c:choose>

</imp:pageFrame>
