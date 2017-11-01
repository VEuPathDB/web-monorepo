<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<div class="enrich-download-link">
  <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
  <c:url var="hiddenDownloadUrl" value ="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.hiddenDownloadPath}"/>
  <p class="enrich-result-p">
    This analysis result may be lost if you change your gene result.
    <br />
    To save this analysis result, please <a href="${hiddenDownloadUrl}">Download Analysis Results (including geneIDs)</a>
  </p>
</div>

<div class="enrichment_goCloud">
</div>

<div class="goCloud-popup-content">
   <img src="${goDownloadUrl}" width="700" height="300"/>
   <p>This word cloud was created using the P-values and the full terms from the Enrichment analysis via a program called GOSummaries</p>
   <p>
     If you would like to download this image please <a href="${goDownloadUrl}">Click Here</a>
   </p>
</div>

<div style="text-align: right; display: block; margin-bottom: -95px; padding-top: 95px;">
  <div style="display: inline-block; margin: 5px;">
    <c:url var="goDownloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.imageDownloadPath}"/>
      <a href="${goDownloadUrl}">
        <button class="btn">
          <i class="fa fa-cloud" style="margin-left:0; padding-left: 0;"> </i>
          Show <b>Word Cloud</b>
        </button>
      </a>
    </p>
  </div>
  <div style="display: inline-block; margin: 5px;">
    <c:url var="revigoInputList" value="${viewModel.revigoInputList}"/>
    <form target="_blank" action="http://revigo.irb.hr/" method="post">
      <textarea name="inputGoList" rows="10" cols="80" hidden="true">
        ${revigoInputList}
      </textarea>
      <input name="isPValue" value="yes" hidden="true"/>
      <input name="outputListSize" value="medium" hidden="true"/>
      <button type="submit" name="startRevigo" class="btn">
        <i class="fa fa-bar-chart" style="margin-left:0; padding-left: 0;"> </i>
        Open in <b>Revigo</b>
      </button>
    </form>
  </div>
</div>

<h3>Analysis Results: </h3>
