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

<site:home_header refer="customSummary" />

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="request_uri" value="${fn:substringAfter(request_uri, '/')}" />
<c:set var="request_uri" value="${fn:substringBefore(request_uri, '/')}" />

<script type="text/javascript" language="javascript">
	$(document).ready(function(){
		exportBaseURL = '${scheme}://${serverName}/${request_uri}/importStrategy.do?answer='
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
<site:menubar />

<div id="contentwrapper">
  	<div id="contentcolumn2">
		<div class="innertube">
<ul id="strategy_tabs">
   <li><a id="strategy_results_tab" onclick="this.blur()" href="javascript:showPanel('strategy_results')">Run Strategies</a></li>
   <li><a id="search_history_tab" onclick="this.blur()" href="javascript:showPanel('search_history')">Browse Strategies</a></li>
</ul>
<div id="strategy_results" style="position:absolute;left:-999em">
<div class="strategy_controls"/>

<%--
<table width="100%">
<tr>
  <td width="50%">    
     <h2><b>My Search Strategies</b></h2>
  </td>
  <td width="50%" align="right">
     <input type="submit" value="New" name="newStrategy" disabled/>
     <input type="submit" value="Open" name="openStrategy" disabled/>
     
</td>
</tr>
<tr>
<td colspan="2" align="center">
<font size ="-2">Click on
<a onclick="this.blur()" href="javascript:openFilter('add')"><b style='color:darkred'>Add Step</b></a> to refine your current result with an additional search.
	&nbsp;&nbsp;&nbsp;Click on a query name to Edit a query.&nbsp;&nbsp;&nbsp;Click on the number of results to browse over the query results.
</td>
</tr>


</table>
--%>


</div> 

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
<%--
<div id="filter_link_div">
	<site:FilterInterface model="${model}" recordClass="${wdkAnswer.recordClass}" strategy="${strategy}"/>
</div>
--%>
<br>

<div id="Workspace">
<%--<site:Results strategy="${strategy}"/>--%>
</div> 
</div><!-- end results view div -->

<div id="search_history" style="position:absolute;left:-999em">
<site:strategyHistory model="${wdkModel}" user="${wdkUser}" />
</div> <!-- end history view div -->

</div>
</div>
</div>

<div id="loading_step_div"></div>
<site:footer />
