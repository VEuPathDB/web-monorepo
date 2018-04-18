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

<style>
  #clinepi-tutorials  li {
    font-size: 1.4em;
    list-style: none;
    margin: 1em 0;
  }
  #clinepi-tutorials li .fa {
    color: #333;
    margin-right: .5em;
  }
</style>

<div id="clinepi-tutorials">
  <h1>ClinEpiDB Tutorials</h1>
  <ul>
  <c:forEach items="${tutAnswer.recordInstances}" var="record">
    <c:set var="attrs" value="${record.attributesMap}"/>

    <c:forEach items="${record.tables}" var="table">

      <c:forEach items="${table.rows}" var="row">
        <c:set var="projects" value="${row[0].value}"/>

        <c:if test="${fn:containsIgnoreCase(projects, project)}">
          <c:set var="urlMov" value="${row[1].value}"/>
          <c:if test="${urlMov != 'unavailable' && ! fn:startsWith(urlMov, 'http://')}">
            <c:set var="urlMov">http://www.youtube.com/${urlMov}</c:set>
          </c:if>
          <c:set var="urlAvi" value="${row[2].value}"/>
          <c:if test="${urlAvi != 'unavailable' &&  ! fn:startsWith(urlAvi, 'http://')}">
            <c:set var="urlAvi">http://eupathdb.org/tutorials/${urlAvi}</c:set>
          </c:if>
          <c:set var="urlFlv" value="${row[3].value}"/>
          <c:choose>
            <c:when test="${ ! fn:endsWith(urlFlv, 'flv')}">
              <c:set var="urlFlv">http://eupathdb.org/tutorials/${urlFlv}</c:set>
            </c:when>
            <c:when test="${urlFlv != 'unavailable' &&  ! fn:startsWith(urlFlv, 'http://')}">
              <c:set var="urlFlv">http://eupathdb.org/flv_player/flvplayer.swf?file=/tutorials/${urlFlv}&amp;autostart=true</c:set>
            </c:when>
          </c:choose>
          <c:set var="urlPdf" value="${row[4].value}"/>
          <c:if test="${urlPdf != 'unavailable' &&  ! fn:startsWith(urlPdf, 'http://')}">
            <c:set var="urlPdf">http://eupathdb.org/tutorials/${urlPdf}</c:set>
          </c:if>
          <c:set var="duration" value="${row[5].value}"/>
          <c:set var="size" value="${row[6].value}"/>

          <li id='t-${attrs['uid']}'>
            <a href="${urlPdf}" title="${size} - ${attrs['description']}"><i class="fa fa-file-pdf-o"><jsp:text/></i>${attrs['title']}</a>
          </li>
        </c:if>
      </c:forEach>
    </c:forEach>
  </c:forEach>
  </ul>
</div>

  </c:otherwise>
  </c:choose>

</imp:pageFrame>
