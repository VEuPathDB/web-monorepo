<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<c:if test="${not empty param.GALAXY_URL}">
  <%-- Set galaxy url both as a cookie and on the backend to allow flexibility --%>
  <c:set var="galaxyUrl" value="${param.GALAXY_URL}"/>
  <jsp:scriptlet>
    javax.servlet.http.Cookie c = new Cookie("GALAXY_URL", (String)pageContext.getAttribute("galaxyUrl"));
    c.setMaxAge(4*60*60); // expire galaxy cookie after 4 hours
    response.addCookie(c);
  </jsp:scriptlet>
</c:if>

<!-- flag incoming galaxy.psu.edu users -->
<!-- ignore for now- not whether any part of this code is desirable any more
<c:if test="${empty sessionScope.GALAXY_URL}">
  <c:set var="GALAXY_URL" value="http://main.g2.bx.psu.edu/tool_runner?tool_id=eupathdb" scope="session" />
</c:if>
<c:set var="EUPATHDB_GALAXY_URL" value="http://galaxy.apidb.org/tool_runner?tool_id=eupathdb" scope="session" />
-->

<imp:pageFrame refer="home2">
  <imp:queryGrid />
  <imp:sidebar/>
</imp:pageFrame>
