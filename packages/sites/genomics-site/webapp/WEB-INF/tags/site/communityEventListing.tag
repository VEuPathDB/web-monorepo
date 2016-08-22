<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<c:url var="feedPath" value="/communityEventsRss.jsp?upcoming=1&stopDateSort=ASC" />
<c:set var="rss_Url">
http://${pageContext.request.serverName}${feedPath}
</c:set>

<c:catch var="feedex">

<wir:feed feed="allFeeds" timeout="5000">
  ${rss_Url}
</wir:feed>

<c:if test="${fn:length(allFeeds.entries) gt 0}">
  <ul id='communityEventList'>
  <c:forEach items="${allFeeds.entries}" var="e" begin="0" end="9" >
    <fmt:formatDate var="fdate" value="${e.publishedDate}" pattern="d MMMM yyyy"/>
    <li id="${e.uri}"><a href='${fn:trim(e.link)}'>${e.title}</a></li>
  </c:forEach>
  </ul>

  <c:choose>
  <c:when test="${project == 'EuPathDB'}">
    <a class="small" href='<c:url value="/eupathEvents.jsp"/>'>Full Events Page >>></a>
  </c:when>
  <c:otherwise>
	  <c:if test="${fn:length(allFeeds.entries) > 0}">
		  <a class="small" href='<c:url value="/communityEvents.jsp"/>'>${project} Events Page >>></a>
	  </c:if>
  </c:otherwise>
  </c:choose>
</c:if>

</c:catch>

<c:if test="${feedex != null}">
  <br>
  <imp:embeddedError 
    msg="<font size='-1'><i>temporarily unavailable.</i></font>"
    e="${feedex}" 
  />
</c:if>

<br><br><a class="small" href='http://maps.google.com/maps/ms?vps=2&ie=UTF8&hl=en&oe=UTF8&msa=0&msid=208351045565585105018.000490de33b177c1f9068'>Global view of EuPathDB training >>></a>
