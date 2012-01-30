<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="refer" 
 	      type="java.lang.String"
	      required="true" 
	      description="Page calling this tag"
%>

<%-- JQuery library is included by WDK --%>

<link rel="stylesheet" type="text/css" href="<c:url value='/wdkCustomization/css/jquery-ui/jquery-ui-1.8.16.custom.css' />">

<c:if test="${refer == 'summary'}">

	<!-- javascript provided by site -->
	<script type="text/javascript" src="/assets/js/customStrategy.js"></script>
	<script type="text/javascript" src="/assets/js/ortholog.js"></script>
        <script type="text/javascript" src="<c:url value='/wdkCustomization/js/export-basket.js' />"></script>
</c:if>


<c:if test="${refer == 'question' || refer == 'summary'}">
  <wdk:parameterScript />
  <script type="text/javascript" src="/assets/js/orthologpattern.js"></script>
  <script type="text/javascript" src="/assets/js/blast.js"></script>
  <script type="text/javascript" src="<c:url value='/wdkCustomization/js/span-location.js' />"></script>
</c:if>


<%-- js for quick seach box --%>
<script type="text/javascript" src="/assets/js/quicksearch.js"></script>

<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/dqg.js"></script>
<script type="text/javascript" src="/assets/js/newitems.js"></script>

<script type="text/javascript" src="/assets/js/popups.js"></script>
<script type="text/javascript" src="/assets/js/api.js"></script>

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

