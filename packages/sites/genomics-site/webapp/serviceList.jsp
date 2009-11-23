<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header banner="${wdkModelDispName}" />

<!-- display wdkModel introduction text -->
<hr>
<!-- show all questionSets in model -->
<c:set value="${wdkModel.questionSets}" var="questionSets"/>
<ul>
<c:forEach items="${questionSets}" var="qSet">
  <c:if test="${qSet.internal == false}">
		<li><a href="<c:url value='/webservices/${qSet.name}.wadl'/>">${qSet.name}</a></li>
			<ul>
           		<c:forEach items="${qSet.questions}" var="q">
             			<li><a href="<c:url value='/webservices/${qSet.name}/${q.name}.wadl'/>">${q.displayName}</a></li>
           		</c:forEach>
			</ul>
		<hr>
  </c:if>
</c:forEach>
</ul>
<site:footer/>
