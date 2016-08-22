<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="query_string" value="${requestScope['javax.servlet.forward.query_string']}" />

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<%--
  Replaced with line below as SITE_ADMIN_EMAIL is being deprecated in favor of adminEmail from the config.xml file - CWL 08APR16
<c:set var="siteAdminEmail" value="${props['SITE_ADMIN_EMAIL']}"/>
--%>
<c:set var="siteAdminEmail" value="${wdkModel.model.modelConfig.adminEmail}"/>

<imp:pageFrame title="Unexpected Error" refer="exception">

<h2><span style="font-color: red;">Unexpected Error</span></h2>

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
  <c:forEach var='value' items='${parameter.value}'>
    <c:choose>
    <c:when test="${fn:startsWith(fn:toLowerCase(parameter.key), 'passw')}">
      <c:out value='********'/>
    </c:when>
    <c:when test="${fn:startsWith(fn:toLowerCase(parameter.key), 'email')}">
      <c:out value='********'/>
    </c:when>
    <c:otherwise>
      <c:out value='${value}'/>
    </c:otherwise>
    </c:choose>
  </c:forEach>
</c:forEach>
************************************************

<c:forEach items='${requestScope}' var='p'>
Parameter Name: <c:out value='${p.key}'/>
Parameter Value: <c:out value='${p.value}'/>
</c:forEach>

************************************************
<h3>Stacktrace</h3>

<imp:errors showStackTrace="true" />
</body></html>
</c:set>

<c:set var="publicHosts">
        ${wdkModel.displayName}.org
     qa.${wdkModel.displayName}.org
     beta.${wdkModel.displayName}.org
    www.${wdkModel.displayName}.org
</c:set>

<c:choose>
<c:when test="${ ! fn:containsIgnoreCase(publicHosts, serverName)}">
  <pre>
${error}
  </pre>
</c:when>
<c:otherwise>
  <%-- siteAdminEmail is optional - CWL 08APR16 --%>
  <c:if test="${(header['Referer'] != null or param.debug == 1) && !empty siteAdminEmail}">
    <imp:email 
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


</imp:pageFrame>
