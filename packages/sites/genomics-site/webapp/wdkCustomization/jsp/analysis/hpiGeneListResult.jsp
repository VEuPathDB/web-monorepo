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


          <c:if test="${empty viewModel.resultData}">
            <div class="enrich-empty-results">No Experiment was found for this threshold you specified.</div>
          </c:if>
          <c:if test="${not empty viewModel.resultData}">
            <table>
              <thead style="white-space:nowrap">
                <tr>
                  <c:set var="row" value="${viewModel.headerRow}"/>
                  <c:set var="desc" value="${viewModel.headerDescription}"/>

                  <th>${row.species}
                    <imp:image class="help-link" style="cursor:pointer" title="${desc.species}" src="wdk/images/question.png" />
                  </th>
                  <th title="${desc.experimentName}">${row.experimentName}
                    <imp:image class="help-link" style="cursor:pointer" title="${desc.description}" src="wdk/images/question.png" />
                  </th>
                  <th title="${desc.description}">${row.description}</th>
                  <th title="${desc.type}">${row.type}</th>
                  <th title="${desc.significance}">${row.significance}</th>
                </tr>
              </thead>
              <tbody>
                <c:forEach var="row" items="${viewModel.resultData}">
                  <tr>
                  <td>${row.species}</td>
                  <td><a href="${row.uri}" target="_blank">${row.experimentName}</a></td>
                  <td>${row.description}</td>
                  <td>${row.type}</td>
                  <!-- td><a href="${row.serverEndPoint}" target="_blank">${row.significance}</a></td -->
                  <td>${row.significance}</td>
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
