<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="synd" uri="http://crashingdaily.com/taglib/syndication" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<c:url var="feedPath" value="/communityEventsRss.jsp" />
<c:set var="rss_Url">
http://${pageContext.request.serverName}${feedPath}
</c:set>

<c:catch var="feedex">
 <synd:feed feed="allFeeds" timeout="5000">
     ${rss_Url}
 </synd:feed>

<ul id='communityEventList'>
<c:forEach items="${allFeeds.entries}" var="e" begin="0" end="3" >
  <fmt:formatDate var="fdate" value="${e.publishedDate}" pattern="d MMMM yyyy"/>
  <li id="${e.uri}"><a href='${fn:trim(e.link)}'>${e.title}</a></li>
</c:forEach>
</c:catch>
<c:if test="${feedex != null}">
  <br>
  <site:embeddedError 
      msg="<font size='-1'><i>temporarily unavailable.</i></font>"
      e="${feedex}" 
  />
</c:if>
</ul>
<c:choose>
<c:when test="${fn:length(allFeeds.entries) > 0}">
	<c:choose>
	<c:when test="${project == 'EuPathDB'}">
      		<a style="margin-left:0px" href='<c:url value="/eupathEvents.jsp"/>'>Full Events Page</a>
	</c:when>
	<c:otherwise>
	 	<a style="margin-left:0px" href='<c:url value="/communityEvents.jsp"/>'>Full Events Page</a>
	</c:otherwise>
	</c:choose>
</c:when>
<c:otherwise>
</c:otherwise>
</c:choose>
