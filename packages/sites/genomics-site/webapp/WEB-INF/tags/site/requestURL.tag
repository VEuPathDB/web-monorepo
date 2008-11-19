<%-- set the request scope var 'originRequestUrl' to be the value
     of the client's original request URL before Tomcat may have
     munged it during forwards --%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="request"    value="${pageContext.request}"/>
<c:set var="scheme"     value="${request.scheme}"     />
<c:set var="serverName" value="${request.serverName}" />
<c:set var="port"       value=":${request.serverPort}" />

<c:if test="${port eq ':80' and fn:toLowerCase(scheme) eq 'http'}">
    <c:remove var="port"/>
</c:if>
<c:if test="${port eq ':443' and fn:toLowerCase(scheme) eq 'https'}">
    <c:remove var="port"/>
</c:if>

<c:choose>
<c:when test="${requestScope['javax.servlet.forward.request_uri'] != null}">
  <c:set var="requestUri" value="${requestScope['javax.servlet.forward.request_uri']}"/>
</c:when>
<c:otherwise>
  <c:set var="requestUri" value="${request.requestURI}"/>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${requestScope['javax.servlet.forward.query_string'] != null}">
  <c:set var="queryString" value="${requestScope['javax.servlet.forward.query_string']}"/>
</c:when>
<c:otherwise>
    <c:set var="queryString" value="${request.queryString}"/>
</c:otherwise>
</c:choose>

<c:set var="preOriReqUri" value="${scheme}://${serverName}${port}${requestUri}" />

<c:if test="${queryString != null}">
    <c:set var="preOriReqUri" value="${preOriReqUri}?${queryString}"/>
</c:if>

<c:set var="originRequestUrl" value="${preOriReqUri}" scope="request"/>
