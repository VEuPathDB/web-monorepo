<%--
Events are stored in messaging database as xml records.
Separately select non-expired messages for specific project.
Transform XML message into events HTML page.
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>
<%@ taglib prefix="api" uri="http://eupathdb.org/taglib"%>

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

<imp:pageFrame refer="events" title="${wdkModel.displayName} : Community Events">

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

<table width="90%">
<tr><td><h2 align='center'>${projectName} Community Events</h2></td>
    <td align="right"><a target=":blank" href="http://eupathdb.org/eupathdb/eupathEvents.jsp">Eukaryotic Pathogens Meetings with EuPathDB presence  >>></a></td>
</tr>
</table>


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
    oops. this is broken. <br> 
    ${e}
</c:if>

<div style="text-align:right;">
  <c:url var='eventsRss' value='/communityEventsRss.jsp'/>
  <a href="${eventsRss}">
    <imp:image src="images/feed-icon16x16.png" alt="" border='0'/>
  <font size='-2' color='black'>RSS</font></a>
</div>


</imp:pageFrame> <%-- contains </body> </html> --%>
