<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="name"
              description="the name of the jsp page that calls this tag"
%>

<c:set var="logContent" value="wdk-record-page-id=${requestScope.wdkPageId} --- finished ${name} loading." />
<script src="<c:url value='/logging.do?content=${logContent}' />"></script>
