<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
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


<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />

<c:set var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" />
<c:set var="inputDateFormat" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/><%-- req. for date parsing when client browser (e.g. curl) doesn't send locale --%>
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
</c:choose>
</c:if>



<%--------------------------- HEAD of HTML doc ---------------------%>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<c:url var='eventsRss' value='/communityEventsRss.jsp'/>
<c:url var='newsRss' value='/showXmlDataContent.do?name=XmlQuestions.NewsRss'/>
<link rel="alternate" type="application/rss+xml" 
      title="${wdkModel.displayName} News" href="${newsRss}" />
<link rel="alternate" type="application/rss+xml" 
      title="${wdkModel.displayName} Community Events" href="${eventsRss}" />

<title>
<c:out value="${title}" default="${banner}" />
</title>



<link rel="icon" type="image/png" href="/assets/images/${project}/favicon.ico"> <%-- standard --%>
<link rel="shortcut icon" href="/assets/images/${project}/favicon.ico"> <%-- for IE7 --%>

<%-- import WDK related assets --%> 
<wdk:includes /> 


<%-- When definitions are in conflict, the next one overrides the previous one  --%>
<%-- We need to figure out which styles we are using from this old file and set them in the project.css file --%>
<%-------  keep it for generecordpage while we do that --%>
<%-- <link rel="stylesheet" href="<c:url value='/misc/style.css'/>"   type="text/css" />   --%>
<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" />
<link rel="stylesheet" href="/assets/css/jquery-ui-1.7.2.custom.css"           type="text/css" />
<link rel="stylesheet" href="/assets/css/history.css"            type="text/css"/>
<link rel="stylesheet" href="/assets/css/dyk.css"            type="text/css"/>
<link rel="stylesheet" href="/assets/css/Strategy.css"           type="text/css" />
<link rel="StyleSheet" href="/assets/css/filter_menu.css"        type="text/css"/>
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />
<link rel="StyleSheet" href="/assets/css/jquery.autocomplete.css" type="text/css"/>
<link rel="StyleSheet" href="/assets/css/jquery.multiSelect.css" type="text/css"/>
<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
<%-- temporary:  generate url for old version of site --%>
<script type="text/javascript">
   var oldSiteUrl = 'http://old.${project}.org';
</script>

<site:jscript refer="${refer}"/>

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
   <div id="header_rt">

   <div align="right"><div id="toplink">
    <%------ skip skips to menubar.tag ----%>
   <a href="#skip"><img src="/assets/images/transparent1.gif" alt="Skip navigational links" width="1" height="1" border="0" /></a>


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
       

    <div id="bottom">
      <site:quickSearch /><br />

<%---------------------- Small Menu Options on Header  ------------------%>
      <div id="nav_topdiv">
           <ul id="nav_top">
      <li>
      <a href="#">About ${siteName}<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      	<ul>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>">${siteName} News</a></li>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#generalinfo"/>">General Information</a></li>
<c:choose>
<c:when test="${project == 'EuPathDB'}" >
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">Organisms in ${project}</a></li>
</c:when>
<c:otherwise>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#organisms"/>">Organisms in ${project}</a></li>
</c:otherwise>
</c:choose>

	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#stats"/>">Data Statistics</a></li>
	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#advisors"/>">Scientific Advisory Team</a></li>
 	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#acks"/>">Acknowledgements</a></li>
 	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#funding"/>">Funding</a></li>


	<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#use"/>">How to use this resource</a></li>
        <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">How to cite us</a></li>
<%--    <c:if test="${project == 'EuPathDB'}" >  --%>
        <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#docs_pubs"/>">EuPathDB Publications</a></li>
<%-- </c:if> --%>
        <li><a href="/proxystats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>         

<%-- 
          <li><a href="#">Who We Are</a></li>
          <li><a href="#">What We Do</a></li>
          <li><a href="#">What You Can Do Here</a></li>
          <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.News'/>">News</a></li>
          <li><a href="#">Acknowledgements</a></li>
--%>
        </ul>
      </li>
      <li>
      <a href="#">Help<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
      		<ul>


          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>">Web Tutorials</a></li>
    	  <c:if test="${refer == 'customSummary'}">
		  	<li><a href="javascript:void(0)" onclick="dykOpen()">Did You Know...</a></li>
          </c:if>
          <li><a href="http://workshop.eupathdb.org/2010/">2010 EuPathDB Workshop</a></li>
<%--	  <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Community Links</a></li> --%>
          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Glossary of Terms</a></li>
          <li><a href="<c:url value="http://eupathdb.org/tutorials/eupathdbFlyer.pdf"/>">EuPathDB Brochure</a></li>
        	</ul>
      </li>
      <li>
      <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">
		Contact Us<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a></li>
 
 
 <site:requestURL/>
 <c:choose>
    <c:when test="${wdkUser == null || wdkUser.guest == true}">
    
      <%--------------- Construct links to login/register/profile/logout pages -------------%>  
        <%-- 
            urlencode the enclosing page's URL and append as a parameter 
            in the queryString. site:requestURL compensates
            for Struts' url mangling when forward in invoked.
        --%>
        <c:url value="/login.jsp" var="loginUrl">
           <c:param name="originUrl" value="${originRequestUrl}"/> 
        </c:url>
        <%-- 
            urlencode the login page;s URL and append as a parameter 
            in the queryString.
            If login fails, user returns to the refererUrl. If login
            succeeds, user should return to originUrl.
        --%>

          <li>
            <a href="javascript:void(0)" onclick="popLogin()">Login<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
	    <div id="loginForm" style="display:none;"><h2 style="text-align: center">EuPathDB Account Login</h2><site:login includeCancel="true" /></div>
              <%-- <ul class="login">
                    <li><site:login /></li>
              </ul> --%>

         </li>
          <li>
<%--          <a href="<c:url value='/showRegister.do'/>" id='register'>Register</a> --%>

 <a href="javascript:void(0)" onclick="popRegister()">Register</a>
	    <div id="registerForm" style="display:none;"><h2 style="text-align: center">EuPathDB Account Registration</h2><site:register includeCancel="true" /></div>

       </li>

        
    </c:when>

    <c:otherwise>
       <c:url value="processLogout.do" var="logoutUrl">
          <c:param name="refererUrl" value="${originRequestUrl}"/> 
       </c:url>

          <li>
            <a href="<c:url value='/showProfile.do'/>" id='profile'>${wdkUser.firstName} ${wdkUser.lastName}'s Profile<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a></li>
          <li>
            <a href="<c:url value='/${logoutUrl}' />" id='logout'>Logout</a></li>

    </c:otherwise>
  </c:choose>


           </ul>

      </div>  <%-- id="nav_top" --%>
      	  
   </div>  <%-- id="bottom"    --%>
   </div>  <%-- id="header_rt" --%>

<%------------- TOP HEADER:  SITE logo and DATE _______  is a EuPathDB Project  ----------------%>
   <p><a href="/"><img src="/assets/images/${project}/title_s.png" alt="Link to ${project} homepage" align="left" /></a></p>

   <p>&nbsp;</p>
   <p>Version ${version}<br />
   ${releaseDate_formatted}</p>

</div>  <%-- id="header2" --%>



<%------------- REST OF PAGE  ----------------%>

<site:menubar />
<site:siteAnnounce  refer="${refer}"/>


</c:if>  <%-- page was not the "Contact Us" page --%>



<c:if test="${refer != 'home' && refer != 'home2'}">
	<div id="contentwrapper">
	<div id="contentcolumn2">
	<div class="innertube">
</c:if>

