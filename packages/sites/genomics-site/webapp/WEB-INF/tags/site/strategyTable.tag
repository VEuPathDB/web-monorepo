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
    <th scope="col" style="width: 20px;">&nbsp;</th>
    <th scope="col">&nbsp;</th>
    <th scope="col" style="width: 15px;">&nbsp;</th>
    <th scope="col"><c:if test="${prefix != null}">${prefix}&nbsp;</c:if>Strategies</th>
    <th scope="col" style="width: 10em; text-align:right;">&nbsp;</th>
    <th scope="col" style="width: 15em">&nbsp;</th>
    <th scope="col" style="width: 5em">Created</th>
    <th scope="col" style="width: 5em">Modified</th>
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
      <%-- need to see if this strategys id is in the session. --%>
      <c:set var="active" value=""/>
      <c:set var="openedStrategies" value="${wdkUser.activeStrategyIds}"/>
      <c:forEach items="${openedStrategies}" var="activeId">
        <c:if test="${strategyId == activeId}">
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
        <a href="javascript:void(0)" title="Click to open/close the strategy on the graphical display ('Run Strategies' tab)." onclick="toggleEye(this,'${strategy.strategyId}')"><img src="/assets/images/transparent1.gif" alt="Toggle View of Strategy" /></a>
      </td>
      <td>
        <img id="img_${strategyId}" class="plus-minus plus" src="/assets/images/sqr_bullet_plus.png" alt="" onclick="toggleSteps(${strategyId})"/>
      </td>
      <c:set var="dispNam" value="${strategy.name}"/>
      <td>
        <div id="text_${strategyId}">
          <span title="Click to rename." onclick="enableRename('${strategyId}', '${strategy.name}', true)">${dispNam}</span><c:if test="${!strategy.isSaved}">*</c:if>
        </div>
        <div id="name_${strategyId}" style="display:none"></div>          
      </td>
      <td align="right">
        <div id="activate_${strategyId}">
          <input type='button' value='Rename' onclick="enableRename('${strategyId}', '${strategy.name}', true)" />
        </div>       
        <div id="input_${strategyId}" style="display:none"></div>
      </td>
      <td nowrap>
         <%-- copy the strategy --%>
         <input type='button' value='Copy' onclick="copyStrategy('${strategyId}', true);" />
         <c:choose>
           <c:when test="${wdkUser.guest}">
             <input title='Please LOGIN so you can SAVE (make a snapshot) your strategy.' type='button' value='Save As' onclick="window.location='login.jsp?refererUrl=login.jsp&originUrl=${pageContext.request.requestURL}';" />
           </c:when>
           <c:otherwise>
             <input title='A saved strategy is like a snapshot, it cannot be changed.' type='button' value='Save As' onclick="showHistSave(this, '${strategyId}')" />
           </c:otherwise>
         </c:choose>
         <c:choose>
           <c:when test="${wdkUser.guest}">
             <input title='Please LOGIN so you can SAVE and then SHARE (email) your strategy.' type='button' value='Share' onclick="window.location='login.jsp?refererUrl=login.jsp&originUrl=${pageContext.request.requestURL}';" />
           </c:when>
           <c:when test="${strategy.isSaved}">
             <input title='Email this URL to your best friend.' type='button' value='Share' onclick="showHistShare(this, '${strategyId}')" />
           </c:when>
           <c:otherwise>
             <input title='SAVE this strategy so you can SHARE it (email its URL).' type='button' value='Share' onclick="showHistSave(this, '${strategyId}')" />
           </c:otherwise>
         </c:choose>
         <input type='button' value='Download' onclick="downloadStep('${strategy.latestStep.stepId}')" />
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
