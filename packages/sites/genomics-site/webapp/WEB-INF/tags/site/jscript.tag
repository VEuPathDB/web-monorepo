<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="refer" 
 	      type="java.lang.String"
	      required="true" 
	      description="Page calling this tag"
%>

<c:set var="base" value="${pageContext.request.contextPath}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<link rel="stylesheet" href="<c:url value='/wdkCustomization/css/superfish/css/superfish.css'/>" type="text/css"/>

<%-- When definitions are in conflict, the next one overrides the previous one  --%>
<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" /> 
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />

<!-- JQuery library is included by WDK -->

<!-- comment out, since it is commented out below
<c:if test="${project == 'CryptoDB'}">
  <c:set var="gkey" value="AIzaSyBD4YDJLqvZWsXRpPP8u9dJGj3gMFXCg6s" />
</c:if>
-->

<script type="text/javascript" src="${base}/wdkCustomization/js/lib/hoverIntent.js"></script>
<script type="text/javascript" src="${base}/wdkCustomization/js/lib/superfish.js"></script>
<script type="text/javascript" src="${base}/wdkCustomization/js/lib/supersubs.js"></script>

<!-- Contact Us window -->
<script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>

<c:if test="${refer == 'summary'}">
    <script type="text/javascript" src="${base}/wdkCustomization/js/customStrategy.js"></script>
    <script type="text/javascript" src="${base}/wdkCustomization/js/ortholog.js"></script>
    <script type="text/javascript" src="${base}/wdkCustomization/js/export-basket.js"></script>

    <script type="text/javascript" src="${base}/wdkCustomization/js/spanlogic.js"></script>
    <link rel="stylesheet" href="${base}/wdkCustomization/css/spanlogic.css" type="text/css" />

    <script type="text/javascript" src="${base}/wdkCustomization/js/span-genome-view.js"></script>
    <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/span-genome-view.css"/>

    <!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=${gkey}&sensor=false"></script> -->
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/styledmarker/src/StyledMarker.js"></script>

	  <script type="text/javascript" src="/assets/js/isolateResults.js"></script>
</c:if>

<!-- this seems unneeded since it only contains:
        <script type="text/javascript" src="<c:url value='wdk/js/lib/json.js'/>"></script>
  which is already in the wdk:includes.tag
<c:if test="${refer == 'record'}">
	<imp:recordPageScript />
</c:if>
-->

<c:if test="${refer == 'recordPage'}">
  <script type="text/javascript" src="/assets/js/isolateResults.js"></script>
</c:if>

<c:if test="${refer == 'question' || refer == 'summary'}">
  <imp:parameterScript />
  <script type="text/javascript" src="/assets/js/orthologpattern.js"></script>
  <script type="text/javascript" src="${base}/wdkCustomization/js/span-location.js"></script>
  <script type="text/javascript" src="${base}/wdkCustomization/js/mutuallyExclusiveParams.js"></script>

  <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/question.css"/>
</c:if>

<%-- Quick seach box --%>
<script type="text/javascript" src="/assets/js/quicksearch.js"></script>

<!-- Dynamic query grid (bubbles in home page) -->
<script type="text/javascript" src="/assets/js/dqg.js"></script>

<!-- Sidebar news/events, yellow background -->
<script type="text/javascript" src="/assets/js/newitems.js"></script>

<!-- Access twitter/facebook links, and configure menubar (superfish) -->
<script type="text/javascript" src="${base}/js/nav.js"></script>

<!-- show/hide the tables in the Record page -->
<script type='text/javascript' src="/assets/js/show_hide_tables.js"></script>

<!-- Data source page -->
<c:if test="${refer == 'data-source'}">
  <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/dataSource.css"/>
</c:if>

<!-- SRT page -->
<c:if test="${refer == 'srt'}">
  <script type="text/javascript" src="/assets/js/srt.js"></script>
</c:if>



<%-- need to review these --%>

<!-- fix to transparent png images in IE 7 -->
<!--[if lt IE 7]>
  <script type="text/javascript" src="/assets/js/pngfix.js"></script>
<![endif]-->

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

<!-- empty, used to contain the IE warning popup, and some login/register related functionality
     probably moved to WDK in the latest refactoring Oct 10 2012
<script type="text/javascript" src="/assets/js/popups.js"></script>
-->
