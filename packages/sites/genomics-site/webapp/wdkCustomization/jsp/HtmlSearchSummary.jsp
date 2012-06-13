<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<c:set var="project" value="${applicationScope.wdkModel.projectId}" />
<c:set var="keyword" value="${requestScope.keyword}" />
<c:set var="errorMessage">
  <p>An error occurred. Please refresh the page to retry.</p>
  <p>If the problem persists, please contact EuPathDB project team.</p>
</c:set>
<c:set var="siteId">
  <c:choose>
    <c:when test = "${project == 'AmoebaDB'}">3266681</c:when>
    <c:when test = "${project == 'ToxoDB'}">55216397</c:when>
    <c:when test = "${project == 'TriTrypDB'}">58147367</c:when>
    <c:otherwise>58147367</c:otherwise>
  </c:choose>
</c:set>
<c:set var="htmlUrl" value="http://search.freefind.com/find.html?si=${siteId}&pid=r&n=0&_charset_=UTF-8&bcd=%C3%B7&sbv=j1&query=${keyword}" />


<%-- display page header with recordClass type in banner --%>
<imp:header banner="Site Search"/>

<link rel="Stylesheet" type="text/css" href="<c:url value='/wdkCustomization/css/site-search.css' />"/>




<div id="site-search">

  <h1>Other web pages</h1>

  <c:import url="${htmlUrl}" />

</div><!-- END of site-search -->


<imp:footer/>
