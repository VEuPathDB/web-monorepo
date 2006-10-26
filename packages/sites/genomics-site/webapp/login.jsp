<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<site:header title="Login"
             banner="ApiDB Account Login"
             division="login"/>

<c:choose>
  <c:when test="${param.originUrl != null}">
    <c:set var="originUrl" value="${param.originUrl}" scope="request"/>
  </c:when>
  <c:when test="${sessionScope.originUrl != null}">
    <c:set var="originUrl" value="${originUrl}" scope="request"/>
  </c:when>
  <c:otherwise>
    <c:set var="originUrl" value="${header['referer']}" scope="request"/>
  </c:otherwise>
</c:choose>
<hr>
<c:choose>
  <c:when test="${param.refererUrl != null}">
    <c:set var="refererUrl" value="${param.refererUrl}" scope="request"/>
  </c:when>
  <c:when test="${sessionScope.refererUrl != null}">
    <c:set var="refererUrl" value="${refererUrl}" scope="request"/>
  </c:when>
  <c:otherwise>
    <c:set var="refererUrl" value="${header['referer']}" scope="request"/>
  </c:otherwise>
</c:choose>

<body bgcolor='#ffffff'>
<p><b>Login</b> so you can:
<ul>
<li>comment on genes and sequences
<li>have your query history remembered from session to session
<li>set site preferences (future release)
</ul>

<p>

<table width="30%" align="left" border="1">
  <tr>
    <td>
    <site:login/>
    </td>
  </tr>
</table>

</body>
</html>
