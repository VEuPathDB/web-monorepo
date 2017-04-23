<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<div class="enrich-download-link">
  <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
  <p class="enrich-result-p">
    This analysis result may be lost if you change your gene result. To save this analysis result, please <a href="${downloadUrl}">Download Analysis Results</a>
 </p>

</div>
<div class="goCloud-download-link">
  <c:url var="goDownloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.imageDownloadPath}"/>
  <p class="enrich-result-q">
    This analysis has also been made into a word Cloud to download  please <a href="${goDownloadUrl}">Click Here</a>
 </p>

</div>

<h3>Analysis Results:   </h3>


