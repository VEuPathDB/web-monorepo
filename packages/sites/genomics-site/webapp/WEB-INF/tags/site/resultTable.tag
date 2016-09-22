<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step bean we are looking at"
%>
<%@ attribute name="view"
              type="java.lang.String"
              required="false"
              description="tab we are looking at"
%>

<c:set var="wdkAnswer" value="${step.answerValue}"/>
<c:set var="recordClass" value="${step.answerValue.question.recordClass}"/>
<c:set var="questionName" value="${step.answerValue.question.name}"/>
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<c:set var="warningIcon">
  <i class="fa fa-exclamation-circle fa-2x" aria-hidden="true" style="color:blue" title="Some Genes in your result have Transcripts that did not meet the search criteria."></i>
</c:set>

<c:if test="${fn:contains(recordClass.name,'Transcript')}"> 
  <c:set var="trRecord" value="true"/>
  <c:set var="showViewFilter" value="${step.answerValue.resultSize != step.answerValue.displayResultSize}"/>
  <c:set var="genesMissingTranscriptsCount" 
         value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}" />
</c:if>

<!-- a transcript step could be single or combined:
       single:   will show icon/sentence if there are missing transcripts (N <> 0)
       combined: will show the icon/sentence if either YN,NY,NN <> 0
       exceptions: basket result step:       do not show anything
                   span logic combined step: do not show anything
-->


<!-- ANY TAB, ANY STEP, ANY RECORD -->
<div id="${view}">

<!-- ===================================================== -->
  <!-- if LEAF step, if this is a Transcript Record and NOT a basket result:
         generate transcripts counts, to decide if the warningIcon and Explore sentence is needed.
       In MatchedTranscriptFilter.defaultValue(), accessed by every newly created step,
         defaultValue() will be null for the leaf steps outside the condition 
  -->
  <c:if test="${!step.isCombined && trRecord eq 'true' && !fn:containsIgnoreCase(questionName, 'basket') }"> 
    <c:set var="option" value="${step.filterOptions.filterOptions['matched_transcript_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>

    <!-- Y/N table:  
         - a jsp/tag (matchesResultFilter.tag) will generate the table with correct display
         - the condition to show the warningIcon/sentence in a step requires the N count 
    --> 
    <div class="gene-leaf-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="matched_transcript_filter_array">
      ${warningIcon}
      <strong title="Click on 'Add Columns' to add columns with transcript counts (under 'Gene Models)'.">
        <span>Some Genes in your result have Transcripts that did not meet the search criteria
          <c:if test="${ fn:contains(values, 'N') }">
            <img height="14px" src="wdk/images/filter-short.png" title="Your transcript selection in this step is different from the original selection (only transcripts that met the search criteria).">
          </c:if>
        .</span>
        <a href="#" class="gene-leaf-filter-controls-toggle">Explore.</a>
      </strong>
 
      <div class="gene-leaf-filter-controls">
        <form action="applyFilter.do" name="apply-gene-leaf-filter">
          <input type="hidden" name="step" value="${step.stepId}"/>
          <input type="hidden" name="filter" value="matched_transcript_filter_array"/>
          <div class="gene-leaf-filter-summary">
            Loading filters...
          </div>
          <p>
            <button disabled="yes" class="gene-leaf-filter-apply-button" title="To enable this button, select/unselect transcript sets.">Apply selection</button>
          </p>
        </form>

      <%-- DEBUG    ${values } contains a json string, eg: {"values":["Y","N"]}  
        <p id="trSelection">(Your initial selection was ${values})<br>(Your current selection is <span>${values}</span>)</p> 
       --%>
        <script type="application/json" class="gene-leaf-filter-values">
          ${values}
        </script>
      </div>
    </div>
  </c:if>  
 
