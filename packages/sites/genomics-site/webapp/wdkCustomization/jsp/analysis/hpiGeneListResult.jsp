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
                    <imp:helpIcon helpContent="${desc.species}" />
                  </th>
                  <th>${row.experimentName}
                    <imp:helpIcon helpContent="${desc.experimentName}" />
                  </th>
                  <th>${row.description}
                    <imp:helpIcon helpContent="${desc.description}"/>
                  </th>
                  <th>${row.type}
                    <imp:helpIcon helpContent="${desc.type}"/>
                  </th>
                  <th>${row.t11}
                    <imp:helpIcon helpContent="${desc.t11}"/>
                  </th>
                  <th>${row.t12}
                    <imp:helpIcon helpContent="${desc.t12}"/>
                  </th>
                  <th>${row.t33}
                    <imp:helpIcon helpContent="${desc.t33}"/>
                  </th>
                  <th>${row.t21}
                    <imp:helpIcon helpContent="${desc.t21}"/>
                  </th>
                  <th>${row.t22}
                    <imp:helpIcon helpContent="${desc.t22}"/>
                  </th>
                  <th>${row.significance}
                    <imp:helpIcon helpContent="${desc.significance}"/>
                  </th>
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
                  <td>${row.t11}</td>
                  <td>${row.t12}</td>
                  <td>${row.t33}</td>
                  <td>${row.t21}</td>
                  <td>${row.t22}</td>
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
