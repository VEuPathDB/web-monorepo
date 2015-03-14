<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>


<c:set var="project" value="${applicationScope.wdkModel.displayName}"/>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>

<c:set var="layout" value="${requestScope.filter_layout}"/>

<c:choose>
<c:when test = "${project == 'EuPathDB'}">
	<c:set var="th" value="<th style='white-space:normal'>"/>
</c:when>
<c:otherwise>
	<c:set var="th" value="<th>"/>
</c:otherwise>
</c:choose>


<table border="0" cellspacing="0">
  <c:choose>
    <c:when test="layout.vertical"> <%-- vertically aligned table --%>
      <c:forEach items="${layout.instances}" var="instance">
        <tr>
          <th>${instance.displayName}</th>
          <td>
            <imp:filterInstance strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" instanceName="${instance.name}" />
          </td>
        </tr>
      </c:forEach>
    </c:when>
    <c:otherwise> <%-- horizontally aligned table --%>
      <tr>
        <c:forEach items="${layout.instances}" var="instance">
	   <td>
            <imp:filterInstance title="true" strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" instanceName="${instance.name}" />
          </td>
        </c:forEach>
      </tr>
      <tr>
        <c:forEach items="${layout.instances}" var="instance">
          <td>
            <imp:filterInstance strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" instanceName="${instance.name}" />
          </td>
        </c:forEach>
      </tr>
    </c:otherwise>
  </c:choose>
</table>

