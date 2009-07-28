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

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="request_uri" value="${fn:substringAfter(request_uri, '/')}" />
<c:set var="request_uri" value="${fn:substringBefore(request_uri, '/')}" />
<c:set var="exportBaseUrl" value = "${scheme}://${serverName}/${request_uri}/im.do?s=" />

<table border="0" cellpadding="5" cellspacing="0">
  <thead>
  <tr class="headerrow">
    <th scope="col" style="width: 25px;">&nbsp;</th>
    <th scope="col" style="width: 20px;">&nbsp;</th>
    <th scope="col">
      <c:if test="${prefix != null}">${prefix}&nbsp;</c:if>Strategies&nbsp;(${fn:length(strategies)})
    </th>
    <th scope="col" style="width: 3em;">&nbsp;</th>
    <th scope="col" style="width: 4em">&nbsp;</th>
    <th scope="col" style="width: 9em">&nbsp;</th>
    <th scope="col" style="width: 5em;text-align:center">
      <c:choose>
        <c:when test="${prefix == 'Saved'}">Saved</c:when>
        <c:otherwise>Modified</c:otherwise>
      </c:choose>
    </th>
    <th scope="col" style="width: 5em;text-align:center">Viewed</th>
    <th scope="col" style="width: 4em">Version</th>
    <th scope="col" style="width: 4em;text-align:right">Size</th>
    <th>&nbsp;&nbsp;</th>
  </tr>
  </thead>


  <tbody <c:if test="${prefix == 'Unsaved'}">class="unsaved-strategies-body"</c:if>>
  <c:set var="i" value="0"/>
  <%-- begin of forEach strategy in the category --%>
  <c:forEach items="${strategies}" var="strategy">
    <c:set var="strategyId" value="${strategy.strategyId}"/>
    <c:choose>
      <c:when test="${i % 2 == 0}">
		<tr class="lines"></c:when>
      <c:otherwise>
		<tr class="linesalt"></c:otherwise> 
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
        <img id="img_${strategyId}" class="plus-minus plus" src="/assets/images/sqr_bullet_plus.png" alt="" onclick="toggleSteps2(${strategyId})"/>
      </td>

      <c:set var="dispNam" value="${strategy.name}"/>

      <td>
        <div id="text_${strategyId}">
          <span <c:choose>
		<c:when test="${active}">style="font-weight:bold;cursor:pointer" title="Click to go to the graphical display (Run tab)"</c:when>
		<c:otherwise> style="cursor:pointer" title="Click to open this strategy in the strategy graphical display (Run tab)" </c:otherwise>
		</c:choose>
		 onclick="openStrategy('${strategyId}')">${dispNam}</span><c:if test="${!strategy.isSaved}">*</c:if><c:if test="${!strategy.valid}">&nbsp;&nbsp;&nbsp;<img src="/assets/images/invalidIcon.png" width="12"/></c:if>
        </div> 

      </td>


<%-- here, the description cannot expand beyond the td, it wraps using more vertical space.
	<table id="strat_description">
          <tbody id="steps_${strategyId}">
          <site:stepRows latestStep="${strategy.latestStep}" i="${i}" indent="0"/>
          </tbody>    
        </table>
--%>


      <td nowrap>
        <div id="activate_${strategyId}">
          <c:choose>
            <c:when test="${!active}">
              <input type='button' value='Open' onclick="openStrategy('${strategyId}')" />
            </c:when>
            <c:otherwise>
              <input type='button' value='Close' onclick="closeStrategy('${strategyId}', true)" />
            </c:otherwise>
          </c:choose>
        </div>
      </td>

      <td>
         <input type='button' value='Download' onclick="downloadStep('${strategy.latestStep.stepId}')" />
      </td>
      <td nowrap>
         <c:set var="saveAction" value="showHistSave(this, '${strategyId}', true);"/>
         <c:set var="shareAction" value="showHistShare(this, '${strategyId}', '${exportBaseUrl}${strategy.importId}');" />
         <c:if test="${!strategy.isSaved}">
           <c:set var="shareAction" value="showHistSave(this, '${strategyId}', true,true);" />
         </c:if>
         <c:if test="${wdkUser.guest}">
           <c:set var="saveAction" value="popLogin();"/>
           <c:set var="shareAction" value="popLogin();"/>
         </c:if>
         <select id="actions_${strategyId}" onchange="eval(this.value);this[0].selected='true';">
            <option value="return false;">---More actions---</option>
            <option value="showHistSave(this, '${strategyId}', false)">Rename</option>
            <option value="copyStrategy('${strategyId}', true);">Copy</option>
            <option value="${saveAction}">Save As</option>
            <option value="${shareAction}">Share</option>
            <option value="deleteStrategy(${strategyId}, true)">Delete</option>
         </select>
      </td>
      <td nowrap style="padding:0 2px 0 2px;">${strategy.lastModifiedTimeFormatted}</td>
      <td nowrap  style="padding:0 2px;text-align:right">${strategy.lastViewedTimeFormatted}</td>
      <td nowrap style="text-align:center">
        <c:choose>
          <c:when test="${strategy.latestStep.version == null || strategy.latestStep.version eq ''}">${wdkModel.version}</c:when>
          <c:otherwise>${strategy.latestStep.version}</c:otherwise>
        </c:choose>
      </td>
      <td nowrap style="text-align:right">${strategy.latestStep.estimateSize}</td>
      <td>&nbsp;&nbsp;</td>
    </tr>

<%-- description : because of being in a diferent tr, we can expand to use all horizontal space  --%>
<tr id="desc_${strategyId}"  style="display: none;"><td colspan="11">


	<table id="strat_description">
          <tbody id="steps_${strategyId}">
          <site:stepRows latestStep="${strategy.latestStep}" i="${i}" indent="50"/>
          </tbody>    
        </table>


</td></tr>

    <c:set var="i" value="${i+1}"/>
  </c:forEach>
  <!-- end of forEach strategy in the category -->
  </tbody>
</table>
