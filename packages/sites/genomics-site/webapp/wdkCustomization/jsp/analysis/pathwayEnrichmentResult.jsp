<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}"/>
  <html>
    <body>
      <div>
        <div style="position:relative">
          <imp:enrichResultTitle />

          <c:if test="${empty viewModel.resultData}">
            <div class="enrich-empty-results">No enrichment was found with significance at the P-value threshold you specified.</div>
          </c:if>
          <c:if test="${not empty viewModel.resultData}">
            <table class="enrich-table">
              <thead>
                <tr>
                  <c:set var="row" value="${viewModel.headerRow}"/>
                  <c:set var="desc" value="${viewModel.headerDescription}"/>
                  <th title="${desc.pathwayId}">${row.pathwayId}</th>
                  <th title="${desc.pathwayName}">${row.pathwayName}</th>
                  <th title="${desc.pathwaySource}">${row.pathwaySource}</th>
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
                    <td><a href="${viewModel.pathwayBaseUrl}${row.pathwaySource}/${row.pathwayId}" target="_blank">${row.pathwayId}</a></td>
                    <td>${row.pathwayName}</td>
                    <td>${row.pathwaySource}</td>
                    <td class="enrich-centered">${row.bgdGenes}</td>
                    <td class="enrich-centered">${row.resultGenes}</td>
                    <td class="enrich-centered">${row.percentInResult}</td>
                    <td class="enrich-centered">${row.foldEnrich}</td>
                    <td class="enrich-centered">${row.oddsRatio}</td>
                    <td class="enrich-centered">${row.pvalue}</td>
                    <td class="enrich-centered">${row.benjamini}</td>
                    <td class="enrich-centered">${row.bonferroni}</td>
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
