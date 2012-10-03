<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%@ attribute name="title"
              description="Value to appear in page's title"
%>
<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>
<%@ attribute name="banner"
              required="false"
              description="Value to appear at top of page if there is no title provided"
%>

<%-------- OLD set of attributes:
                header:  only "division" being used (for login and contact us)
                division and banner used in many pages,
                most in use still in many jsps, all XMLQuestion pages and custom gene record pages
                summary used ONLY in gene record pages        ---------------------%>
 
<%@ attribute name="parentDivision"
              required="false"
%>
<%@ attribute name="parentUrl"
              required="false"
%>
<%@ attribute name="divisionName"
              required="false"
%>
<%@ attribute name="division"
              required="false"
%>
<%@ attribute name="summary"
              required="false"
              description="short text description of the page"
%>
<%---------------------------%>

<%-- flag incoming galaxy.psu.edu users  --%>
<c:if test="${!empty param.GALAXY_URL}">
  <c:set var="GALAXY_URL" value="${param.GALAXY_URL}" scope="session" />
</c:if>
<%-- end Galaxy flag --%>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />
<c:set var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" />

<c:set var="inputDateFormat" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/>    <%-- req. for date parsing when client browser (e.g. curl) does not send locale --%>
<fmt:parseDate  var="rlsDate"               value="${releaseDate}"  pattern="${inputDateFormat}"/> 
<fmt:formatDate var="releaseDate_formatted" value="${rlsDate}"     pattern="d MMM yy"/>
 
<%-- set default facebook and twitter IDs (can be overridden in model properties) --%>
<c:set var="facebook" value="${props['FACEBOOK_ID']}" />
<c:set var="twitter" value="${props['TWITTER_ID']}" />
<c:if test="${facebook eq null or facebook eq ''}">
  <c:set var="facebook" value="pages/EuPathDB/133123003429972"/>
</c:if>
<c:if test="${twitter eq null or twitter eq ''}">
  <c:set var="twitter" value="EuPathDB"/>
</c:if>

<%------------------ setting title --------------%>
<c:if test="${banner == null}">
<c:choose>
      <c:when test = "${project == 'EuPathDB'}">
             <c:set var="banner" value="EuPathDB : The Eukaryotic Pathogen genome resource"/>
      </c:when>
      <c:when test = "${project == 'CryptoDB'}">
             <c:set var="banner" value="CryptoDB : The Cryptosporidium genome resource"/>
      </c:when>
      <c:when test = "${project == 'GiardiaDB'}">
             <c:set var="banner" value="GiardiaDB : The Giardia genome resource"/>
      </c:when>
	   <c:when test = "${project == 'PiroplasmaDB'}">
             <c:set var="banner" value="PiroplasmaDB : The Piroplasma genome resource"/>
      </c:when>
      <c:when test = "${project == 'PlasmoDB'}">
             <c:set var="banner" value="PlasmoDB : The Plasmodium genome resource"/>
      </c:when>
      <c:when test = "${project == 'ToxoDB'}">
             <c:set var="banner" value="ToxoDB : The Toxoplasma genome resource"/>
      </c:when>
      <c:when test = "${project == 'TrichDB'}">
             <c:set var="banner" value="TrichDB : The Trichomonas genome resource"/>
      </c:when>
      <c:when test = "${project == 'TriTrypDB'}">
             <c:set var="banner" value="TriTrypDB: The Kinetoplastid genome resource"/>
      </c:when>
      <c:when test = "${project == 'AmoebaDB'}">
             <c:set var="banner" value="AmoebaDB: The Amoeba genome resource"/>
      </c:when>
      <c:when test = "${project == 'MicrosporidiaDB'}">
             <c:set var="banner" value="MicrosporidiaDB: The Microsporidia genome resource"/>
      </c:when>
</c:choose>
</c:if>

