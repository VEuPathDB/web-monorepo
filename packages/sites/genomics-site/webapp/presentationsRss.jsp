<%@
    page contentType="application/rss+xml; charset=UTF-8" 
%><%@
    taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"
%><%@ 
    taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" 
%><%@
    taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml"
%><%@ 
    taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"
%><fmt:setLocale 
    value="en-US"
/><c:set
    var="wdkModel" value="${applicationScope.wdkModel}"
/><c:set
    var='projectName' value='${applicationScope.wdkModel.name}'
/><c:set 
    var="scheme" value="${pageContext.request.scheme}" 
/><c:set 
    var="serverName" value="${pageContext.request.serverName}"
/><c:set 
    var="contextPath" value="${pageContext.request.contextPath}" 
/><c:choose><c:when 
    test="${wdkModel.projectId eq 'EuPathDB'}"
><c:set 
    var="linkTmpl" value="${scheme}://${serverName}${contextPath}/eupathEvents.jsp"
/></c:when
><c:otherwise
><c:set
    var="linkTmpl" value="${scheme}://${serverName}${contextPath}/communityEvents.jsp"
/></c:otherwise
></c:choose><c:import
    url="http://${serverName}/cgi-bin/xmlMessageRead?messageCategory=Event&projectName=${projectName}&range=all&stopDateSort=DESC" var="xml"
/><x:parse
    doc="${xml}" var="doc"
/><c:set
    var="dateStringPattern" value="dd MMMM yyyy HH:mm"
/><c:choose><c:when 
    test="${wdkModel.projectId eq 'EuPathDB'}"
><c:set 
    var="self" value="${scheme}://${serverName}/ebrcevents.rss"
/></c:when
><c:otherwise
><c:set
    var="self" value="${scheme}://${serverName}/events.rss"
/></c:otherwise
></c:choose><?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:taxo="http://purl.org/rss/1.0/modules/taxonomy/" 
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom" 
     version="2.0">
<channel>
    <title>${wdkModel.displayName} Community Events</title>
    <link>${linkTmpl}</link>
    <description>${wdkModel.displayName} Community Events</description>
    <language>en</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />

<x:forEach var="r" select="$doc/records/record">
  <c:set var="date"><x:out select="submissionDate"/></c:set>
  <c:set var="headline"><x:out select="event/name" escapeXml="true"/></c:set>
  <c:set var="eventDate"><x:out select="event/date"/></c:set>
  <c:set var="presence"><x:out select="event/presence/type"/></c:set>
  <c:set var="tag">ev-<x:out select="recid"/></c:set>
  <c:set var="exturl"><x:out select="event/url"/></c:set>
  <c:set var="item"><x:out select="event/description" escapeXml="true"/></c:set>
  <fmt:parseDate  var="pdate" pattern="${dateStringPattern}" value="${date}" parseLocale="en_US"/> 
  <fmt:formatDate value="${pdate}" pattern="EEE, dd MMM yyyy HH:mm:ss zzz" var="fdate"/>
  <c:if test="${fn:length(presence) > 0}">
  <item>
      <title>${headline} - ${eventDate}</title>
      <link>${exturl}</link>
      <description>  
      ${item}&lt;br&gt;
      ${presence}&lt;br&gt;
      ${eventDate}
      </description>
      <guid isPermaLink="false">${tag}</guid>
      <pubDate>${fdate}</pubDate>
      <dc:creator>${wdkModel.displayName}</dc:creator>
  </item>
  </c:if>
</x:forEach>

</channel>
</rss>
