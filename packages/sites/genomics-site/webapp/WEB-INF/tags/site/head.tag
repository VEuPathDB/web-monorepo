<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:apifn="http://apidb.org/apicommon/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

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
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1"/> 

    <link rel="alternate" type="application/rss+xml" 
          title="${rssorigin} News" href="${newsRss}" />
    <link rel="alternate" type="application/rss+xml" 
          title="${rssorigin} Community Events" href="${eventsRss}" />
    <link rel="alternate" type="application/rss+xml" 
          title="${rssorigin} Releases" href="${releasesRss}" />
    <link rel="alternate" type="application/rss+xml" 
          title="EuPathDB BRC Publications" href="${publicationsRss}" />

    <title>
      <jsp:text>${empty title ? banner : title}</jsp:text>
    </title>

    <!-- no needed with next line: <link rel="icon" type="image/png" href="/assets/images/${project}/favicon.ico"/> --> <!-- standard -->
    <link rel="shortcut icon" type="image/x-icon" href="/assets/images/${project}/favicon.ico"/> <!-- for IE7 -->

    <!-- StyleSheets provided by WDK -->
    <imp:wdkStylesheets refer="${refer}" /> 

    <!-- StyleSheets provided by Site -->
    <imp:stylesheets refer="${refer}" /> 

    <!-- extra styling to get around the sidebar on home page. -->
    <c:if test="${refer eq 'home'}">
      <style>
        noscript .announcebox.warn { margin-left: 220px; }
      </style>
    </c:if>

    <!-- JavaScript provided by Site -->
    <imp:javascripts refer="${refer}"/>


  </head>
  
</jsp:root>
