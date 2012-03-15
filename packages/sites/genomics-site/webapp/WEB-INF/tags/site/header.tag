<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
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

<%-------- OLD set of attributes,  division being used by login and help, banner by many pages   ---------------------%>

<%@ attribute name="banner"
              required="false"
              description="Value to appear at top of page"
%>

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

<%@ attribute name="headElement"
              required="false"
              description="additional head elements"
%>

<%@ attribute name="bodyElement"
              required="false"
              description="additional body elements"
%>

<%---------------------------%>

<%-- flag incoming galaxy.psu.edu users  --%>
<c:if test="${!empty param.GALAXY_URL}">
  <c:set var="GALAXY_URL" value="${param.GALAXY_URL}" scope="session" />
</c:if>
<%-- end Galaxy flag --%>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="facebook" value="${props['FACEBOOK_ID']}" />
<c:set var="twitter" value="${props['TWITTER_ID']}" />

<%-- set default facebook and twitter IDs (can be overridden in model properties) --%>
<c:if test="${facebook eq null or facebook eq ''}">
  <c:set var="facebook" value="pages/EuPathDB/133123003429972"/>
</c:if>
<c:if test="${twitter eq null or twitter eq ''}">
  <c:set var="twitter" value="EuPathDB"/>
</c:if>

<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />

<c:set var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" />
<c:set var="inputDateFormat" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/><%-- req. for date parsing when client browser (e.g. curl) does not send locale --%>
<fmt:parseDate pattern="${inputDateFormat}" var="rlsDate" value="${releaseDate}"/> 
<%-- http://java.sun.com/j2se/1.5.0/docs/api/java/text/SimpleDateFormat.html --%>
<fmt:formatDate var="releaseDate_formatted" value="${rlsDate}" pattern="d MMM yy"/>
  


<%--- Google keys to access the maps for Isolate questions (check with Haiming) ---%>
<c:if test="${project == 'CryptoDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahTMrNE2G2Bled15vogCImXw6TjMNBQeKxJGr2lD8yC0v8vilAhNZXuKjQ" />
</c:if>

<c:if test="${project == 'PlasmoDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahQTcYCy8iFaEFUpq-RKhUlyaXswfRSkzh9P8XS6wfHjLQhH6aRG_redTg" />
</c:if>

<c:if test="${project == 'ToxoDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahTbXWpA0E7vCdCxcYwpPwzMOEinFhTk3zvyW9eMl1CGc0wQabgrO2GHiA" />
</c:if>

<c:if test="${project == 'GiardiaDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahTlNDst8dXAmD5YyQ2VVS97EWFghhQhZPGp197fIBaqTKkE2AWWB1m7xA" />
</c:if>

<c:if test="${project == 'EuPathDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahSsTM_yzu3s1MlIlYUNhUGVfJzobxRb1TdHaeE5y5bGlgFsG1VYMy7KCw" />
</c:if>

<html xmlns="http://www.w3.org/1999/xhtml">

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



<%--------------------------- HEAD of HTML doc ---------------------%>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

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
<link rel="shortcut icon" href="/assets/images/${project}/favicon.ico"> <%-- for IE7 --%>

<%-- import WDK related assets --%> 
<imp:includes refer="${refer}" /> 

<%-- When definitions are in conflict, the next one overrides the previous one  --%>

<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" /> 
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />
<link rel="stylesheet" href="/assets/css/spanlogic.css"         type="text/css" />

<%-- temporary:  generate url for old version of site --%>
<script type="text/javascript">
   var helpEmail = 'help@${project}.org';
</script>
<!-- header : refer = ${refer} -->
<imp:jscript refer="${refer}"/>

<!--[if lte IE 8]>
<style>
   #header_rt {
      width:50%;
   }
</style>
<![endif]-->

<!--[if lt IE 8]>
<link rel="stylesheet" href="/assets/css/ie7.css" type="text/css" />
<![endif]-->

<!--[if lt IE 7]>
<link rel="stylesheet" href="/assets/css/ie6.css" type="text/css" />
<![endif]-->

<c:if test="${param.questionFullName eq 'IsolateQuestions.IsolateByCountry'}">
  <script type="text/javascript" src="/assets/js/google_map.js"></script>
  <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=${gkey}" type="text/javascript"></script>
</c:if>

<c:if test="${refer == 'home'}">
  <style>  <%-- extra styling to get around the sidebar on home page. --%>
    noscript .announcebox.warn {
      margin-left: 220px;
    }
  </style>
</c:if>

<%-- not in use currently --%>
${headElement}

</head>


<%--------------------------- BODY of HTML doc ---------------------%>
<body>

<%-- the "Contact Us" page does not need header, only the css above --%>
   <c:if test="${division != 'help'}"> 

<%-- added for overLIB --%>
<div id="overDiv" style="position:absolute; visibility:hidden; z-index:1000;"></div>

<div id="header2">
   <div style="width:518px;" id="header_rt">

   <div align="right"><div id="toplink">
   <c:if test="${project == 'TriTrypDB'}">
     <map name="partof">
     <area shape=rect coords="0,0 172,22" href="http://eupathdb.org" alt="EuPathDB home page">
     <area shape=rect coords="310,0 380,22" href="http://www.genedb.org" alt="GeneDB home page">
     </map>
   </c:if>


   <c:choose>
    <c:when test="${project == 'EuPathDB'}">
       <%-- we have it for now so the page renders correctly --%>
       <a href="http://eupathdb.org"><img src="/assets/images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/></a>   
   </c:when>
   <c:when test="${project == 'TriTrypDB'}">
     <img  usemap="#partof" src="/assets/images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/>
   </c:when>
   <c:otherwise>
     <a href="http://eupathdb.org"><img src="/assets/images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/></a>   
   </c:otherwise>
   </c:choose>
   </div></div>
       
   <div id="facebook-link" style="display:none">https://facebook.com/${facebook}</div>
   <div id="twitter-link" style="display:none">http://twitter.com/${twitter}</div>
    <div style="width:537px;" id="bottom">
      <imp:quickSearch />
      <imp:smallMenu refer="${refer}"/>

   </div>  <%-- id="bottom"    --%>
   </div>  <%-- id="header_rt" --%>


<%------------- TOP HEADER:  SITE logo and DATE _______  is a EuPathDB Project  ----------------%>
   <p><a href="/"><img src="/assets/images/${project}/title_s.png" alt="Link to ${project} homepage" align="left" /></a></p>

   <p>&nbsp;</p>
   <p>Version ${version}<br />
   ${releaseDate_formatted}</p>

</div>  <%-- id="header2" --%>



<%------------- REST OF PAGE  ----------------%>

<imp:menubar refer="${refer}"/>
<imp:siteAnnounce  refer="${refer}"/>


</c:if>  <%-- page was not the "Contact Us" page --%>

<imp:noscript /> <%-- include noscript tag on all pages to check if javascript enabled --%>

<c:if test="${refer != 'home' && refer != 'home2' && refer != 'summary'}">
	<div id="contentwrapper">
	<div id="contentcolumn2">
	<div class="innertube">
</c:if>

