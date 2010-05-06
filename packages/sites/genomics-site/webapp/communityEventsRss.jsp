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
/><c:set
    var="linkTmpl" 
    value="${scheme}://${serverName}${contextPath}/communityEvents.jsp"
/><c:import
    url="http://${serverName}/cgi-bin/xmlMessageRead?messageCategory=Event&projectName=${projectName}" var="xml"
/><x:parse
    doc="${xml}" var="doc"
/><c:set
    var="dateStringPattern" value="dd MMMM yyyy HH:mm"
/><?xml version="1.0" encoding="UTF-8"?>
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
    <atom:link href="${scheme}://${serverName}/events.rss" rel="self" type="application/rss+xml" />

<x:forEach var="r" select="$doc/records/record">
  <c:set var="date"><x:out select="submissionDate"/></c:set>
  <c:set var="headline"><x:out select="event/name" escapeXml="true"/></c:set>
  <c:set var="tag">ev-<x:out select="recid"/></c:set>
  <c:set var="exturl"><x:out select="event/url"/></c:set>
  <c:set var="item"><x:out select="event/description" escapeXml="true"/></c:set>
  <fmt:parseDate  var="pdate" pattern="${dateStringPattern}" value="${date}" parseLocale="en_US"/> 
  <fmt:formatDate value="${pdate}" pattern="EEE, dd MMM yyyy HH:mm:ss zzz" var="fdate"/>
  <item>
      <title>${headline}</title>
      <link>${exturl}</link>
      <description>  
      ${item}
      </description>
      <guid isPermaLink="false">${tag}</guid>
      <pubDate>${fdate}</pubDate>
      <dc:creator>${wdkModel.displayName}</dc:creator>
  </item>
</x:forEach>

</channel>
</rss>
