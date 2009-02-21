<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="title"
              description="Value to appear in page's title"
%>
<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>

<%-------- OLD set of attributes,  division being used by login, banner by many pages   ---------------------%>

<%@ attribute name="banner"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="bannerPreformatted"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="logo"
              required="false"
              description="relative url for logo to display, or no logo if set to 'none'"
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

<%@ attribute name="isBannerImage"
              required="false"
%>
<%@ attribute name="releaseDate"
              required="false"
%>
<%@ attribute name="bannerSuperScript"
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

<c:if test="${project == 'CryptoDB'}">
  <c:set var="gkey" value="ABQIAAAAqKP8fsrz5sK-Fsqee-NSahTMrNE2G2Bled15vogCImXw6TjMNBQeKxJGr2lD8yC0v8vilAhNZXuKjQ" />
</c:if>

<html xmlns="http://www.w3.org/1999/xhtml">

<!--[if IE]>
<style type="text/css" media="screen">
	body {
		behavior: url(/assets/css/csshover.htc);
		font-size: 100%;
	}

	.ts_ie {
		margin-left:-15px;
	}

	#menu ul li {
		float: left; width: 100%;
	}
	
	#menu ul li a {
		height: 1%;
	} 

	#menu a, #menu h2 {
		font: bold 0.7em/1.4em arial, helvetica, sans-serif;
	}

	.twoColHybLt #sidebar1 { 
		padding-top: 30px; 
	}
	
	.twoColHybLt #mainContent { 
		zoom: 1; padding-top: 15px; 
	}
	
	#menu_lefttop {
		/*width: 220px;*/
		margin-top: 8px;
		position: absolute;
		left: 6px;
		top: 129px;
	}
	
	*html .menu_lefttop_drop{
		padding-left:8px;
		padding-right:19px;
	}
	
	*html #info {
	   width: 250px;
	   min-height: 240px;
	   height:auto;
	   background-image: /assets/images/bubble_backgrnd.png);
	   background-repeat: repeat-y;
	   text-align: left;
	   padding-top: 2px;
	   padding-left: 19px;
	   z-index: 99;
	}
	
	*html #infobottom{
		width:250px;
		margin:0px -3px 0px;
	}
	
	*html table tr td{
		vertical-align: top;
	}
	
	*html #contentcolumn, *html #contentcolumn{
		width:100%
	}
	
	*html .rightarrow2 {
		left: .5em;
		top: -3.4em;
	}
	
	*html .crumb_details {
		width: 500px;
		z-index: 999;
	}
	
	*html .operation {
		z-index: -1;
	}
	
	a.redbutton {
		z-index: -1;
	}
		
</style>
<![endif]-->

<%------------------ setting title --------------%>

<c:if test="${banner == null}">
<c:choose>
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
<link rel="stylesheet" href="<c:url value='/misc/style.css'/>"   type="text/css" />  
<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" />
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />
<link rel="stylesheet" href="/assets/css/flexigrid/flexigrid.css" type="text/css"/>
<link rel="stylesheet" href="/assets/css/history.css"            type="text/css"/>
<link rel="stylesheet" href="/assets/css/Strategy.css"           type="text/css" />
<link rel="StyleSheet" href="/assets/css/filter_menu.css"        type="text/css"/>

<style type="text/css">
<!--
body {
	background-image: url(/assets/images/${project}/background_s.jpg);
	background-repeat: repeat-x;
    }
body {
behavior: url(/assets/css/csshover.htc);
}
#header {
	height: 104px;
	background-image: url(/assets/images/${project}/backgroundtop_s.jpg);
}
#header p {
	font-size: 9px;
}
-->
</style>

<site:jscript refer="${refer}"/>

<c:if test="${project == 'CryptoDB'}">
  <script type="text/javascript" src="/assets/js/google_map.js"></script>
  <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=${gkey}" type="text/javascript"></script>
</c:if>

<%-- not in use currently --%>
${headElement}

</head>


<%--------------------------- BODY of HTML doc ---------------------%>
<body>

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
	     <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#generalinfo"/>">General Information</a></li
   	     <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#funding"/>">Funding</a></li>
	     <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#organisms"/>">Organisms in ${project}</a></li>
	     <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#use"/>">How to use this resource</a></li>
             <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">How to cite us</a></li>

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
          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Community Links</a></li>
          <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Glossary of Terms</a></li>
          <li><a href="/awstats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Statistics</a></li>
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
        <c:url value="login.jsp" var="loginUrl">
           <c:param name="originUrl" value="${originRequestUrl}"/> 
        </c:url>
        <%-- 
            urlencode the login page's URL and append as a parameter 
            in the queryString.
            If login fails, user returns to the refererUrl. If login
            succeeds, user should return to originUrl.
        --%>
        <c:url var="loginJsp" value='login.jsp'/>
        <c:url value="${loginUrl}" var="loginUrl">
           <c:param name="refererUrl" value="${loginJsp}"/> 
        </c:url>

<%-- in home_header login is a class instead of an id that brings up the popup --%>
          <li>
            <a href="${loginUrl}" id='login'>Login<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a>
               <ul class="login">
                    <li><site:login/></li>
              </ul>

         </li>
          <li>
          <a href="<c:url value='showRegister.do'/>" id='register'>Register</a></li>

        
    </c:when>

    <c:otherwise>
       <c:url value="processLogout.do" var="logoutUrl">
          <c:param name="refererUrl" value="${originRequestUrl}"/> 
       </c:url>

          <li>
            <a href="<c:url value='/showProfile.do'/>" id='profile'>${wdkUser.firstName} ${wdkUser.lastName}'s Profile<img src="/assets/images/${project}/menu_divider5.png" alt="" width="17" height="9" /></a></li>
          <li>
            <a href="<c:url value='${logoutUrl}' />" id='logout'>Logout</a></li>

    </c:otherwise>
  </c:choose>


           </ul>

      </div>  <%-- id="nav_top" --%>
      	  
   </div>  <%-- id="bottom"    --%>
   </div>  <%-- id="header_rt" --%>

<%------------- TOP HEADER:  SITE logo and DATE _______  is a EuPathDB Project  ----------------%>

   <c:if test="${fn:containsIgnoreCase(project, 'CryptoDB')}">
     <c:set var="width" value="318" />
     <c:set var="height" value="64" />
     <c:set var="version" value="4.0" />
     <c:set var="date" value="January 15th, 2009" />
   </c:if>

   <c:if test="${fn:containsIgnoreCase(project, 'TriTrypDB')}">
     <c:set var="width" value="320" />
     <c:set var="height" value="72" />
     <c:set var="version" value="1.0" />
     <c:set var="date" value="January 15th, 2009" />
   </c:if>

 <c:if test="${fn:containsIgnoreCase(project, 'PlasmoDB')}">
     <c:set var="width" value="320" />
     <c:set var="height" value="72" />
     <c:set var="version" value="1.0" />
     <c:set var="date" value="May 15th, 2009" />
   </c:if>


   <p><a href="/"><img src="/assets/images/${project}/title_s.png" alt="Link to ${project} homepage" 
	width="${width}" height="${height}" align="left" /></a></p>
   <p>&nbsp;</p>
   <p>Version ${version}<br />
   ${date}</p>

</div>  <%-- id="header2" --%>



<%------------- REST OF PAGE  ----------------%>

<site:menubar />
<site:siteAnnounce  refer="${refer}"/>

<c:if test="${refer != 'home' && refer != 'home2'}">
	<div id="contentwrapper">
	<div id="contentcolumn2">
	<div class="innertube">
</c:if>

