<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="user" value="${sessionScope.wdkUser}" />
<c:set var="histType" value="${requestScope.type}" />
<c:set var="saved" value="${requestScope.saved}" />

<c:choose>
  <c:when test="${histType == null}">
    <site:strategyHistory model="${wdkModel}" user="${user}" />
  </c:when>
  <c:when test="${histType == 'complete'}">
    <div class="panel_complete history_panel">
      <h1>All Queries</h1>
      <site:completeHistory model="${wdkModel}" user="${user}" />
    </div>
  </c:when>
  <c:when test="${histType == 'invalid'}">
    <div class="panel_invalid history_panel">
      <site:strategyTable strategies="${user.invalidStrategies}" wdkUser="${user}" prefix="Invalid" />
    </div>
  </c:when>
  <c:otherwise>
    <c:set var="strategiesMap" value="${user.strategiesByCategory}"/>
    <c:set var="savedStrategiesMap" value="${user.savedStrategiesByCategory}"/>
    <c:set var="unsavedStrategiesMap" value="${user.unsavedStrategiesByCategory}"/>
    <c:forEach items="${strategiesMap}" var="strategyEntry">
      <c:set var="type" value="${strategyEntry.key}"/>
      <c:if test="${histType == type}">
        <c:set var="strategies" value="${strategyEntry.value}"/>
        <c:set var="recDispName" value="${strategies[0].latestStep.answerValue.question.recordClass.type}"/>
        <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>
        <div class="panel_${recTabName} history_panel">
          <c:set var="strategies" value="${savedStrategiesMap[type]}"/>
          <c:if test="${strategies != null}">
            <site:strategyTable strategies="${strategies}" wdkUser="${user}" prefix="Saved" />
          </c:if>
          <c:set var="strategies" value="${unsavedStrategiesMap[type]}"/>
          <c:if test="${strategies != null}">
            <site:strategyTable strategies="${strategies}" wdkUser="${user}" prefix="Unsaved" />
          </c:if>
        </div>
      </c:if>
    </c:forEach>
  </c:otherwise>
</c:choose>
  
    
