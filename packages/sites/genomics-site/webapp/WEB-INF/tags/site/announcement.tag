<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib"%>
    
<%@ attribute name="messageCategory"
              required="false"
	      description="category of announcement"
%>

<%@ attribute name="projectName"
              required="true"
              description="component site"
%>


<c:catch>

  <api:messages var="messages" projectName="${projectName}" messageCategory="${messageCategory}"/>
  
  <c:forEach var="message" items="${messages}" varStatus="stat">
    ${message}
    <c:if test="${stat.count < fn:length(messages)}">
        <hr class="announce"/>
    </c:if>
  </c:forEach>

</c:catch>


<%-- obsolete retreival from cgi script
<c:catch>
<c:import url="http://${pageContext.request.serverName}/cgi-bin/messageRead.pl?messageCategory=${messageCategory}&projectName=${projectName}">
</c:import>
</c:catch>
--%>
