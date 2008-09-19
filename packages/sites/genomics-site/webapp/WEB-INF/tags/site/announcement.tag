<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="messageCategory"
              required="false"
	      description="category of announcement"
%>

<%@ attribute name="projectName"
              required="true"
              description="component site"
%>

<c:set var="serverName" value="${pageContext.request.serverName}"/>

<c:if test="${serverName != 'localhost' && serverName != '127.0.0.1'}">
<c:import url="http://${serverName}/cgi-bin/messageRead.pl?messageCategory=${messageCategory}&projectName=${projectName}">
</c:import>
</c:if>

