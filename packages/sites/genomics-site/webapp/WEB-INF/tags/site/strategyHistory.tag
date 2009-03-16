<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="model"
             type="org.gusdb.wdk.model.jspwrap.WdkModelBean"
             required="false"
             description="Wdk Model Object for this site"
%>

<%@ attribute name="user"
              type="org.gusdb.wdk.model.jspwrap.UserBean"
              required="false"
              description="Currently active user object"
%>

<%@ attribute name="loadPanels"
              required="false"
              description="Flag indicating whether to include the history panels"
%>

<c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
<c:set var="invalidStrategies" value="${user.invalidStrategies}"/>
<c:set var="modelName" value="${model.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb') || fn:containsIgnoreCase(modelName, 'cryptodb')}" />

<!-- decide whether strategy history is empty -->
<c:choose>
  <c:when test="${user == null || user.strategyCount == 0}">
  <div align="center">You have no searches in your history.  Please run a search from the <a href="/">home</a> page, or by using the "New Search" menu above, or by selecting a search from the <a href="<c:url value="/queries_tools.jsp"/>">searches</a> page.</div>
  </c:when>
  <c:otherwise>
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
  <a id="tab_${recTabName}" onclick="displayHist('${recTabName}')"
  href="javascript:void(0)">${recDispName}&nbsp;Strategies</a></li>
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
    <a id="tab_invalid" onclick="displayHist('invalid')"
       href="javascript:void(0)">Invalid&nbsp;Strategies</a></li>
  </c:if>
  <li class="cmplt_hist_link">
    <a id="tab_complete" onclick="displayHist('complete')">All My Searches</a>
  </li>
  </ul>
<!-- should be a div instead of a table -->
<table class="history_controls clear_all">
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">select none</a></td>
      <td></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteStrategies('deleteStrategy.do?strategy=')"/>
      </td>
   </tr>
</table>

<c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
<c:set var="savedStrategiesMap" value="${user.savedStrategiesByCategory}"/>
<c:set var="unsavedStrategiesMap" value="${user.unsavedStrategiesByCategory}"/>
<!-- form for renaming strategies; action is set in javascript -->
<form id="browse_rename" action="javascript:return false;" onsubmit="return validateSaveForm(this);">
<!-- begin creating history sections to display saved strategies -->
<c:forEach items="${strategiesMap}" var="strategyEntry">
  <c:set var="type" value="${strategyEntry.key}"/>
  <c:set var="strategies" value="${strategyEntry.value}"/>
  <c:set var="recDispName" value="${strategies[0].latestStep.answerValue.question.recordClass.type}"/>
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>
  <div class="panel_${recTabName} history_panel">
    <c:if test="${loadPanels}">
      <c:set var="strategies" value="${savedStrategiesMap[type]}"/>
      <c:if test="${strategies != null}">
        <site:strategyTable strategies="${strategies}" wdkUser="${user}" prefix="Saved" />
      </c:if>
      <c:set var="strategies" value="${unsavedStrategiesMap[type]}"/>
      <c:if test="${strategies != null}">
        <site:strategyTable strategies="${strategies}" wdkUser="${user}" prefix="Unsaved" />
      </c:if>
    </c:if>
  </div>
</c:forEach>
<!-- end of showing unsaved strategies grouped by RecordTypes -->
</form>

<!-- popups for save/rename forms -->
<c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
<c:forEach items="${strategiesMap}" var="strategyEntry">
  <c:set var="strategies" value="${strategyEntry.value}"/>
  <c:forEach items="${strategies}" var="strategy">
    <c:if test="${strategy.isSaved}">
    <div class='modal_div export_link' id="hist_share_${strategy.strategyId}" style="right:15em;">
      <span class='dragHandle'>
        <a class='close_window' href='javascript:closeModal()'>
          <img alt='Close' src='/assets/images/Close-X-box.png'/>
        </a>
      </span>
      <p>Paste link in email:</p>
      <input type='text' size="${fn:length(exportURL)}" value="${exportURL}"/>
    </div>
    </c:if>
    <c:if test="${!user.guest && !strategy.isSaved}">
    <div class='modal_div save_strat' id="hist_save_${strategy.strategyId}" style="right:15em;">
      <span class='dragHandle'>
        <div class="modal_name">
          <h2>Save As</h2>
        </div>
        <a class='close_window' href='javascript:closeModal()'>
          <img alt='Close' src='/assets/images/Close-X-box.png'/>
        </a>
      </span>
      <form onsubmit='return validateSaveForm(this);' action="javascript:saveStrategy('${strategy.strategyId}', true, true)">
        <input type='hidden' value="${strategy.strategyId}" name='strategy'/>
        <input type='text' value="${strategy.savedName}" name='name'/>
        <input type='submit' value='Save'/>
      </form>
    </div>
    </c:if>
  </c:forEach>
</c:forEach>


<%-- invalid strategies, if any --%>
<c:if test="${fn:length(invalidStrategies) > 0}">
  <div class="panel_invalid history_panel">
    <c:if test="${loadPanels}">
      <site:strategyTable strategies="${user.invalidStrategies}" wdkUser="${user}" prefix="Invalid" />
    </c:if>
  </div>
</c:if>

<%-- complete query history --%>
<div class="panel_complete history_panel">
    <c:if test="${loadPanels}">
      <h1>All Queries</h1>
      <site:completeHistory model="${wdkModel}" user="${user}" />
    </c:if>
</div>

<table class="history_controls">
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">select none</a></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteStrategies('deleteStrategy.do?strategy=')"/>
      </td>
   </tr>
</table>

<script type="text/javascript" language="javascript">
   displayHist('${displayType}');
</script>

  </c:otherwise>
</c:choose> 
<!-- end of deciding strategy emptiness -->

