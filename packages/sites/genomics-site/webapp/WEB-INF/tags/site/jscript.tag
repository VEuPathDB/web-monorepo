<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="true" 
			  description="Page calling this tag"
%>
<!-- JQuery Library -->
<script type="text/javascript" src="/assets/js/lib/jquery-1.2.6.js"></script>
<!-- JQuery Drag And Drop Plugin -->

<c:if test="${refer == 'customSummary'}">
	<!-- JQuery Drag And Drop Plugin -->
	<script type="text/javascript" src="/assets/js/lib/jqDnR.js"></script>
	<!-- JQuery BlockUI Plugin -->
	<script type="text/javascript" src="/assets/js/lib/jquery.blockUI.js"></script>
</c:if>

<!-- Prototype Library -->
<!--<script type="text/javascript" src="/assets/js/lib/prototype.js"></script>-->
<!-- Scriptaculous Library -->
<!--<script type="text/javascript" src="/assets/js/lib/scriptaculous.js"></script>-->
 
<c:if test="${refer == 'customSummary'}">
	<!-- filter menu javascript -->
	<script type="text/javascript" src="/assets/js/filter_menu.js"></script>
	<script type="text/javascript" src="/assets/js/Strategy.js"></script>
	<!-- Strategy Interaction javascript -->
	<script type="text/javascript" src="/assets/js/StrategyAction.js"></script>
	
 	<!-- hover for home page -->
	<script type="text/javascript" src="/assets/js/sfhover.js"></script>
</c:if>

<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/dqg.js"></script>

<c:if test="${refer == 'customSummary'}">
	<!-- dynamic query grid code -->
	<script type="text/javascript" src="/assets/js/step.js"></script>
</c:if>

<c:if test="${refer == 'customSummary'}">
	<!-- dynamic query grid code -->
	<script type="text/javascript" src="/assets/js/pager.js"></script>
</c:if>

<!-- dynamic query grid code -->
<script type="text/javascript" src="/assets/js/questionPage.js"></script>
<!-- dynamic query grid code -->
<!--<script type="text/javascript" src="/assets/js/Top_menu.js"></script>-->

<c:if test="${refer == 'customSummary'}">
	<!-- Results Page AJAX Javascript code -->
	<script type="text/javascript" src="/assets/js/results_page.js"></script>
</c:if>

<!-- Record Page GBrowse Javascript code -->
<%--<script type="text/javascript" src="/gbrowse/wz_tooltip_3.45.js"></script>--%>
<!-- history page code -->
<script type="text/javascript" src="/assets/js/history.js"></script>

<script type="text/javascript" src="/assets/js/api.js"></script>

<!-- fix to transparent png images in IE 7 -->
<!--[if lt IE 7.]>
<script type="text/javascript" src="/assets/js/pngfix.js"></script>
<![endif]-->

