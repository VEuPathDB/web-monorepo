<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<div class="enrich-download-link">
  <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
  <c:url var="hiddenDownloadUrl" value ="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.hiddenDownloadPath}"/>
  <p class="enrich-result-p">
    This analysis result may be lost if you change your gene result.<br>To save this analysis result, please <a href="${hiddenDownloadUrl}">Download Analysis Results (including geneIDs)</a>
 </p>

</div>
<div class="enrichment_goCloud">
</div>

<div class="goCloud-download-link">
  <c:url var="goDownloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.imageDownloadPath}"/>
  <p class="enrich-result-q">
   <a href="${goDownloadUrl}">Word Cloud</a>
 </p>

</div>

<div class="goCloud-popup-content">
     <img src="${goDownloadUrl}" width="700" height="300"/>
     <p> This word cloud was created using the P-values and the full terms from the Enrichment analysis via a program called GOSummaries </p>
     <p> If you would like to download this image please <a href="${goDownloadUrl}">Click Here</a>
     </p>
</div>
      

<h3>Analysis Results: </h3>


