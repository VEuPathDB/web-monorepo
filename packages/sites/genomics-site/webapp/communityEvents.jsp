<%--
Events are stored in messaging database as xml records.
Separately select non-expired messages for specific project.
Transform XML message into events HTML page.
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib"%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var='projectName' value='${applicationScope.wdkModel.name}'/>

<%-- obsolete method to fetch data via cgi
<c:set var='currentDataUrl'>
http://${pageContext.request.serverName}/cgi-bin/xmlMessageRead?messageCategory=Event&projectName=${projectName}
</c:set>
--%>

<c:set var='xsltUrl'>
http://${pageContext.request.serverName}/assets/xsl/communityEvents.xsl
</c:set>

<site:header refer="events" title="${wdkModel.displayName} : Community Events" />

<style type="text/css">
  .title {
    font-size: 12pt;
  }
  div.events {
     padding: 1em;
   }
  .events ul { 
    list-style: inside disc;
	padding-left: 2em;
    text-indent: -1em;
  }
  .events ul ul {
    list-style-type: circle;
  }
  .events p {
	margin-top: 1em;
	margin-bottom: 1em;
  }
</style>

<h2 align='center'>${projectName} Community Events</h2>

<c:catch var='e'>

<api:xmlMessages var="currentEvents" 
    messageCategory="Event"
    projectName="${projectName}"
    stopDateSort="DESC"
/>

<c:import var="xslt" url="${xsltUrl}" />

<div class='events'>
<x:transform xml="${currentEvents}" xslt="${xslt}">
    <x:param name="tag" value="${param.tag}"/>
</x:transform>
<c:if test="${param.tag != null && param.tag ne ''}">
<br/><br/>
<a href='${pageContext.request.requestURI}'>All ${project} Community Events</a>
</c:if>
</div>
</c:catch>
<c:if test="${e != null}">
    oops. this is borken. <br> 
    ${e}
</c:if>

<div style="text-align:right;">
  <c:url var='eventsRss' value='/communityEventsRss.jsp'/>
  <a href="${eventsRss}">
    <img src="${pageContext.request.contextPath}/images/feed-icon16x16.png" alt="" border='0'>
  <font size='-2' color='black'>RSS</font></a>
</div>

</body>
</html>


