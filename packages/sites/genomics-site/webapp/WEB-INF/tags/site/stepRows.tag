<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="latestStep"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step object representing latest step in a strategy or substrategy"
%>

<%@ attribute name="indent"
              required="true"
              description="Number of pixels to indent this set of steps"
%>

<%@ attribute name="i"
              required="true"
              description="Row number for the Strategy that latestStep belongs to"
%>

<!-- begin rowgroup for strategy steps -->
<c:set var="j" value="0"/>
<c:set var="steps" value="${latestStep.allSteps}"/>
<c:forEach items="${steps}" var="step">
  <c:choose>
    <c:when test="${i % 2 == 0}"><tr class="lines" style="display: none;"></c:when>
    <c:otherwise><tr class="linesalt" style="display: none;"></c:otherwise>
  </c:choose>
  <!-- offer a rename here too? -->
  <td scope="row" colspan="3"></td>
  <c:choose>
    <c:when test="${j == 0}">
      <td nowrap><ul style="margin-left: ${indent}px;"><li>Step ${j + 1} (${step.resultSize}): ${step.customName}</li></ul></td>
    </c:when>
    <c:otherwise>
      <!-- only for boolean, need to check for transforms -->
      <c:choose>
        <c:when test="${step.isBoolean}">
          <c:choose>
            <c:when test="${step.childStep.isCollapsible}">
              <c:set var="dispName" value="${step.childStep.collapsedName}"/>
            </c:when>
            <c:otherwise>
              <c:set var="dispName" value="${step.childStep.customName}"/>
            </c:otherwise>
          </c:choose>
          <c:choose>
            <c:when test="${j == 1}">
              <td nowrap><ul style="margin-left: ${indent}px;"><li>Step ${j + 1} (${step.resultSize}): Step ${j}</li><li class="operation ${step.operation}" /><li>${dispName}&nbsp;(${step.childStep.resultSize})</li></ul></td>
            </c:when>
            <c:otherwise>
              <td nowrap><ul style="margin-left: ${indent}px; margin-top:-8px;"><li>Step ${j + 1} (${step.resultSize}): Step ${j}</li><li class="operation ${step.operation}" /><li>${dispName}&nbsp;(${step.childStep.resultSize})</li></ul></td>
            </c:otherwise>
          </c:choose>
        </c:when>
        <c:otherwise>
          <td nowrap><ul style="margin-left: 10px;"><li>Step ${j + 1} (${step.resultSize}): ${step.customName}</li></ul></td>
        </c:otherwise>
      </c:choose>
    </c:otherwise>
  </c:choose>
  <td colspan="5"/>
  <%-- <td></td>
    <td align="right" nowrap>
      <c:choose>
        <c:when test="${step.version == null || step.version eq ''}">${wdkModel.version}</c:when>
        <c:otherwise>${step.version}</c:otherwise>
      </c:choose>
    </td>
    <td align='right' nowrap>${step.resultSize}</td>
    <c:set var="stepId" value="${step.stepId}"/>
    <td nowrap><a href="downloadStep.do?step_id=${stepId}">download</a></td> --%>
  </tr>
  <c:if test="${step.childStep.isCollapsible}">
    <site:stepRows latestStep="${step.childStep}" i="${i}" indent="${indent + 10}"/>
  </c:if>
  <c:set var="j" value="${j + 1}"/>
</c:forEach>