<!-- ===================================================== -->
  <!-- if BOOLEAN step (spanlogic does not need filter for now): if this is a Transcript Record:
         generate transcripts counts, to later (js) decide if the warningIcon/ Explore sentence is needed -->
  <c:if test="${step.isBoolean && trRecord eq 'true'}"> 
    <c:set var="option" value="${step.filterOptions.filterOptions['gene_boolean_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>

    <!-- YY/NY/YN table:  
         - a jsp/tag (geneBooleanFilter.tag) will generate the table with correct display
         - the condition to show the icon/sentence in a boolean step requires this table's counts 
    -->
    <div class="gene-boolean-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="gene_boolean_filter_array">
      ${warningIcon}
      <strong title=""Click on 'Add Columns' to add 2 columns (at the top) that show if a transcript matched the previous and/or the latest search.">
        <span>Some Genes in your combined result have Transcripts that were not returned by one or both of the two input searches</span>
          <c:if test="${ fn:contains(values, 'NN') || !fn:contains(values, 'YY') || !fn:contains(values, 'YN') || !fn:contains(values, 'NY') }">
            <img height="14px" src="wdk/images/filter-short.png" title="Your transcript selection in this step is different from the original selection (transcripts that met the search criteria in either input step).">
          </c:if>
        .</span>
        <a href="#" class="gene-boolean-filter-controls-toggle">Explore.</a>
      </strong>

      <div class="gene-boolean-filter-controls">
        <form action="applyFilter.do" name="apply-gene-boolean-filter">
          <input type="hidden" name="step" value="${step.stepId}"/>
          <input type="hidden" name="filter" value="gene_boolean_filter_array"/>
          <div class="gene-boolean-filter-summary">
            Loading filters...
          </div>
          <p>
            <button disabled="yes" class="gene-boolean-filter-apply-button" title="To enable this button, select/unselect transcript sets.">Apply selection</button>
          </p>
        </form>

        <!-- DEBUG
        <p id="trSelection">(Your initial selection was ${values})<br>(Your current selection is <span>${values}</span>)</p> 
        -->
        <script type="application/json" class="gene-boolean-filter-values">
          ${values}
        </script>
      </div>
    </div>
  </c:if>  
    
<!-- ===================================================== -->                 
  <!-- if TRANSCRIPT VIEW, if Transcript count <> Gene count, we show the representative transcript filter -->
  <c:set var="checkToggleBox" value="${requestScope.representativeTranscriptOnly ? 'checked=\"checked\"' : '' }"/>
  <c:if test="${view eq 'transcripts' && showViewFilter eq 'true' }"> 
    <div id="oneTr-filter" title="Some genes in this result have more than one transcript that matched. Click on this option to display only one of those transcripts (the longest) per gene.  The other transcripts are still part of your result, but will be hidden, for readability.">
      <!-- icon only when checked -->
      <!-- <span id="filter-icon"><img src="${baseUrl}/images/warningIcon2.png" style="width:20px;vertical-align:sub" ></span>  -->
      <span id="gene-count">
        ${wdkAnswer.displayResultSize eq 1 ? step.recordClass.displayName : step.recordClass.displayNamePlural}:
        <span>${wdkAnswer.displayResultSize}</span>
      </span>
      <span id="transcript-count">
        ${wdkAnswer.resultSize eq 1 ? wdkAnswer.question.recordClass.nativeDisplayName : wdkAnswer.question.recordClass.nativeDisplayNamePlural}:
        <span>${wdkAnswer.resultSize}</span>
      </span>
      <input type="checkbox" ${checkToggleBox} data-stepid="${requestScope.wdkStep.stepId}" 
             onclick="javascript:toggleRepresentativeTranscripts(this)">
      <span id="prompt">Show Only One Transcript Per Gene</span> 
    </div>
  </c:if>

<!-- ===================================================== -->   
  <!-- ANY TAB, ANY STEP, ANY RECORD -->
  <wdk:resultTable step="${step}" excludeBasketColumn="${excludeBasketColumn}" feature__newDownloadPage="${true}"/>

</div>  <!--  end div ${view} -->

<!-- ===================================================== -->   

<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:if test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
  <script language="javascript">
    if (typeof customResultsPage === "function") {
      customResultsPage();
    }
  </script>
</c:if>

