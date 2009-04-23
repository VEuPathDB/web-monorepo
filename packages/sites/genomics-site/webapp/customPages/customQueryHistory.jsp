<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%-- get wdkUser saved in session scope --%>
<c:set var="user" value="${sessionScope.wdkUser}"/>
<c:set var="model" value="${applicationScope.wdkModel}"/>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<site:header refer="customQueryHistory" />
<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
var IE = document.all?true:false
var mouseX = 0;
var mouseY = 0;
var overHistoryId = 0;
var currentHistoryId = 0;

document.onmousemove = getMousePos;

//alert(IE);

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) {
   document.captureEvents(Event.CLICK);
   document.captureEvents(Event.MOUSEOVER);
   document.captureEvents(Event.MOUSEOUT);
}

function getMousePos(e) {
   if (!e)
      var e = window.event||window.Event;
      
   if('undefined'!=typeof e.pageX){
      mouseX = e.pageX;
      mouseY = e.pageY;
   } else {
      mouseX = e.clientX + document.body.scrollLeft;
      mouseY = e.clientY + document.body.scrollTop;
   }
}

function displayName(histId) {
   // alert(mouseX);
   if (overHistoryId != histId) hideAnyName();
   overHistoryId = histId;

   if (currentHistoryId == histId) return;
   if (mouseX == 0 && mouseY == 0) return;
   
   var name = document.getElementById('div_' + histId);
   name.style.position = 'absolute';
   name.style.left = mouseX+3 + "px";
   name.style.top = mouseY+3 + "px";
   name.style.display = 'block';
}

function hideName(histId) {
   if (overHistoryId == 0) return;
   
   //alert(mouseX);

   var name = document.getElementById('div_' + histId);
   name.style.display = 'none';
}

function hideAnyName() {
    hideName(overHistoryId);
}
// -->
</script>

<%-- dummy strategy tabs for pretending we're still in the application page. --%>
<ul id="strategy_tabs">
   <li><a id="tab_strategy_results" title="Graphical display of your opened strategies. To close a strategy click on the right top corner X." onclick="setCurrentTabCookie('strategy_results');" href="<c:url value="/showApplication.do"/>">Run Strategies</a></li>
   <li id="selected"><a id="tab_search_history" title="Summary of all your strategies. From here you can open/close strategies on the graphical display by clicking on the 'eye'." onclick="setCurrentTabCookie('search_history');" href="<c:url value="/showApplication.do"/>">Browse Strategies</a></li>
   <li><a id="tab_sample_strat" title="View some examples of linear and non-linear strategies." onclick="setCurrentTabCookie('sample_strat');" href="<c:url value="/showApplication.do"/>">Help / Sample Strategies</a></li>
</ul>

<%-- dummy history type tabs for pretending we're still on the browse tab --%>
<c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
<c:set var="invalidStrategies" value="${user.invalidStrategies}"/>
<c:set var="modelName" value="${model.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb') || fn:containsIgnoreCase(modelName, 'cryptodb')}" />

<c:set var="typeC" value="0"/>
<!-- begin creating tabs for history sections -->
<ul id="history_tabs">
  <c:forEach items="${strategiesMap}" var="strategyEntry">
    <c:set var="type" value="${strategyEntry.key}"/>
    <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
    <c:set var="histList" value="${strategyEntry.value}"/>
    <c:set var="recDispName" value="${histList[0].latestStep.answerValue.question.recordClass.type}"/>
    <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' '))}"/>
    <c:set var="typeC" value="${typeC+1}"/>
    <c:choose>
      <c:when test="${typeC == 1}">
        <li>
        <c:set var="displayType" value="${recTabName}" />
      </c:when>
      <c:otherwise>
        <li>|</li><li>
      </c:otherwise>
    </c:choose>
    <a id="tab_${recTabName}" onclick="setCurrentTabCookie('${recTabName}',true);"
    href="<c:url value="/showApplication.do"/>">${recDispName}&nbsp;Strategies</a></li>
  </c:forEach>
  <c:if test="${fn:length(invalidStrategies) > 0}">
    <c:choose>
      <c:when test="${typeC == 0}">
        <li>
        <c:set var="displayType" value="${recTabName}" />
      </c:when>
      <c:otherwise>
        <li>
      </c:otherwise>
    </c:choose>
    <a id="tab_invalid" onclick="setCurrentTabCookie('invalid',true);"
     href="<c:url value="/showApplication.do"/>">Invalid&nbsp;Strategies</a></li>
  </c:if>
  <li id="cmplt_hist_link">
    <a href="showQueryHistory.do?type=show_query_history">All My Queries</a>
  </li>
</ul>

<h1>All Queries</h1>
<site:completeHistory model="${model}" user="${user}" />
<site:footer/>
