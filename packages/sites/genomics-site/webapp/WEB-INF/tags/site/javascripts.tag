<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" 
      type="java.lang.String"
      required="true" 
      description="Page calling this tag"/>

  <jsp:useBean id="websiteRelease" class="org.eupathdb.common.controller.WebsiteReleaseConstants"/>

  <c:set var="debug" value="${requestScope.WEBSITE_RELEASE_STAGE eq websiteRelease.development}"/>
  <!-- JavaScript provided by WDK -->
  <imp:wdkJavascripts refer="${refer}" debug="${debug}"/>

  <c:set var="base" value="${pageContext.request.contextPath}"/>
  <c:set var="props" value="${applicationScope.wdkModel.properties}" />
  <c:set var="project" value="${props['PROJECT_ID']}" />

  <!-- JQuery library is included by WDK -->

  <!-- comment out, since it is commented out below
  <c:if test="${project == 'CryptoDB'}">
    <c:set var="gkey" value="AIzaSyBD4YDJLqvZWsXRpPP8u9dJGj3gMFXCg6s" />
  </c:if>
  -->

  <imp:script src="wdkCustomization/js/lib/hoverIntent.js"/>
  <imp:script src="wdkCustomization/js/lib/superfish.js"/>
  <imp:script src="wdkCustomization/js/common.js"/>
  <imp:script src="wdkCustomization/js/custom-login.js"/>

  <!-- Contact Us window -->
  <imp:script src='js/newwindow.js'/>

  <c:if test="${refer == 'summary'}">
    <imp:script src="wdkCustomization/js/customStrategy.js"/>
    <imp:script src="wdkCustomization/js/ortholog.js"/>
    <imp:script src="wdkCustomization/js/export-basket.js"/>
    <imp:script src="wdkCustomization/js/spanlogic.js"/>
    <imp:script src="wdkCustomization/js/genome-view.js"/>

      <!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=${gkey}&sensor=false"><jsp:text/></script> -->
      <!-- moved to isolateResults.tag
      <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"><jsp:text/></script>
      <script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/styledmarker/src/StyledMarker.js"><jsp:text/></script>
      -->

      <!-- TODO Move to webapp -->
      <script type="text/javascript" src="/assets/js/isolateResults.js"><jsp:text/></script>
  </c:if>

  <!-- this seems unneeded since it only contains:
          <script type="text/javascript" src="${base}/wdk/lib/json.js"><jsp:text/></script>
    which is already in the wdk:includes.tag
  <c:if test="${refer == 'record'}">
    <imp:recordPageScript />
  </c:if>
  -->

  <c:if test="${refer == 'recordPage'}">
    <!-- TODO Move to webapp -->
    <script type="text/javascript" src="/assets/js/isolateResults.js"><jsp:text/></script>
  </c:if>

  <c:if test="${refer == 'question' || refer == 'summary'}">
    <!-- <imp:parameterScript /> -->
    <script src="/assets/js/orthologpattern.js"><jsp:text/></script>
    <imp:script src="wdkCustomization/js/span-location.js"/>
    <imp:script src="wdkCustomization/js/mutuallyExclusiveParams.js"/>
    <imp:script src="wdkCustomization/js/dataset-searches.js"/>
    <imp:script src="wdkCustomization/js/questions/fold-change.js"/>
    <imp:script src="wdkCustomization/js/questions/radio-params.js"/>
    <imp:script src="wdkCustomization/js/questions/isolatesByTaxon.js"/>
    <imp:script src="wdkCustomization/js/analysis/enrichment.js"/>
  </c:if>

  <!-- Quick seach box -->
  <script type="text/javascript" src="/assets/js/quicksearch.js"><jsp:text/></script>

  <!-- Dynamic query grid (bubbles in home page) -->
  <script type="text/javascript" src="/assets/js/dqg.js"><jsp:text/></script>

  <!-- Sidebar news/events, yellow background -->
  <script type="text/javascript" src="/assets/js/newitems.js"><jsp:text/></script>

  <!-- Access twitter/facebook links, and configure menubar (superfish) -->
  <imp:script src="js/nav.js"/>

  <!-- show/hide the tables in the Record page -->
  <script type='text/javascript' src="/assets/js/show_hide_tables.js"><jsp:text/></script>

  <!-- SRT page -->
  <c:if test="${refer == 'srt'}">
    <script type="text/javascript" src="/assets/js/srt.js"><jsp:text/></script>
  </c:if>



  <!-- need to review these -->

  <!-- fix to transparent png images in IE 7 -->
  <!--[if lt IE 7]>
    <script type="text/javascript" src="/assets/js/pngfix.js"><jsp:text/></script>
  <![endif]-->

  <!-- empty, used to contain the IE warning popup, and some login/register related functionality
       probably moved to WDK in the latest refactoring Oct 10 2012
  <script type="text/javascript" src="/assets/js/popups.js"><jsp:text/></script>
  -->
</jsp:root>
