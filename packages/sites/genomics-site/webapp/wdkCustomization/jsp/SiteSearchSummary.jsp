<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<c:set var="project" value="${applicationScope.wdkModel.projectId}" />
<c:set var="keyword" value="${requestScope.keyword}" />
<c:set var="geneUrl" value="${requestScope.geneUrl}" />
<c:set var="isolateUrl" value="${requestScope.isolateUrl}" />
<c:url var="countUrl" value="/showSummary.do?resultsOnly=true&" />
<c:url var="searchUrl" value="/processQuestion.do?questionSubmit=Get+Answer&" />
<c:set var="hasIsolate" value="${project eq 'CryptoDB' || project eq 'GiardiaDB'
                                 || project eq 'PlasmoDB' || project eq 'ToxoDB'}" />
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
<c:url var="htmlUrl" value="http://search.freefind.com/find.html?si=${siteId}&pid=r&n=0&_charset_=UTF-8&bcd=%C3%B7&sbv=j1">
  <c:param name="query" value="${keyword}" />
</c:url>

<%-- display page header with recordClass type in banner --%>
<imp:header banner="Site Search"/>

<link rel="Stylesheet" type="text/css" href="<c:url value='/wdkCustomization/css/site-search.css' />"/>




<div id="site-search">


<h1>Site Search Summary</h1>

<div id="search-info" class="ui-widget-content ui-corner-all"> 
  You are searching for <span id="keyword">${keyword}</span>...
</div>


<!-- gene results -->
<fieldset id="gene" class="record" url="${countUrl}${geneUrl}">
  <legend>
    <div class="loading">Searching for genes...</div>
    <div class="loaded">Found <span class="count"></span> gene(s)</div>
  </legend>
  <span class="wait"> </span>
  <div class="source"></div>
  <div class="result">
    <p>Display the first <span class="count">0</span> gene(s):</p>
    <ul class="summary"></ul>
    <div class="to-results">
      <a href="${searchUrl}${geneUrl}">View all genes in strategy</a>
    </div>
  </div>
  <div class="error">${errorMessage}</div>
</fieldset>


<c:if test="${hasIsolate}">
<!-- isolate results -->
<fieldset id="isolate" class="record" url="${countUrl}${isolateUrl}">
  <legend>
    <div class="loading">Searching for isolates...</div>
    <div class="loaded">Found <span class="count"></span> isolate(s)</div>
  </legend>
  <span class="wait"> </span>
  <div class="source"></div>
  <div class="result">
    <p>Display the first <span class="count">0</span> isolate(s):</p>
    <ul class="summary"></ul>
    <div class="to-results">
      <a href="${searchUrl}${isolateUrl}">View all isolates in strategy</a>
    </div>
  </div>
  <div class="error">${errorMessage}</div>
</fieldset>
</c:if>


<!-- freefind results -->
<fieldset id="freefind" class="resource">
  <legend>
    <div class="loading">Searching for other resources...</div>
    <div class="loaded">Found <span class="count"></span> web pages</div>
  </legend>
  <span class="wait"> </span>

  <div class="source"><c:import url="${htmlUrl}" /></div>
  <div class="result">
    <p>Display the first <span class="count">0</span> page(s):</p>
    <ul class="summary"></ul>
    <div class="to-results">
      <c:url var="htmlSearchUrl" value="/siteSearch.do?type=html">
        <c:param name="keyword" value="${keyword}" />
      </c:url>
      <a href="${htmlSearchUrl}">View all web pages</a>
    </div>
  </div>
  <div class="error">${errorMessage}</div>
</fieldset>


</div><!-- END of site-search -->

<script type="text/javascript" src="<c:url value='/wdkCustomization/js/site-search.js'/>"></script>

<imp:footer/>
