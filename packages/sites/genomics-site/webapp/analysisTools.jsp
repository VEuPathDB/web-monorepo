<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<imp:pageFrame title="${wdkModel.displayName} :: Analysis Tools"
               refer="faq"
               banner="Analyze Results"
               parentUrl="/home.jsp">

  <h1>Analysis Tools</h1>

  <p>Now, you can analyze your search results on all EuPathDB sites.</p>

  <div><img src="/assets/images/new-analysis-tool.jpg"/></div>

  <h3>How to create an Analysis</h3>
  <div>
    <ol>
      <li>Start a new search, or open an existing strategy.</li>
      <li>When the results are loaded, click on the blue "Analyze Results" button.</li>
      <li>Select an analysis tool from the list of available tools.</li>
    </ol>
    <em>Not all search results have analysis tools available.</em>
  </div>

  <h3>Video Tutorial</h3>
  <div>
    <em>Embedded YouTube video here</em>
  </div>
</imp:pageFrame>
