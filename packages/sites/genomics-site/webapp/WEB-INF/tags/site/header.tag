<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fmt="http://java.sun.com/jsp/jstl/fmt"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>

  <jsp:directive.attribute name="title" required="false" 
              description="brings information about the recordclass"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>
  
  <c:set var="version" value="${applicationScope.wdkModel.version}" />
  <c:set var="build" value="${applicationScope.wdkModel.build}" />
  <fmt:setLocale value="en-US"/> <!-- req. for date parsing when client browser (e.g. curl) does not send locale -->
  <fmt:parseDate  var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" pattern="dd MMMM yyyy HH:mm"/> 
  <fmt:formatDate var="releaseDate_formatted" value="${releaseDate}" pattern="d MMM yy"/>

  <c:if test="${refer ne 'home'}">
    <![CDATA[ <!-- FreeFind Begin No Index --> ]]>
  </c:if>

  <!-- site search: freefind engine instructs to position this right after body tag -->
  <imp:freefind_header/>

  <!-- helper divs with generic information used by javascript; vars can also be used in any page using this header -->
  <!-- moved to wdkJavascripts tag
  <imp:siteInfo/>
  -->

  <div id="header2">

    <div id="header_rt">
  
      <div id="toplink">
        <c:if test="${project eq 'TriTrypDB'}">
          <map name="partof">
            <area shape="rect" coords="0,0 172,22" href="http://eupathdb.org" alt="EuPathDB home page"/>
            <area shape="rect" coords="310,0 380,22" href="http://www.genedb.org" alt="GeneDB home page"/>
          </map>
        </c:if>
        <c:choose>
          <c:when test="${project eq 'TriTrypDB'}">
            <imp:image usemap="#partof" src="images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/>
          </c:when>
          <c:otherwise>
            <a href="http://eupathdb.org"><imp:image src="images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/></a>   
          </c:otherwise>
        </c:choose>
      </div>   <!-- id="toplink" -->
   
      <br/>
      <imp:quickSearch />                <!-- <div id="quick-search" -->
      <imp:smallMenu refer="${refer}"/>  <!-- <div id="nav_topdiv" -->
  
    </div>  <!-- id="header_rt" -->

    <!--~~~~~~~ TOP LEFT: SITE name and release DATE ~~~~~~~-->
  <c:choose>
  <c:when test="${project == 'HostDB'}">
    <a href="/" style="font-color:blue;font-size:600%;font-weight:bold;position:relative;left:30px;top:5px">HostDB</a>
    <span style="position:relative;top:-30px;left:29px">Build ${build}</span> 
    <span style="position:relative;top:-20px;left:-20px">${releaseDate_formatted}</span>
  </c:when>
  <c:otherwise>
  <a href="/"><imp:image src="images/${project}/title_s.png" alt="Link to ${project} homepage" align="left" /></a>
    Build ${build}<br/>
    ${releaseDate_formatted}
  </c:otherwise>
  </c:choose>
  </div>

  <!--~~~~~~~ REST OF PAGE ~~~~~~~-->

  <imp:menubar refer="${refer}"/>

	<c:set var="showBanner">
		<imp:extraBanner refer="${refer}" title="${title}"/>
	</c:set>
  <imp:siteAnnounce refer="${refer}" showBanner="${showBanner}"/>

  <!-- include noscript tag on all pages to check if javascript enabled -->
  <!-- it does not stop loading the page. sets the message in the announcement area -->
  <imp:noscript /> 

  <c:if test="${refer != 'home'}">
    <![CDATA[ <!-- FreeFind End No Index --> ]]>
  </c:if>
  
</jsp:root>
