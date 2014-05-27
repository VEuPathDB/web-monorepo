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
        <div>
          <style>
            .go-result-p {
              margin: 5px;
              text-align: center;
            }
            /*
            .go-table {
              margin-top: 5px;
            }
            */
            .go-table th {
              text-align:left;
            }
            .go-table td {
              text-align: left;
            }
            .go-table td.go-centered {
              text-align: center;
            }
            .go-databar {
              border:0; margin:0; padding:0;
              display: inline-block;
              height: 1em;
              background-color: lightgreen;
            }
          </style>
          <h2 style="text-align:center">Enriched GO Terms</h2>
          <p class="go-result-p">
            <em>Note: your results for this analysis might change in the next release of ${project}.
                To save this exact result permanently, please download it.</em>
            <!--
            <em>GO Enriched terms from ${viewModel.goSources} (sources) and ${viewModel.goOntologies} (ontologies) with P-Value
            Cutoff value ${viewModel.pvalueCutoff}.</em>
            -->
          </p>
          <p class="go-result-p">
            <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
            <a href="${downloadUrl}">Download as tab-delimited file</a>
          </p>
          <table class="go-table">
            <thead>
              <tr>
                <c:set var="row" value="${viewModel.headerRow}"/>
                <c:set var="desc" value="${viewModel.headerDescription}"/>
                <th title="${desc.goId}">${row.goId}</th>
                <th title="${desc.goTerm}">${row.goTerm}</th>
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
                  <td>${row.goId}</td>
                  <td>${row.goTerm}</td>
                  <td class="go-centered">${row.bgdGenes}</td>
                  <td class="go-centered">${row.resultGenes}</td>
                  <td class="go-centered">${row.percentInResult}</td>
                  <td class="go-centered">${row.foldEnrich}</td>
                  <td class="go-centered">${row.oddsRatio}</td>
                  <td class="go-centered">${row.pvalue}</td>
                  <td class="go-centered">${row.benjamini}</td>
                  <td class="go-centered">${row.bonferroni}</td>
                </tr>
              </c:forEach>
            </tbody>
          </table>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
