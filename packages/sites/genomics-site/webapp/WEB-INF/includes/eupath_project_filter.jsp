<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<jsp:useBean id="rMMap" class="java.util.HashMap" type="java.util.Map"/>
<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="resultMessage" value="${answerValue.resultMessage}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>
<c:forEach var="rM" items="${fn:split(resultMessage, ',')}">
	<c:set var="m" value="${fn:split(rM, ':')}"/>
	<c:set target="${rMMap}" property="${m[0]}" value="${m[1]}"/>
</c:forEach>

<table border="0" cellspacing="0" cellspacing="0">
  <c:choose>
    <c:when test="layout.vertical"> <%-- vertically aligned table --%>
      <c:forEach items="${layout.instances}" var="linstance">
        <tr>
          <th>${linstance.displayName}</th>
          <td>
			<c:set var="instanceName" value="${linstance.name}" />
            <c:set var="recordClass" value="${answerValue.recordClass}" />
			<c:set var="instance" value="${recordClass.filterMap[instanceName]}" />

			<c:set var="current">
			    <c:set var="currentFilter" value="${answerValue.filter}" />
			    <c:choose>
			        <c:when test="${currentFilter != null}">${instance.name == currentFilter.name}</c:when>
			        <c:otherwise>false</c:otherwise>
			    </c:choose>
			</c:set>

			<div class="filter-instance">
			    <c:if test="${current}"><div class="current"></c:if>
			        <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&revise=${stepId}&filter=${instance.name}" />
			        <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
			        <a id="link-${instanceName}-2" class="link-url" href="javascript:void(0)" countref="${countUrl}" strId="${strategyId}" stpId="${stepId}" linkUrl="${linkUrl}">
						<c:choose>
							<c:when test="${current}">
								<c:choose>
									<c:when test="${rMMap[linstance.displayName] == -1}">Error</c:when>
									<c:when test="${rMMap[linstance.displayName] == -2}">N/A</c:when>
									<c:otherwise>${answerValue.resultSize}</c:otherwise>
								</c:choose>
							</c:when>
							<c:otherwise>
								<c:choose>
									<c:when test="${rMMap[linstance.displayName] == -1}">Error</c:when>
									<c:when test="${rMMap[linstance.displayName] == -2}">N/A</c:when>
									<c:otherwise><img class="loading" src="<c:url value="/images/loading.gif" />" /></c:otherwise>
								</c:choose>
							</c:otherwise>
						</c:choose>
					</a>
			        <div class="instance-detail" style="display: none;">
			            <div class="display">${instance.displayName}</div>
			            <div class="description">${instance.description}</div>
			        </div>
			    <c:if test="${current}"></div></c:if>
			</div>
			
          </td>
        </tr>
      </c:forEach>
    </c:when>
    <c:otherwise> <%-- horizontally aligned table --%>
      <tr>
        <c:forEach items="${layout.instances}" var="linstance">
          <th>${linstance.displayName}</th>
        </c:forEach>
      </tr>
      <tr>
        <c:forEach items="${layout.instances}" var="linstance">
          <td>
			<c:set var="instanceName" value="${linstance.name}" />
            <c:set var="recordClass" value="${answerValue.recordClass}" />
			<c:set var="instance" value="${recordClass.filterMap[instanceName]}" />

			<c:set var="current">
			    <c:set var="currentFilter" value="${answerValue.filter}" />
			    <c:choose>
			        <c:when test="${currentFilter != null}">${instance.name == currentFilter.name}</c:when>
			        <c:otherwise>false</c:otherwise>
			    </c:choose>
			</c:set>

			<div class="filter-instance">
			    <c:if test="${current}"><div class="current"></c:if>
			        <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&revise=${stepId}&filter=${instance.name}" />
			        <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
			        <a id="link-${instanceName}-2" class="link-url" href="javascript:void(0)" countref="${countUrl}" strId="${strategyId}" stpId="${stepId}" linkUrl="${linkUrl}">
						<c:choose>
							<c:when test="${current}">
								<c:choose>
									<c:when test="${rMMap[linstance.displayName] == -1}">Error</c:when>
									<c:when test="${rMMap[linstance.displayName] == -2}">N/A</c:when>
									<c:otherwise>${answerValue.resultSize}</c:otherwise>
								</c:choose>
							</c:when>
							<c:otherwise>
								<c:choose>
									<c:when test="${rMMap[linstance.displayName] == -1}">Error</c:when>
									<c:when test="${rMMap[linstance.displayName] == -2}">N/A</c:when>
									<c:otherwise><img class="loading" src="<c:url value="/images/loading.gif" />" /></c:otherwise>
								</c:choose>
							</c:otherwise>
						</c:choose>
					</a>
			        <div class="instance-detail" style="display: none;">
			            <div class="display">${instance.displayName}</div>
			            <div class="description">${instance.description}</div>
			        </div>
			    <c:if test="${current}"></div></c:if>
			</div>
			
          </td>
        </c:forEach>
      </tr>
    </c:otherwise>
  </c:choose>
</table>

