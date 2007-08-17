<%-- 
Display error/exception message in a jsp page. 
Sends an email report to site admin when called on non-dev sites.

Requirements: SITE_ADMIN_EMAIL defined in WDK model.prop
              email.tag
              
Sample usage:

        <c:catch var="e">
           <c:import url="${someUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <site:embeddedError 
                msg="<font size='-2'>error accessing<br>'${someUrl}'</font>" 
                e="${e}" 
            />
        </c:if>


--%>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%@ attribute name="e"
              required="true"
              description="the error"
%>
<%@ attribute name="msg"
              required="true"
              description="Text message to display in situ"
%>

<c:set var="publicHosts">
        ${wdkModel.displayName}.org
     qa.${wdkModel.displayName}.org
    www.${wdkModel.displayName}.org
</c:set>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="to" value="${props['SITE_ADMIN_EMAIL']}" />
<%--
<c:set var="from" value="tomcat@${wdkModel.displayName}.org" />
--%>
<c:set var="from" value="tomcat@${serverName}" />
<%-- including remote host in subject to aid filtering in email --%>
<c:set var="subject" value="Embedded error - ${pageContext.request.remoteHost}" />

<c:set var="scheme" value="${pageContext.request.scheme}" />
<c:set var="serverName" value="${pageContext.request.serverName}" />
<c:set var="request_uri" value="${requestScope['javax.servlet.forward.request_uri']}" />
<c:set var="query_string" value="${requestScope['javax.servlet.forward.query_string']}" />
<c:set var="errorOn" value="${scheme}://${serverName}${request_uri}?${query_string}" />

<c:choose>
<c:when test="${ ! fn:containsIgnoreCase(publicHosts, serverName)}">
<%-- Display for Developer site --%>

${msg}<hr>
<font size='-2'>${e}</font>

</c:when>
<c:otherwise>
<%-- Display for Public site and send email --%>

${msg}

<c:set var="body">

Error on ${errorOn} : 

${e}

----------

Client Browser: ${header['User-Agent']}
Client IP: ${pageContext.request.remoteHost}
Referer URL: ${header['referer']}
Time: <fmt:formatDate type="both" pattern="dd/MMM/yyyy:H:mm:ss" value="<%=new java.util.Date()%>" />

</c:set>
    
<site:email 
    to="${to}"
    from="${from}"
    subject="${subject}" 
    body="${body}" 
/>
    
</c:otherwise>
</c:choose>

