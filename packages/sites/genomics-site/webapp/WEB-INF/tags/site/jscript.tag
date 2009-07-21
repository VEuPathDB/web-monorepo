<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="true" 
			  description="Page calling this tag"
%>
<%-- JQuery library is included by WDK 
<!-- JQuery Library -->
<script type="text/javascript" src="/assets/js/lib/jquery-1.3.2.js"></script>
--%>


<!-- js for Help - Did you know window --> 
<!-- these files were under IF customSummary but the Help needs to work in any page -->
<script type="text/javascript" src="/assets/js/lib/jquery-ui-1.7.2.custom.min.js"></script>
<c:if test="${refer == 'customSummary'}">
  <script type="text/javascript" src="/assets/js/dyk.js"></script>	
</c:if>

<!-- JQuery Drag And Drop Plugin -->
<script type="text/javascript" src="/assets/js/js-utils.js"></script>
<c:if test="${refer == 'customSummary'}">
	<!-- JQuery Drag And Drop Plugin -->
	<!--<script type="text/javascript" src="/assets/js/lib/jqDnR.js"></script>-->
	<script type="text/javascript" src="/assets/js/lib/json.js"></script>

<%--	<script type="text/javascript" src="/assets/js/lib/ui/ui.core.js"></script>
	<script type="text/javascript" src="/assets/js/lib/ui/ui.draggable.js"></script>
--%>

	<!-- filter menu javascript -->
	<script type="text/javascript" src="/assets/js/filter_menu.js"></script>
	<!-- Strategy Interaction javascript -->
	
	<script type="text/javascript" src="/assets/js/model-JSON.js"></script>
	<script type="text/javascript" src="/assets/js/view-JSON.js"></script>
	<script type="text/javascript" src="/assets/js/step.js"></script>
	<script type="text/javascript" src="/assets/js/controler-JSON.js"></script>
	<script type="text/javascript" src="/assets/js/error-JSON.js"></script>
	<script type="text/javascript" src="/assets/js/pager.js"></script>
	<script type="text/javascript" src="/assets/js/lib/flexigrid/flexigrid.js"></script>
	<!-- Results Page AJAX Javascript code -->
	<script type="text/javascript" src="/assets/js/results_page.js"></script>
	


        <script type="text/javascript" src="<c:url value='/assets/js/wdkFilter.js' />"></script>
</c:if>

<!-- JQuery BlockUI Plugin -->
<script type="text/javascript" src="/assets/js/lib/jquery.blockUI.js"></script>

<%-- jQuery Cookie plugin --%>
<script type="text/javascript" src="/assets/js/lib/jquery.cookie.js"></script>
<script type="text/javascript" src="/assets/js/stratTabCookie.js"></script>

<%-- js for quick seach box --%>
<script type="text/javascript" src="/assets/js/quicksearch.js"></script>
 

<%--<c:if test="${refer == 'blastQuestion'}"> --%>
        <script type="text/javascript" src="/assets/js/blast.js"></script>
<%--</c:if>--%>

<script type="text/javascript" src="/assets/js/orthologpattern.js"></script>

<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/dqg.js"></script>
<script type="text/javascript" src="/assets/js/newitems.js"></script>


<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/questionPage.js"></script>
<!-- dynamic organism param in portal -->
<script type="text/javascript" src="<c:url value='/js/Top_menu.js'/>"></script>


<!-- Record Page GBrowse Javascript code -->
<%--<script type="text/javascript" src="/gbrowse/wz_tooltip_3.45.js"></script>--%>
<!-- history page code -->
<script type="text/javascript" src="/assets/js/history.js"></script>

<script type="text/javascript" src="<c:url value='/js/treeControl.js'/>"></script>

<script type="text/javascript" src="/assets/js/api.js"></script>
<script type="text/javascript" src="/assets/js/htmltooltip.js"></script>

<!-- fix to transparent png images in IE 7 -->
<!--[if lt IE 7]>
<script type="text/javascript" src="/assets/js/pngfix.js"></script>
<c:if test="${refer == 'customSummary'}">
<script type="text/javascript">
        $(document).ready(function(){
		$("#Strategies").prepend("<div style='height:124px;'>&nbsp;</div>");
	});
</script>
</c:if>
<![endif]-->

<!-- js for Contact Us window -->
<script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>



<!-- js for popups in query grid and other.... -->
<script type='text/javascript' src='<c:url value="/js/overlib.js"/>'></script>

<%-- show/hide the tables in the record page --%>
<script type='text/javascript' src="/assets/js/show_hide_tables.js"></script>

