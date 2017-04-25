<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fmt="http://java.sun.com/jsp/jstl/fmt"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <jsp:directive.attribute name="title" required="false" 
    description="Title of page"/>

  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}" />
  <c:set var="version" value="${applicationScope.wdkModel.build}" />

  <!-- required for date parsing when client browser (e.g. curl) does not send locale -->
  <fmt:setLocale value="en-US"/>
  <fmt:parseDate var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" pattern="dd MMMM yyyy HH:mm"/> 
  <fmt:formatDate var="formattedReleaseDate" value="${releaseDate}" pattern="d MMM yy"/>

  <div id="header2">
    <div class="upennvet-Logo" style="float:right;position:relative;top:30px;right:13px">
      <a href="http://www.vet.upenn.edu" target=":blank">
        <imp:image width="210px" class="upenn-LogoImage" src="images/${project}/PennVet_Logo_PMS.png" alt="Link to UPenn Vet homepage" />
      </a>
    </div>
    <div class="eupathdb-Logo">
      <a href="${pageContext.request.contextPath}/home.do">
        <imp:image class="eupathdb-LogoImage" src="images/${project}/title_s.png" alt="Link to ${project} homepage" />
      </a>
      <span class="eupathdb-LogoRelease">
        Release ${version}<br/>
        ${formattedReleaseDate}
      </span>
    </div>
  </div>
  <imp:menubar refer="${refer}"/>

  <c:set var="showBanner">
    <imp:extraBanner refer="${refer}" title="${title}"/>
  </c:set>
  <imp:siteAnnounce refer="${refer}" showBanner="${showBanner}"/>

  <!-- include noscript tag on all pages to check if javascript enabled -->
  <!-- it does not stop loading the page. sets the message in the announcement area -->
  <imp:noscript /> 
</jsp:root>
