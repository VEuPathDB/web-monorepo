<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="refer" 
 	      type="java.lang.String"
	      required="true" 
	      description="Page calling this tag"
%>



<%-- When definitions are in conflict, the next one overrides the previous one  --%>
<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" /> 
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />
<link rel="stylesheet" href="/assets/css/spanlogic.css"         type="text/css" />


<%-- JQuery library is included by WDK --%>

<c:if test="${project == 'CryptoDB'}">
  <c:set var="gkey" value="AIzaSyBD4YDJLqvZWsXRpPP8u9dJGj3gMFXCg6s" />
</c:if>

<c:if test="${refer == 'summary'}">

    <!-- javascript provided by site -->
    <script type="text/javascript" src='<c:url value="/wdkCustomization/js/customStrategy.js" />'></script>
    <script type="text/javascript" src="<c:url value='/wdkCustomization/js/spanlogic.js' />"></script>
    <script type="text/javascript" src="<c:url value='/wdkCustomization/js/ortholog.js' />"></script>
    <script type="text/javascript" src="<c:url value='/wdkCustomization/js/export-basket.js' />"></script>
    <script type="text/javascript" src='<c:url value="/wdkCustomization/js/span-genome-view.js"/>'></script>
    <link rel="StyleSheet" type="text/css" href="<c:url value='/wdkCustomization/css/span-genome-view.css' />"/>

    <!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=${gkey}&sensor=false"></script> -->
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/styledmarker/src/StyledMarker.js"></script>

	<script type="text/javascript" src="/assets/js/isolateResults.js"></script>

</c:if>

<!-- jscript : refer = ${refer}-->
<c:if test="${refer == 'record'}">
	<!-- RecordPageScript Included -->
	<imp:recordPageScript />
</c:if>


<c:if test="${refer == 'question' || refer == 'summary'}">
  <imp:parameterScript />
  <script type="text/javascript" src="/assets/js/orthologpattern.js"></script>
  <script type="text/javascript" src="<c:url value='/wdkCustomization/js/span-location.js' />"></script>
  <script type="text/javascript" src="<c:url value='/wdkCustomization/js/mutuallyExclusiveParams.js' />"></script>
  <link rel="StyleSheet" type="text/css" href="<c:url value='/wdkCustomization/css/question.css' />"/>
</c:if>


<%-- js for quick seach box --%>
<script type="text/javascript" src="/assets/js/quicksearch.js"></script>

<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/dqg.js"></script>
<script type="text/javascript" src="/assets/js/newitems.js"></script>

<script type="text/javascript" src="/assets/js/popups.js"></script>
<!-- now api.js is in wdk  <script type="text/javascript" src="/assets/js/api.js"></script>  -->
<script type="text/javascript" src="/assets/js/nav.js"></script>


<!-- fix to transparent png images in IE 7 -->
<!--[if lt IE 7]>
<script type="text/javascript" src="/assets/js/pngfix.js"></script>
<![endif]-->

<!-- js for Contact Us window -->
<script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>


<c:if test="${refer == 'srt'}">
<script type="text/javascript" src="/assets/js/srt.js"></script>
</c:if>

<!-- js for popups in query grid and other.... -->
<!-- <script type='text/javascript' src='<c:url value="/js/overlib.js"/>'></script>  -->

<%-- show/hide the tables in the record page --%>
<script type='text/javascript' src="/assets/js/show_hide_tables.js"></script>


<%-- used by the data source page --%>
<c:if test="${refer == 'data-source'}">
  <link rel="StyleSheet" type="text/css" href="<c:url value='/wdkCustomization/css/dataSource.css' />"/>
</c:if>

<%-- need to review these --%>
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

