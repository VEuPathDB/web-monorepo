<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="query_string" value="${requestScope['javax.servlet.forward.query_string']}" />

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="siteAdminEmail" value="${props['SITE_ADMIN_EMAIL']}"/>

<site:header refer="exception" />

<h2><span style="font-color: red;">Unexpected Error</span></h2>
<%-- <site:header banner="Unexpected Error" /> --%>

<em>Sorry, an unexpected error has occurred.</em>
<p>
This may result from incorrect query parameter values (for instance, you may have specified a string where a number was expected, or vice versa). If this might be the case, try going back to the previous page, and carefully examine your input parameters, comparing them to the provided sample parameters.

<c:set var="error">
Site error from
Remote Host: ${pageContext.request.remoteHost}
Referred from: ${header['Referer']}
Error on:

${scheme}://${serverName}${request_uri}?${query_string}

************************************************

<%-- http://www-128.ibm.com/developerworks/java/library/j-jstl0211.html --%>
<c:forEach var='parameter' items='${paramValues}'> 
<c:out value='${parameter.key}'/>:
      <c:forEach var='value' items='${parameter.value}'><c:out value='${value}'/></c:forEach>
</c:forEach>
************************************************

<c:forEach items='${requestScope}' var='p'>
Parameter Name: <c:out value='${p.key}'/>
Parameter Value: <c:out value='${p.value}'/>
</c:forEach>

************************************************
<h3>Stacktrace</h3>

<wdk:errors showStackTrace="true" />
</body></html>
</c:set>

<c:set var="publicHosts">
        ${wdkModel.displayName}.org
     qa.${wdkModel.displayName}.org
    www.${wdkModel.displayName}.org
</c:set>

<c:choose>
<c:when test="${ ! fn:containsIgnoreCase(publicHosts, serverName)}">
  <pre>
${error}
  </pre>
</c:when>
<c:otherwise>
  <c:if test="${header['Referer'] != null or param.debug == 1}">
  <site:email 
    to="${siteAdminEmail}"
    from="tomcat@${serverName}"
    subject="${wdkModel.displayName} Site Error - ${pageContext.request.remoteHost}" 
    body="${error}" 
  />
  <p>
  refered from <a href="${header['Referer']}">${header['Referer']}</a>
  </c:if>
</c:otherwise>
</c:choose>


<site:footer/>
