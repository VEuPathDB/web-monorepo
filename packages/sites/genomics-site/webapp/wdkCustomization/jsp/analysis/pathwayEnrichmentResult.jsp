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
            .pathway-result-p {
              margin: 5px;
              text-align: center;
            }
            /*
            .pathway-table {
              margin-top: 5px;
            }
            */
            .pathway-table th {
              text-align:left;
            }
            .pathway-table td {
              text-align: left;
            }
            .pathway-table td.pathway-centered {
              text-align: center;
            }
            .pathway-databar {
              border:0; margin:0; padding:0;
              display: inline-block;
              height: 1em;
              background-color: lightgreen;
            }
            .pathway-download-link {
              position: absolute;
              top: 0px;
              right: 0px;
              font-weight: bold;
            }
          </style>
          <span class="pathway-download-link">
            <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
            <a href="${downloadUrl}">Download Analysis Results</a>
          </span>
          <h2 style="text-align:center">Enriched Pathways</h2>
          <p class="pathway-result-p">
            <em>Note: your results for this analysis might change in the next release of ${project}.
                To save this exact result permanently, please download it.</em>
          </p>
          <table class="pathway-table">
            <thead>
              <tr>
                <c:set var="row" value="${viewModel.headerRow}"/>
                <c:set var="desc" value="${viewModel.headerDescription}"/>
                <th title="${desc.pathwayId}">${row.pathwayId}</th>
                <th title="${desc.pathwayName}">${row.pathwayName}</th>
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
                  <td><a href="${viewModel.pathwayBaseUrl}${row.pathwayId}" target="_blank">${row.pathwayId}</a></td>
                  <td>${row.pathwayName}</td>
                  <td class="pathway-centered">${row.bgdGenes}</td>
                  <td class="pathway-centered">${row.resultGenes}</td>
                  <td class="pathway-centered">${row.percentInResult}</td>
                  <td class="pathway-centered">${row.foldEnrich}</td>
                  <td class="pathway-centered">${row.oddsRatio}</td>
                  <td class="pathway-centered">${row.pvalue}</td>
                  <td class="pathway-centered">${row.benjamini}</td>
                  <td class="pathway-centered">${row.bonferroni}</td>
                </tr>
              </c:forEach>
            </tbody>
          </table>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
