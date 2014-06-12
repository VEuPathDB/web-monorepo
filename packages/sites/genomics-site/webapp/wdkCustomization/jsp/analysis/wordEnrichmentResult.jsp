<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}"/>
  <html>
    <body>
      <div>
        <div style="position:relative">
          <style>
            .word-result-p {
              margin: 5px;
              text-align: center;
            }
            /*
            .word-table {
              margin-top: 5px;
            }
            */
            .word-table th {
              text-align:left;
            }
            .word-table td {
              text-align: left;
            }
            .word-table td.word-centered {
              text-align: center;
            }
            .word-databar {
              border:0; margin:0; padding:0;
              display: inline-block;
              height: 1em;
              background-color: lightgreen;
            }
            .word-download-link {
              position: absolute;
              top: 0px;
              right: 0px;
              font-weight: bold;
            }
            .word-empty-results {
              font-weight: bold;
              margin: 25px auto;
              text-align: center;
            }
          </style>
          <span class="word-download-link">
            <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
            <a href="${downloadUrl}">Download Analysis Results</a>
          </span>
          <h2 style="text-align:center">Enriched Words</h2>
          <p class="word-result-p">
            <em>Note: your results for this analysis might change in the next release of ${project}.
                To save this exact result permanently, please download it.</em>
          </p>
          <c:if test="${empty viewModel.resultData}">
            <div class="go-empty-results">No analysis results found that met your parameter choices.</div>
          </c:if>
          <c:if test="${not empty viewModel.resultData}">
            <table class="word-table">
              <thead>
                <tr>
                  <c:set var="row" value="${viewModel.headerRow}"/>
                  <c:set var="desc" value="${viewModel.headerDescription}"/>
                  <th title="${desc.word}">${row.word}</th>
                  <th title="${desc.descrip}">${row.descrip}</th>
                  <th title="${desc.bgdGenes}">${row.bgdGenes}</th>
                  <th title="${desc.resultGenes}">${row.resultGenes}</th>
                  <th title="${desc.percentInResult}">${row.percentInResult}</th>
                  <th title="${desc.foldEnrich}">${row.foldEnrich}</th>
                  <th title="${desc.oddsRatio}">${row.oddsRatio}</th>
                  <th title="${desc.pvalue}">${row.pvalue}</th>
                  <th title="${desc.benjamini}">${row.benjamini}</th>
                  <th title="${desc.bonferroni}">${row.bonferroni}</th>
                </tr>
              </thead>
              <tbody>
                <c:forEach var="row" items="${viewModel.resultData}">
                  <tr>
                    <td>${row.word}</td>
                    <td>${row.descrip}</td>
                    <td class="word-centered">${row.bgdGenes}</td>
                    <td class="word-centered">${row.resultGenes}</td>
                    <td class="word-centered">${row.percentInResult}</td>
                    <td class="word-centered">${row.foldEnrich}</td>
                    <td class="word-centered">${row.oddsRatio}</td>
                    <td class="word-centered">${row.pvalue}</td>
                    <td class="word-centered">${row.benjamini}</td>
                    <td class="word-centered">${row.bonferroni}</td>
                  </tr>
                </c:forEach>
              </tbody>
            </table>
          </c:if>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
