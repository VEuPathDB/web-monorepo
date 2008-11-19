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
 
<!-- begin of the html:form for rename query -->
<html:form method="get" action="/renameStrategy.do">
  <table border="0" cellpadding="5" cellspacing="0">
    <tr class="headerrow">
      <th scope="col">&nbsp;</th>
      <th scope="col">&nbsp;</th>
      <th scope="col">&nbsp;</th>
      <th scope="col">Strategy</th>
      <th scope="col">&nbsp;</th>
      <th scope="col">&nbsp;</th>
      <th scope="col">Date</th>
      <th scope="col">Version</th>
      <th scope="col">Size</th>
    </tr>
    <c:set var="i" value="0"/>
    <%-- begin of forEach unsaved strategy in the category --%>
    <c:forEach items="${strategies}" var="strategy">
      <c:set var="strategyId" value="${strategy.strategyId}"/>
      <c:choose>
        <c:when test="${i % 2 == 0}"><tr class="lines"></c:when>
        <c:otherwise><tr class="linesalt"></c:otherwise>
      </c:choose>
        <td scope="row"><input type=checkbox id="${strategyId}" onclick="updateSelectedList()"/></td>
        <%-- need to see if this strategys id is in the session. --%>
        <c:set var="active" value=""/>
        <c:set var="activeStrategies" value="${wdkUser.activeStrategies}"/>
        <c:forEach items="${activeStrategies}" var="id">
          <c:if test="${strategyId == id}">
            <c:set var="active" value="true"/>
          </c:if>
        </c:forEach>
        <c:choose>
          <c:when test="${active == ''}">
            <td id="eye_${strategy.strategyId}" class="strat_inactive">
          </c:when>
          <c:otherwise>
            <td id="eye_${strategy.strategyId}" class="strat_active">
          </c:otherwise>
        </c:choose>
          <a href="javascript:void(0)" onclick="toggleEye(this,'${strategy.strategyId}')"><img src="/assets/images/transparent1.gif" alt="Toggle View of Strategy" /></a>
        </td>
        <td>
          <img id="img_${strategyId}" class="plus-minus plus" src="/assets/images/sqr_bullet_plus.png" alt="" onclick="toggleSteps(${strategyId})"/>
        </td>
        <c:set var="dispNam" value="${strategy.name}"/>
        <td width=450>
          <div id="text_${strategyId}">
            <span onclick="enableRename('${strategyId}', '${strategy.name}')">${dispNam}</span>
          </div>
          <div id="name_${strategyId}" style="display:none"></div>          
        </td>
        <td>
          <div id="activate_${strategyId}">
            <input type='button' value='Save As' onclick="enableRename('${strategyId}', '${strategy.name}')" />
          </div>       
          <div id="input_${strategyId}" style="display:none"></div>
        </td>
        <c:set var="stepId" value="${strategy.latestStep.stepId}"/>
        <td nowrap><input type='button' value='Download' onclick="downloadStep('${stepId}')" /><%--<a href="downloadStep.do?step_id=${stepId}">download</a>--%></td>
        <td align='right' nowrap>${strategy.latestStep.lastRunTime}</td>
        <td align='right' nowrap>
          <c:choose>
            <c:when test="${strategy.latestStep.version == null || strategy.latestStep.version eq ''}">${wdkModel.version}</c:when>
            <c:otherwise>${strategy.latestStep.version}</c:otherwise>
          </c:choose>
        </td>
        <td align='right' nowrap>${strategy.latestStep.estimateSize}</td>
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
</html:form> 
<!-- end of the html:form for rename query -->
