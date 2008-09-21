<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="messageCategory"
              required="false"
	      description="category of announcement"
%>

<%@ attribute name="projectName"
              required="true"
              description="component site"
%>

<c:catch>
<c:import url="http://${pageContext.request.serverName}/cgi-bin/messageRead.pl?messageCategory=${messageCategory}&projectName=${projectName}">
</c:import>
</c:catch>

