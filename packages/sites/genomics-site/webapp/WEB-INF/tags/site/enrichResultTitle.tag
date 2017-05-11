<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<div class="enrich-download-link">
  <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
  <c:url var="hiddenDownloadUrl" value ="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.hiddenDownloadPath}"/>
  <p class="enrich-result-p">
    This analysis result may be lost if you change your gene result. To save this analysis result, please <a href="${downloadUrl}">Download Analysis Results as shown below</a> or <a href="${hiddenDownloadUrl}">with geneIDs</a>
 </p>

</div>
<div class="goCloud-download-link">
  <c:url var="goDownloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.imageDownloadPath}"/>
  <p class="enrich-result-q">
    Click on the image to see a GoSummaries word cloud of this analysis <a href="${goDownloadUrl}"><img border="1" src="wdkCustomization/images/GOsummaries.png" width="125" height="50"></a>
 </p>

</div>

<h3>Analysis Results:   </h3>


