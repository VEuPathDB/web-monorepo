<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<div class="enrich-download-link">
  <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
  <a href="${downloadUrl}">Download Analysis Results</a>
  <p class="enrich-result-p">
    This analysis result may be lost if you change your gene result. To save this analysis result, please download.
  </p>
</div>
<h3>Analysis Results:   </h3>


