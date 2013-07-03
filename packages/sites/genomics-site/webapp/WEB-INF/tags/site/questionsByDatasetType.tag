<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <c:set var="urlBase" value="${pageContext.request.contextPath}"/>

  <link rel="stylesheet" href="${urlBase}/wdkCustomization/css/dataset-searches.css"/>
  <div ng-app="dataset-searches" data-controller="dataset-searches"
    data-table="#dataset-records"
    data-table-toggle=".table-toggle"
    data-tabs-template="#dataset-tabs">

    <table id="dataset-records">
      <thead>
        <tr>
          <th class="wdk-tooltip" title="Organism data is aligned to">Organism</th>
          <th>Data set</th>
          <c:forEach items="${display_categories}" var="displayCategory">
            <!-- remove underscores and ucfirst -->
            <th class="skew">
              <!--<div><span>-->
                <c:forEach items="${fn:split(displayCategory, '_')}" var="displayCategoryPart">
                  ${fn:toUpperCase(fn:substring(displayCategoryPart, 0, 1))}${fn:substring(displayCategoryPart, 1, -1)}
                </c:forEach>
                <!--</span></div>-->
            </th>
          </c:forEach>
        </tr>
      </thead>
      <tbody>
      <c:forEach items="${questions_by_dataset_map}" var="questionsByDataset">
        <c:set var="datasetRecord" value="${questionsByDataset.key}"/>
        <c:set var="internalQuestions" value="${questionsByDataset.value}"/>

        <c:set var="organism" value="${datasetRecord.attributes['organism_prefix']}"/>
        <c:set var="short_attribution" value="${datasetRecord.attributes['short_attribution']}"/>
        <c:set var="dataset_id" value="${datasetRecord.attributes['dataset_id']}"/>
        <c:set var="dataset_name" value="${datasetRecord.attributes['display_name_piece']}"/>
        <c:set var="dataset_summary" value="${datasetRecord.attributes['summary']}"/>

        <c:if test="${dataset_summary eq ''}">
          <c:set var="dataset_summary" value="${datasetRecord.attributes['description']}"/>
        </c:if>

        <tr class="dataset" data-dataset-id="${dataset_id}">
          <td class="organism">${organism}</td>
          <td class="description">
            <span class="info wdk-tooltip" data-content=".tooltip-content">
              <span class="tooltip-content">${dataset_summary}</span>
            </span>
            ${dataset_name}
            (${short_attribution})
          </td>
          <c:forEach items="${display_categories}" var="displayCategory">
            <c:set var="question" value="${internalQuestions[displayCategory]}"/>
            <td class="search-mechanism">
              <c:if test="${question ne null}">
                <a class="question-link"
                  data-category="${displayCategory}"
                  href="showQuestion.do?questionFullName=${question.fullName}">
                  <span class="mag-glass"><jsp:text/></span>
                </a>
              </c:if>
            </td>
          </c:forEach>
        </tr>
      </c:forEach>
      </tbody>
    </table>
    <div class="table-toggle"> <jsp:text/> </div>

    <div id="question-wrapper"> <jsp:text/> </div>

    <script type="text/x-handlebars-template" id="dataset-tabs">
      <div class="tabs">
        <ul>
          {{#each questions}}
          <li><a href="{{url}}">{{category}}</a></li>
          {{/each}}
        </ul>
      </div>
    </script>

    <script type="text/x-handlebars-template" id="toggle">
      {{#if collapsed}}
      <span class="ui-icon ui-icon-arrowthickstop-1-s"><jsp:text/></span>
        <label>Show All Experiments</label>
      <span class="ui-icon ui-icon-arrowthickstop-1-s"><jsp:text/></span>
      {{else}}
      <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
        <label>Hide Other Experiments</label>
      <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
      {{/if}}
    </script>

  </div>

</jsp:root>
