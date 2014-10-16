<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <c:set var="urlBase" value="${pageContext.request.contextPath}"/>
  <c:set var="wdkModel_" value="${wdkModel.model}"/>

  <c:set var="wdkStep" value="${requestScope.wdkStep}"/>
  <c:set var="action" value="${requestScope.action}"/>
  <c:choose>
    <c:when test="${wdkStep == null}">
      <c:set var="quesitonUrl" value=""/>
    </c:when>
    <c:otherwise>
      <c:url var="questionUrl" value="/wizard.do?stage=question&amp;action=${action}&amp;strategy=${wdkStrategy.strategyId}&amp;step=${wdkStep.stepId}&amp;questionFullName=${q.fullName}" />
    </c:otherwise>
  </c:choose>

  <imp:stylesheet rel="stylesheet" href="wdkCustomization/css/dataset-searches.css"/>
  <div class="dataset-searches"
    data-controller="eupathdb.datasetSearches.init"
    data-table="#dataset-records"
    data-table-toggle=".table-toggle"
    data-tabs-template="#dataset-tabs"
    data-call-wizard-url="${questionUrl}">

    <div class="legend ui-helper-clearfix">
      <div>Legend:</div>
      <ul>
        <c:forEach items="${display_categories}" var="displayCategory">
          <li class="wdk-tooltip" data-content=".tooltip-content">
            <span class="search-mechanism btn btn-cyan btn-active">
              ${displayCategory['shortDisplayName']}
            </span>
            <span>${displayCategory['displayName']}</span>
            <div class="tooltip-content">
              <h4>${displayCategory['displayName']}</h4>
              ${displayCategory['description']}
            </div>
          </li>
        </c:forEach>
      </ul>
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
          <th colspan="${fn:length(display_categories)}" class="searches">Choose a search</th>
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
        <c:set var="build_number_introduced" value="${datasetRecord.attributes['build_number_introduced']}"/>
        <c:set var="publications" value="${datasetRecord.tables['Publications']}" />

        <tr class="dataset" data-dataset-id="${dataset_id}">
          <td class="organism">${organism}</td>
          <td class="description">
            <div>
              ${dataset_name}
              (${short_attribution})
              <c:if test="${build_number_introduced eq wdkModel_.buildNumber}">
                <imp:image alt="New feature icon" title="This is a new data set!"
                  src="wdk/images/new-feature.png"/>
              </c:if>
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
          <td>
            <c:choose>
              <c:when test="${dataset_summary eq ''}">${dataset_description}</c:when>
              <c:otherwise>${dataset_summary}</c:otherwise>
            </c:choose>
          </td>
          <c:forEach items="${display_categories}" var="displayCategory">
            <c:set var="question" value="${internalQuestions[displayCategory['name']]}"/>
            <td class="search-mechanism">
              <c:if test="${question ne null}">
                <a class="wdk-tooltip question-link btn btn-cyan"
                  data-adjust-y="5"
                  data-category="${displayCategory['displayName']}"
                  data-full-name="${question.fullName}"
                  title="${displayCategory['description']}"
                  href="showQuestion.do?questionFullName=${question.fullName}">
                  ${displayCategory['shortDisplayName']}</a>
              </c:if>
            </td>
          </c:forEach>
        </tr>
      </c:forEach>
      </tbody>
    </table>
    <div class="table-toggle"> <jsp:text/> </div>

    <div id="question-wrapper"> <jsp:text/> </div>

    <script type="text/x-jst" id="dataset-tabs">
    <![CDATA[
      <div id="question-set-{{datasetId}}" class="tabs">
        <ul>
          <% _.forEach(questions, function(question) { %>
            <li><a href="<%- question.url %>"><%- question.category %><span></span></a></li>
          <% }); %>
        </ul>
      </div>
    ]]>
    </script>

    <script type="text/x-jst" id="toggle">
    <![CDATA[
      <% if (collapsed) { %>
        <span class="ui-icon ui-icon-arrowthickstop-1-s"><jsp:text/></span>
          <label>Show All Data Sets</label>
        <span class="ui-icon ui-icon-arrowthickstop-1-s"><jsp:text/></span>
      <% } else { %>
        <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
          <label>Hide Other Data Sets</label>
        <span class="ui-icon ui-icon-arrowthickstop-1-n"><jsp:text/></span>
      <% } %>
    ]]>
    </script>

  </div>

</jsp:root>
