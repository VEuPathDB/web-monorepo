<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- from customQueryHistory --%>
<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<%-- end from customQueryHistory --%>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<c:set var="wdkAnswer" value="${requestScope.wdkAnswer}"/>
<c:set var="history" value="${requestScope.wdkHistory}"/>
<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="strategy" value="${requestScope.wdkStrategy}" />
<c:set var="showHist" value="${requestScope.showHistory}" />
<c:set var="strategies" value="${requestScope.wdkActiveStrategies}"/>

<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>

<c:set var="type" value="None" />
<c:choose>
	<c:when test="${wdkAnswer.recordClass.fullName == 'GeneRecordClasses.GeneRecordClass'}">
		<c:set var="type" value="Gene" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'SequenceRecordClasses.SequenceRecordClass'}">
		<c:set var="type" value="Sequence" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'EstRecordClasses.EstRecordClass'}">
		<c:set var="type" value="EST" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'OrfRecordClasses.OrfRecordClass'}">
		<c:set var="type" value="ORF" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'SnpRecordClasses.SnpRecordClass'}">
		<c:set var="type" value="SNP" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'AssemblyRecordClasses.AssemblyRecordClass'}">
		<c:set var="type" value="Assembly" />
	</c:when>
	<c:when test="${wdkAnswer.recordClass.fullName == 'IsolateRecordClasses.IsolateRecordClass'}">
		<c:set var="type" value="Isolate" />
	</c:when>	
</c:choose>

<site:header refer="customSummary" />

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="request_uri" value="${fn:substringAfter(request_uri, '/')}" />
<c:set var="request_uri" value="${fn:substringBefore(request_uri, '/')}" />
<c:set var="exportBaseUrl" value = "${scheme}://${serverName}/${request_uri}/importStrategy.do?strategy=" />

<%-- move between "Run" and "Browse" tabs --%>
<script type="text/javascript" language="javascript">
        var guestUser = '${wdkUser.guest}';
	$(document).ready(function(){
		// tell jQuery not to cache ajax requests.
		$.ajaxSetup ({ cache: false}); 
		exportBaseURL = '${exportBaseUrl}';
		$("#diagram div.venn:last span.resultCount a").click();
		<c:choose>
                  <c:when test="${showHist != null && showHist}">
                    showPanel("search_history");
                  </c:when>
                  <c:otherwise>
                    showPanel("strategy_results");
                  </c:otherwise>
                </c:choose>
	});
</script>

<ul id="strategy_tabs">
   <li><a id="tab_strategy_results" title="Graphical display of your opened strategies. To close a strategy click on the right top corner X." onclick="this.blur()" href="javascript:showPanel('strategy_results')">Run Strategies</a></li>
   <li><a id="tab_search_history" title="Summary of all your strategies. From here you can open/close strategies on the graphical display by clicking on the 'eye'." onclick="this.blur()" href="javascript:showPanel('search_history')">Browse Strategies</a></li>
   <li><a id="tab_sample_strat" title="View some examples of linear and non-linear strategies." href="javascript:showPanel('sample_strat')">Help / Sample Strategies</a></li>


</ul>

<%-- fixed position des not work, with announcements and warnings coming and going  --anyway, we add a tab
<div style="padding:3px; font-weight:bold; background-color:white; position:absolute; top:153px; left:400px;">
         Click <a href="<c:url value="/importStrategy.do?strategy=ca5bc32fb29086d29b778b17f18a97c:1"/>">
		here</a> to add a sample strategy in your display</a>
</div>
--%>


<div id="strategy_results" style="position:absolute;left:-999em;width:100%;">

<%------ if this div is not being used, please clean up ------ ---%>
<div class="strategy_controls"/></div> 

<input type="hidden" id="history_id" value="${history.stepId}"/>
<div id="Strategies">
        <c:set var="i" value="0"/>
	<c:forEach items="${strategies}" var="strat">
                <script>
                   init_strat_ids[${i}] = ${strat.strategyId};
                   init_strat_order[${strat.strategyId}] = ${i + 1};
                </script>
                <c:set var="i" value="${i+1}"/>
	</c:forEach>
</div>

<input type="hidden" id="target_step" value="${stepNumber+1}"/>
<br>

<div id="Workspace"></div> 

</div><!-- end results view div -->

<div id="search_history" style="position:absolute;left:-999em;width:100%;">
	<site:strategyHistory model="${wdkModel}" user="${wdkUser}" />
</div> <!-- end history view div -->

<div id="sample_strat" style="position:absolute;left:-999em;width:100%;">
        <site:sampleStrategies wdkModel="${wdkModel}" wdkUser="${wdkUser}" />
</div> <!-- end sample strats div -->

<%------ if this div is not being used, please clean up ------ ---%>
<div id="loading_step_div"></div>

<site:footer />
