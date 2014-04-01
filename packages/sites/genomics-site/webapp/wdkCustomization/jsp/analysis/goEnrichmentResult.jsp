<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <div style="text-align:center">
        <div style="display:inline-block; text-align:center">
          <style>
            .go-table {
              margin-top: 5px;
            }
            .go-table th, .go-table td {
              text-align: left;
            }
            .go-databar {
              border:0; margin:0; padding:0;
              display: inline-block;
              height: 1em;
              background-color: lightgreen;
            }
          </style>
          <h2 style="text-align:center">GO Enriched Terms</h2>
          <p>
            <em>GO Enriched terms from ${viewModel.goSources} with P-Value
            Cutoff value ${viewModel.pvalueCutoff}.</em>
          </p>
          <p>
            <c:url var="downloadUrl" value="/stepAnalysisResource.do?analysisId=${analysisId}&amp;path=${viewModel.downloadPath}"/>
            <a href="${downloadUrl}">Download as Excel Spreadsheet</a>
          </p>
          <table class="go-table">
            <tr>
              <th>GO Term</th>
              <th colspan="2">Enrichment Value</th>
            </tr>
            <c:forEach var="row" items="${viewModel.resultData}">
              <tr>
                <td>${row.name}</td>
                <td>${row.value}%</td>
                <td><div class="go-databar" style="width:${row.value * 2}px;"><jsp:text/></div></td>
              </tr>
            </c:forEach>
          </table>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