<%------------------ links to news and events  --------------%>
<c:choose>
  <c:when test = "${project == 'EuPathDB'}">
    <c:set var='eventsRss' value='/ebrcevents.rss'/>
    <c:set var='newsRss'   value='/ebrcnews.rss'/>
    <c:set var='releasesRss' value='/ebrcreleases.rss'/>
    <c:set var='publicationsRss' value='/ebrcpublications.rss'/>
    <c:set var='rssorigin' value='EuPathDB BRC' />
  </c:when>
  <c:otherwise>
    <c:set var='eventsRss' value='/events.rss'/>
    <c:set var='newsRss'   value='/news.rss'/>
    <c:set var='releasesRss' value='/releases.rss'/>
    <c:set var='publicationsRss' value='/publications.rss'/>
    <c:set var='rssorigin' value="${project}" />
  </c:otherwise>
</c:choose>



<html xmlns="http://www.w3.org/1999/xhtml">

<%--------------------------- HEAD of HTML doc ---------------------%>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1"> 

<link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} News" href="${newsRss}" />
<link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} Community Events" href="${eventsRss}" />
<link rel="alternate" type="application/rss+xml" 
      title="${rssorigin} Releases" href="${releasesRss}" />
<link rel="alternate" type="application/rss+xml" 
      title="EuPathDB BRC Publications" href="${publicationsRss}" />

<title>
<c:out value="${title}" default="${banner}" />
</title>

<link rel="icon" type="image/png" href="/assets/images/${project}/favicon.ico"> <%-- standard --%>
<link rel="shortcut icon" href="/assets/images/${project}/favicon.ico">         <%-- for IE7 --%>

<%-- from WDK --%>
<imp:includes refer="${refer}" /> 

<%-- other API links and javascript--%>
<imp:jscript refer="${refer}"/>

<c:if test="${refer == 'home'}">
  <style>  <%-- extra styling to get around the sidebar on home page. --%>
    noscript .announcebox.warn {margin-left: 220px; }
  </style>
</c:if>

</head>

<c:if test="${refer != 'home'}">
	<!-- FreeFind Begin No Index -->
</c:if>

<%--------------------------- BODY of HTML doc ---------------------%>
<body>

<!-- site search: freefind engine instructs to position this right after body tag -->
<imp:freefind_header />

<!-- helper divs with generic information used by javascript; vars can also be used in any page using this header -->
<imp:siteInfo />

<%-- to store the links, reachable via nav.js functions, from smallMenu, sidebar community, menubar community etc --%>      
<div id="facebook-link" style="display:none">https://facebook.com/${facebook}</div>
<div id="twitter-link" style="display:none">http://twitter.com/${twitter}</div>


<div id="header2">

  <div style="width:518px;" id="header_rt">

    <div id="toplink">
    <c:if test="${project == 'TriTrypDB'}">
      <map name="partof">
      <area shape=rect coords="0,0 172,22" href="http://eupathdb.org" alt="EuPathDB home page">
      <area shape=rect coords="310,0 380,22" href="http://www.genedb.org" alt="GeneDB home page">
      </map>
    </c:if>
    <c:choose>
    <c:when test="${project == 'TriTrypDB'}">
      <img  usemap="#partof" src="/assets/images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/>
    </c:when>
    <c:otherwise>
      <a href="http://eupathdb.org"><img src="/assets/images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/></a>   
    </c:otherwise>
    </c:choose>
    </div>   <%-- id="toplink" --%>
 
    <br>
    <imp:quickSearch />								 <%-- <div id="quick-search" --%>
    <imp:smallMenu refer="${refer}"/>  <%-- <div id="nav_topdiv" --%>

  </div>  <%-- id="header_rt" --%>


<%------------- TOP LEFT: SITE name and release DATE  ----------%>
  <a href="/"><img src="/assets/images/${project}/title_s.png" alt="Link to ${project} homepage" align="left" /></a>
	Version ${version}<br/>
  ${releaseDate_formatted}

</div>  <%-- id="header2" --%>


<%------------- REST OF PAGE  ----------------%>

<imp:menubar refer="${refer}"/>
<imp:siteAnnounce  refer="${refer}"/>

<%-- include noscript tag on all pages to check if javascript enabled --%>
<%-- it does not stop loading the page. sets the message in the announcement area --%>
<imp:noscript /> 

<c:if test="${refer != 'home'}">
	<!-- FreeFind End No Index -->
</c:if>

<c:if test="${refer != 'home' && refer != 'home2' && refer != 'summary'}">
	<div id="contentwrapper">
	<div id="contentcolumn2">
	<div class="innertube">
</c:if>

