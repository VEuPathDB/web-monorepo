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

<c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
<c:set var="invalidStrategies" value="${user.invalidStrategies}"/>
<c:set var="modelName" value="${model.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb') || fn:containsIgnoreCase(modelName, 'cryptodb')}" />

<!-- decide whether strategy history is empty -->
<c:choose>
  <c:when test="${user == null || user.strategyCount == 0}">
  <div align="center">You have no searches in your history.  Please run a search from the <a href="/">home</a> page, or by using the "New Search" menu above, or by selecting a search from the <a href="/queries_tools.jsp">searches</a> page.</div>
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
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>

  <c:set var="typeC" value="${typeC+1}"/>
  <c:choose>
    <c:when test="${typeC == 1}">
      <li id="selected_type">
    </c:when>
    <c:otherwise>
      <li>
    </c:otherwise>
  </c:choose>
  <a id="tab_${recTabName}" onclick="displayHist('${recTabName}')"
  href="javascript:void(0)">My&nbsp;${recDispName}&nbsp;Searches</a></li>
  </c:forEach>
  <c:if test="${fn:length(invalidStrategies) > 0}">
    <c:choose>
      <c:when test="${typeC == 0}">
        <li id="selected_type">
      </c:when>
      <c:otherwise>
        <li>
      </c:otherwise>
    </c:choose>
    <a id="tab_invalid" onclick="displayHist('invalid')"
       href="javascript:void(0)">My$nbsp;Invalid&nbsp;Searches</a></li>
  </c:if>
  <a id="cmplt_hist_link" href="showQueryHistory.do?type=show_query_history">Complete History</a>
  </ul>
<!-- should be a div instead of a table -->
<table class="clear_all">
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

<c:set var="typeC" value="0"/>
<c:set var="strategiesMap" value="${user.unsavedStrategiesByCategory}"/>
<!-- form for renaming strategies; action is set in javascript -->
<form id="browse_rename" action="javascript:return false;" onsubmit="return validateSaveForm(this);">
<!-- begin creating history sections to display strategies -->
<c:forEach items="${strategiesMap}" var="strategyEntry">
  <c:set var="type" value="${strategyEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
  <c:set var="strategies" value="${strategyEntry.value}"/>
  <c:set var="recDispName" value="${strategies[0].latestStep.answerValue.question.recordClass.type}"/>
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>

  <c:set var="typeC" value="${typeC+1}"/>
  <c:choose>
    <c:when test="${typeC == 1}">
      <div class="panel_${recTabName} history_panel enabled">
    </c:when>
    <c:otherwise>
      <div class="panel_${recTabName} history_panel">
    </c:otherwise> 
  </c:choose>
  <site:strategyTable strategies="${strategies}" wdkUser="${wdkUser}" prefix="Unsaved" />
</div>
</c:forEach>
<!-- end of showing strategies grouped by RecordTypes -->


<c:set var="typeC" value="0"/>
<c:set var="strategiesMap" value="${user.savedStrategiesByCategory}"/>
<!-- begin creating history sections to display strategies -->
<c:forEach items="${strategiesMap}" var="strategyEntry">
  <c:set var="type" value="${strategyEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
  <c:set var="strategies" value="${strategyEntry.value}"/>
  <c:set var="recDispName" value="${strategies[0].latestStep.answerValue.question.recordClass.type}"/>
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>

  <c:set var="typeC" value="${typeC+1}"/>
  <c:choose>
    <c:when test="${typeC == 1}">
      <div class="panel_${recTabName} history_panel enabled">
    </c:when>
    <c:otherwise>
      <div class="panel_${recTabName} history_panel">
    </c:otherwise> 
  </c:choose>
  <site:strategyTable strategies="${strategies}" wdkUser="${wdkUser}" prefix="Saved" />
</div>
</c:forEach>
<!-- end of showing strategies grouped by RecordTypes -->
</form>

<%-- invalid strategies, if any --%>
<c:if test="${fn:length(invalidStrategies) > 0}">
  <c:choose>
    <c:when test="${typeC == 0}">
      <div class="panel_invalid history_panel enabled">
    </c:when>
    <c:otherwise>
      <div class="panel_invalid history_panel">
    </c:otherwise>
  </c:choose>
    <site:strategyTable strategies="${user.invalidStrategies}" wdkUser="${wdkUser}" />
  </div>
</c:if>

<table>
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">select none</a></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteStrategies('deleteStrategy.do?strategy=')"/>
      </td>
   </tr>
</table>


  </c:otherwise>
</c:choose> 
<!-- end of deciding strategy emptiness -->

