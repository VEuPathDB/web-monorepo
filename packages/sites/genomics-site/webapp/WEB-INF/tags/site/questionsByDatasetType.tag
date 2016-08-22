<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:useBean id="websiteRelease" class="org.eupathdb.common.controller.WebsiteReleaseConstants"/>

  <c:set var="debug" value="${requestScope.WEBSITE_RELEASE_STAGE le websiteRelease.qa}"/>
  <c:set var="urlBase" value="${pageContext.request.contextPath}"/>
  <c:set var="wdkModel_" value="${wdkModel.model}"/>

  <c:set var="wdkStep" value="${requestScope.wdkStep}"/>
  <c:set var="action" value="${requestScope.action}"/>
  <c:choose>
    <c:when test="${wdkStep == null}">
      <c:set var="questionUrl" value=""/>
    </c:when>
    <c:otherwise>
      <c:url var="questionUrl" value="/wizard.do?stage=question&amp;action=${action}&amp;strategy=${wdkStrategy.strategyId}&amp;step=${wdkStep.stepId}&amp;questionFullName=${q.fullName}" />
    </c:otherwise>
  </c:choose>

  <c:if test="${fn:length(uncategorized_questions_by_dataset_map) gt 0}">
    <div class="ui-widget ui-state-error">
      <p><strong>The following questions are not categorized, or are in multiple categories.
      Any related categories are shown in parentheses next to the question name.</strong></p>
      <table>
        <thead>
          <tr><th>Dataset</th><th>Questions</th></tr>
        </thead>
        <tbody>
          <c:forEach items="${uncategorized_questions_by_dataset_map}" var="questionsByDataset">
            <tr>
              <c:set var="datasetRecord" value="${questionsByDataset.key}"/>
              <c:set var="internalQuestions" value="${questionsByDataset.value}"/>
              <td>${datasetRecord.attributes['display_name']}</td>
              <td>
                <ul>
                  <c:forEach items="${internalQuestions}" var="question">
                    ${question}
                    <li>
                      <a href="showQuestion.do?questionFullName=${question.fullName}"
                        target="_blank">${question.fullName}</a>
                      <c:if test="${fn:length(question.datasetCategories) gt 0}">
                        (<c:forEach items="${question.datasetCategories}" var="category" varStatus="loop">
                          ${category.displayName}
                          <c:if test="${!loop.last}">,</c:if>
                        </c:forEach>)
                      </c:if>
                    </li>
                  </c:forEach>
                </ul>
              </td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </div>
  </c:if>


<!-- SET in CUSTOMSHOWQUESTIONACTION
questions_by_dataset_map (questionsByDataset in action)
uncategorized_questions_by_dataset_map (uncatQuestionsMap in action)
display_categories  (fold change, percentile etc) (displayCategorySet in action)
-->

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
        <c:set var="internalQuestionsMap" value="${questionsByDataset.value}"/>

        <c:set var="organism" value="${datasetRecord.attributes['organism_prefix']}"/>
        <c:set var="short_attribution" value="${datasetRecord.attributes['short_attribution']}"/>
        <c:set var="dataset_id" value="${datasetRecord.attributes['dataset_id']}"/>
        <c:set var="dataset_name" value="${datasetRecord.attributes['display_name']}"/>
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
          <c:set var="tabIndex" value="0"/>
          <c:forEach items="${display_categories}" var="displayCategory">
            <c:set var="questions" value="${internalQuestionsMap[displayCategory['name']]}"/>
            <td class="search-mechanism">
              <c:if test="${questions ne null}">
                <c:set var="fullNames" value=""/>
                <c:forEach items="${questions}" var="question">
                  <c:set var="fullNames" value="${fullNames} ${question.fullName}"/>
                </c:forEach>
                <a class="wdk-tooltip question-link btn btn-cyan"
                  data-adjust-y="5"
                  data-category="${displayCategory['displayName']}"
                  data-full-names="${fullNames}"
                  data-tab-index="${tabIndex}"
                  title="${displayCategory['description']}"
                  href="showQuestion.do?questionFullName=${questions[0].fullName}">
                  ${displayCategory['shortDisplayName']}</a>
                <c:set var="tabIndex" value="${tabIndex + fn:length(questions)}"/>
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
      <div id="question-set-<%- datasetId %>" class="tabs">
        <ul>
          <% _.forEach(questions, function(question) { %>
          <li question-fullname="<%- question.fullName %>">
            <a href="<%- question.url %>"><%- question.category %><span></span></a>
          </li>
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
