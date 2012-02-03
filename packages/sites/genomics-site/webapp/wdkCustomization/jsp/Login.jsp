<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<imp:header title="Login"
             banner="EuPathDB Account Login"
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

<h1 align="center">EuPathDB Account Login</div>
<div align="center">

<p><b>Login</b> so you can:
<table><tr><td>
<div id="cirbulletlist">
<ul>
<li>keep your strategies (unsaved and saved) from session to session
<li>comment on genes and sequences
<li>set site preferences
</ul>
</div>
</td></tr></table>


<imp:login showError="true" />
</div>
<imp:footer />

