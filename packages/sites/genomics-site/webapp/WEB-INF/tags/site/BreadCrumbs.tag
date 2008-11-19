

<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%@ attribute name="strategy"
	      type="org.gusdb.wdk.model.jspwrap.StrategyBean"
              required="true"
              description="Protocol from the SummaryPage"
%>
<%@ attribute name="strat_step"
	      type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Protocol from the SummaryPage"
%>
<c:set var="sub"value="false" />
<c:set var="stratName" value="${strategy.name}" />
<c:set var="savedName" value="${strategy.savedName}" />
<c:set var="stratId" value="${strategy.strategyId}" />
<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="request_uri" value="${fn:substringAfter(request_uri, '/')}" />
<c:set var="request_uri" value="${fn:substringBefore(request_uri, '/')}" />
<c:set var="exportUrl" value="${scheme}://${serverName}/${request_uri}/importStrategy.do?answer=${strat_step.answerId}" />
<c:if test="${strat_step.stepId != strategy.latestStep.stepId}">
	<c:set var="sub" value="true" />
	<c:set var="stratName" value="${strat_step.collapsedName}" />
	<c:set var="stratId" value="${strategy.strategyId}_${strat_step.stepId}" />
</c:if>

<!--<link rel="stylesheet" type="text/css" href="/assets/css/Strategy.css" />
<link rel="StyleSheet" href="/assets/css/filter_menu.css" type="text/css"/>-->
<c:set var="stepNumber" value="0" />
<!--<div class="chain_background" id="bread_crumb_div">-->
	<div class="diagram" id="diagram_${stratId}">
		<span class="closeStrategy"><a href="javascript:void(0)" onclick="closeStrategy('${stratId}')"><img src="/assets/images/Close-X.png" alt="click here to remove ${stratName} from the list"/></a></span>
		<div id="strategy_name">${stratName}<span id="strategy_id_span" style="display:none">${stratId}</span><span class="strategy_small_text"><br><a class="save_strat_link" onclick="showSaveForm('${stratId}')" href="javascript:void(0)">save as</a>
        <div class="modal_div save_strat" id="save_strat_div_${stratId}">
            <span class="dragHandle">
                 <div class="modal_name"><h1>Save As</h1></div>
                 <a class="close_window" href="javascript:closeModal()"><img alt="Close" src="/assets/images/Close-X-box.png"/></a>
            </span>
            <form action="javascript:saveStrategy('${stratId}', true)" onsubmit="return validateSaveForm(this);">
                 <input type="hidden" name="strategy" value="${strategy.strategyId}" />
                 <input type="text" name="name" value="${savedName}" />
                 <input type="submit" value="Save"/>
            </form>
        </div><br><a href="javascript:showExportLink('${stratId}')">export</a><div class="modal_div export_link" id="export_link_div_${stratId}">
            <span class="dragHandle">
                 <a class="close_window" href="javascript:closeModal()"><img alt="Close" src="/assets/images/Close-X-box.png"/></a>
            </span><p>Paste link in email:</p><input type="text" size="${fn:length(exportUrl)}" value="${exportUrl}" /></div></span></div>
		<c:set var="steps" value="${strat_step.allSteps}" />
		<c:forEach items="${steps}" var="step">
			<site:Step step="${step}" strategyId="${stratId}" stepNum="${stepNumber}"/>
			<c:set var="stepNumber" value="${stepNumber+1}" />
		</c:forEach>
		<site:Step step="${step}" strategyId="${stratId}" stepNum="${stepNumber}" button="true"/>
		<%--<a class="filter_link redbutton" onclick="this.blur()" href="javascript:openFilter('${stratId}:')" id="filter_link"><span>Add Step</span></a>--%>
	</div>
	<div class="filter_link_div" id="filter_link_div_${stratId}">
		<site:FilterInterface model="${applicationScope.wdkModel}" recordClass="${strat_step.dataType}" strategy="${strategy}"/>
	</div>
<!--</div>-->




