<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:apifn="http://eupathdb.org/common/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp"
  xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common">

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <jsp:directive.attribute name="title" required="false"
    description="Value to appear in page's title"/>

  <jsp:directive.attribute name="banner" required="false"
    description="Value to appear at top of page if there is no title provided"/>

  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}" />
  <c:set var="banner" value="${apifn:defaultBanner(banner,project)}"/>

  <!--~~~~~~~ links to news and events ~~~~~~~-->
  <c:choose>
    <c:when test="${project eq 'EuPathDB'}">
      <c:set var="eventsRss" value="/ebrcevents.rss"/>
      <c:set var="newsRss" value="/ebrcnews.rss"/>
      <c:set var="releasesRss" value="/ebrcreleases.rss"/>
      <c:set var="publicationsRss" value="/ebrcpublications.rss"/>
      <c:set var="rssorigin" value="EuPathDB BRC" />
    </c:when>
    <c:otherwise>
      <c:set var="eventsRss" value="/events.rss"/>
      <c:set var="newsRss" value="/news.rss"/>
      <c:set var="releasesRss" value="/releases.rss"/>
      <c:set var="publicationsRss" value="/publications.rss"/>
      <c:set var="rssorigin" value="${project}" />
    </c:otherwise>
  </c:choose>

  <!--~~~~~~~ HEAD of HTML doc ~~~~~~~-->
  <common:head title="${title}" banner="${banner}" refer="${refer}">
    <link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} News" href="${newsRss}" />
    <link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} Community Events" href="${eventsRss}" />
    <link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} Releases" href="${releasesRss}" />
    <link rel="alternate" type="application/rss+xml" 
      title="EuPathDB BRC Publications" href="${publicationsRss}" />
  </common:head>
</jsp:root>
