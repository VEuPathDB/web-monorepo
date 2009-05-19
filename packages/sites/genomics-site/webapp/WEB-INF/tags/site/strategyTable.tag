<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="strategies"
              type="java.util.List"
              required="true"
              description="List of Strategy objects"
%>
<%@ attribute name="wdkUser"
              type="org.gusdb.wdk.model.jspwrap.UserBean"
              required="true"
              description="Current User object"
%>
<%@ attribute name="prefix"
              type="java.lang.String"
              required="false"
              description="Text to add before 'Strategy' in column header"
%>

<table border="0" cellpadding="5" cellspacing="0">
  <tr class="headerrow">
    <th scope="col" style="width: 25px;">&nbsp;</th>
    <th scope="col" style="width: 20px;">&nbsp;</th>
    <th scope="col"><c:if test="${prefix != null}">${prefix}&nbsp;</c:if>Strategies</th>
    <th scope="col" style="width: 7em;">&nbsp;</th>
    <th scope="col" style="width: 4em">&nbsp;</th>
    <th scope="col" style="width: 9em">&nbsp;</th>
    <th scope="col" style="width: 5em">Modified</th>
    <th scope="col" style="width: 5em">Viewed</th>
    <th scope="col" style="width: 5em">Version</th>
    <th scope="col" style="width: 5em">Size</th>
  </tr>
  <c:set var="i" value="0"/>
  <%-- begin of forEach strategy in the category --%>
  <c:forEach items="${strategies}" var="strategy">
    <c:set var="strategyId" value="${strategy.strategyId}"/>
    <c:choose>
      <c:when test="${i % 2 == 0}"><tr class="lines"></c:when>
      <c:otherwise><tr class="linesalt"></c:otherwise>
    </c:choose>
      <td scope="row"><input type=checkbox id="${strategyId}" onclick="updateSelectedList()"/></td>
      <%-- need to see if this strategy id is in the session. --%>
      <c:set var="active" value=""/>
      <c:set var="openedStrategies" value="${wdkUser.activeStrategyIds}"/>
      <c:forEach items="${openedStrategies}" var="activeId">
        <c:if test="${strategyId == activeId}">
          <c:set var="active" value="true"/>
        </c:if>
      </c:forEach>
      <td>
        <img id="img_${strategyId}" class="plus-minus plus" src="/assets/images/sqr_bullet_plus.png" alt="" onclick="toggleSteps(${strategyId})"/>
      </td>
      <c:set var="dispNam" value="${strategy.name}"/>
      <td>
        <div id="text_${strategyId}">
          <span <c:if test="${active}">style="background-color:#ffffa0"</c:if> title="Click to rename." onclick="openStrategy('${strategyId}')">${dispNam}<c:if test="${!strategy.isSaved}">*</c:if></span>
        </div>        
      </td>
      <td align="right">
        <div id="activate_${strategyId}">
          <input type='button' value='Open' onclick="openStrategy('${strategyId}')" />
          <input type='button' value='Close' onclick="closeStrategy('${strategyId}')" />
        </div>
      </td>
      <td>
         <input type='button' value='Download' onclick="downloadStep('${strategy.latestStep.stepId}')" />
      </td>
      <td nowrap>
         <c:set var="saveAction" value="showHistSave(this, '${strategyId}', true);"/>
         <c:set var="shareAction" value="showHistShare(this, '${strategyId}');" />
         <c:if test="${wdkUser.guest}">
           <c:set var="saveAction" value="popLogin();"/>
         </c:if>
         <c:if test="${!strategy.isSaved}">
           <c:set var="shareAction" value="showHistSave(this, '${strategyId}', true);" />
         </c:if>
         <select id="actions_${strategyId}" onchange="eval(this.value);this[0].selected='true';">
            <option value="return false;">---More actions---</option>
            <option value="copyStrategy('${strategyId}', true);">Copy</option>
            <option value="showHistSave(this, '${strategyId}', false)">Rename</option>
            <option value="${saveAction}">Save As</option>
            <option value="${shareAction}">Share</option>
         </select>
      </td>
      <td nowrap>${strategy.createdTimeFormatted}</td>
      <td nowrap>${strategy.lastRunTimeFormatted}</td>
      <td nowrap>
        <c:choose>
          <c:when test="${strategy.latestStep.version == null || strategy.latestStep.version eq ''}">${wdkModel.version}</c:when>
          <c:otherwise>${strategy.latestStep.version}</c:otherwise>
        </c:choose>
      </td>
      <td nowrap>${strategy.latestStep.estimateSize}</td>
    </tr>
    <!-- begin rowgroup for strategy steps -->
    <tbody id="steps_${strategyId}">
      <site:stepRows latestStep="${strategy.latestStep}" i="${i}" indent="10"/>
    </tbody>
    <!-- end rowgroup for strategy steps -->
    <c:set var="i" value="${i+1}"/>
  </c:forEach>
  <!-- end of forEach strategy in the category -->
</table>
