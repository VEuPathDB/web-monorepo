<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <c:set var="urlBase" value="${pageContext.request.contextPath}"/>

  <link rel="stylesheet" href="${urlBase}/wdkCustomization/css/dataset-searches.css"/>
  <div data-controller="dataset-searches"
    data-table="#dataset-records"
    data-table-toggle=".table-toggle"
    data-tabs-template="#dataset-tabs">

    <div class="legend ui-helper-clearfix">
      <div>Legend:</div>
      <c:forEach items="${display_categories}" var="displayCategory">
        <div>
          <span class="search-mechanism btn btn-active">
            <c:choose>
              <c:when test="${displayCategory eq 'fold_change_with_pvalue'}">FCpV</c:when>
              <c:otherwise>
                <c:forEach items="${fn:split(displayCategory, '_')}" var="part">${fn:toUpperCase(fn:substring(part, 0, 1))}</c:forEach>
              </c:otherwise>
            </c:choose>
          </span>
          <span>${fn:replace(displayCategory, '_', ' ')}</span>
        </div>
      </c:forEach>
    </div>

    <table id="dataset-records" width="100%">
      <thead>
        <tr>
          <th rowspan="2" class="wdk-tooltip" title="Organism data is aligned to">Organism</th>
          <th rowspan="2">Data Set</th>
          <th rowspan="2">Summary</th>
          <c:forEach items="${display_categories}" var="displayCategory">
            <th class="search-head"><jsp:text/></th>
          </c:forEach>
        </tr>
        <tr>
          <th colspan="${fn:length(display_categories)}">Choose a search</th>
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
        <c:set var="dataset_description" value="${datasetRecord.attributes['description']}"/>
        <c:set var="publications" value="${datasetRecord.tables['Publications']}" />

        <tr class="dataset" data-dataset-id="${dataset_id}">
          <td class="organism">${organism}</td>
          <td class="description">
            <div>
              ${dataset_name}
              (${short_attribution})
              <span class="info wdk-tooltip" data-content="+ .dataset-tooltip-content"><jsp:text/></span>
              <div class="dataset-tooltip-content">
                <h4>Summary</h4>
                <div>
                  <c:choose>
                    <c:when test="${dataset_summary eq ''}">${dataset_description}</c:when>
                    <c:otherwise>${dataset_summary}</c:otherwise>
                  </c:choose>
                </div>
                <c:if test="${fn:length(publications) > 0}">
                  <br/>
                  <h4>Publications</h4>
                  <ul>
                    <c:forEach items="${publications}" var="publication">
                      <li><a target="_blank" href="${publication['pubmed_link'].url}">${publication['pubmed_link'].displayText}</a></li>
                    </c:forEach>
                  </ul>
                </c:if>
              </div>
            </div>
          </td>
          <td>${dataset_summary} <br/> ${dataset_description}</td>
          <c:forEach items="${display_categories}" var="displayCategory">
            <c:set var="question" value="${internalQuestions[displayCategory]}"/>
            <td class="search-mechanism">
              <c:if test="${question ne null}">
                <a class="wdk-tooltip question-link btn"
                  data-category="${displayCategory}"
                  title="Search this data set by ${fn:replace(displayCategory, '_', ' ')}"
                  href="showQuestion.do?questionFullName=${question.fullName}">
                  <c:choose>
                    <c:when test="${displayCategory eq 'fold_change_with_pvalue'}">FCpV</c:when>
                    <c:otherwise>
                      <c:forEach items="${fn:split(displayCategory, '_')}" var="part">${fn:toUpperCase(fn:substring(part, 0, 1))}</c:forEach>
                    </c:otherwise>
                  </c:choose>
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
      <div id="question-set-{{datasetId}}" class="tabs">
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
        <label>Show All Data Sets</label>
      <span class="ui-icon ui-icon-arrowthickstop-1-s"><jsp:text/></span>
      {{else}}
      <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
        <label>Hide Other Data Sets</label>
      <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
      {{/if}}
    </script>

  </div>

</jsp:root>
