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

<c:set var="recordClass" value="${step.answerValue.question.recordClass}"/>
<c:set var="questionName" value="${step.answerValue.question.name}"/>
<c:if test="${fn:contains(recordClass.name,'Transcript')}"> 
  <c:set var="trRecord" value="true"/>
</c:if>

<%-- we are not setting this value correctly any longer (LEAF STEP)
<c:set var="genesMissingTranscriptsCount"
       value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}" />
<c:if test="${genesMissingTranscriptsCount gt 0 && !step.isBoolean }">
  <c:set var="missingNative" value="true"/>   
  <script>
    if ($("i#tr-warning").length == 0){    
      $( "li#transcript-view a span" ).append( $( "<i id='tr-warning'><img src='/a/images/warningIcon2.png' style='width:16px;vertical-align:top' title='Some Genes in your result have Transcripts that did not meet the search criteria.' ></i>") );
    }
  </script>
</c:if>
--%>

<!-- step could be single or combined:
     single: will show icon in the tr-tab if there are missing trasncripts (N <> 0)
     combined: will show the icon in the tr-tab if either YN,NY,NN <> 0
     exceptions: basket result step:       do not show anything
                 span logic combined step: do not show anything
-->

<!-- ANY TAB, ANY STEP -->
<div id="${view}">

<!-- if LEAF step, if this is a Transcript Record and NOT a basket result:
         generate transcripts counts, to later (js) decide if the tab icon/warning sentence are needed
-->
<!-- THIS condition is used too in MatchedTranscriptFilter.defaultValue(), accessed by every newly created step.
       defaultValue() will be null for the leaf steps outside the condition 
-->
  <c:if test="${!step.isCombined && trRecord eq 'true' && !fn:containsIgnoreCase(questionName, 'basket') }"> 
    <c:set var="option" value="${step.filterOptions.filterOptions['matched_transcript_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>

    <!-- Y/N table:  
         - a jsp/tag (matchesResultFilter) will generate the table with correct display
         - the condition to show the icon and table in a step requires the N count 
         - the icon is shown in the tr-tab, independently of what tab is opened (gene view or tr view)
    -->
    <div class="gene-leaf-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="matched_transcript_filter_array">
      <p style="text-align: center; margin: .4em 0;">
        <img src='/a/images/warningIcon2.png' style='width:20px;vertical-align:sub' title='Some Genes in your result have Transcripts that did not meet the search criteria.' >
        <strong>
          Some Genes in your result have Transcripts that did not meet the search criteria.
          <a href="#" class="gene-leaf-filter-controls-toggle">Explore.</a>
        </strong>
      </p>
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

        <!-- DEBUG
        <p id="trSelection">(Your initial selection was ${values})<br>(Your current selection is <span>${values}</span>)</p> 
        -->
        <script type="application/json" class="gene-leaf-filter-values">
          ${values}
        </script>
      </div>
    </div>
  </c:if>  


<!-- if boolean step (spanlogic does not need filter for now): if this is a Transcript Record:
         generate transcripts counts, to later (js) decide if the tab icon/warning sentence are needed -->
  <c:if test="${step.isBoolean && trRecord eq 'true'}"> 
    <c:set var="option" value="${step.filterOptions.filterOptions['gene_boolean_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>

    <!-- YY/NY/YN table:  
         - a jsp/tag (geneBooleanFilter) will generate the table with correct display
         - the condition to show the icon and table in a boolean step requires this table's counts 
         - the icon is shown in the tr-tab, independently of what tab is opened (gene view or tr view)
    -->
    <div class="gene-boolean-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="gene_boolean_filter_array">
      <p style="text-align: center; margin: .4em 0;">
        <img src='/a/images/warningIcon2.png' style='width:20px;vertical-align:sub' title='Some Genes in your combined result have Transcripts that were not returned by one or both of the two input searches.' >
        <strong>
          Some Genes in your combined result have Transcripts that were not returned by one or both of the two input searches.
          <a href="#" class="gene-boolean-filter-controls-toggle">Explore.</a>
        </strong>
      </p>
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
 

<!-- if TRANSCRIPT VIEW -->
  <c:if test="${view eq 'transcripts'}">
    <c:set var="checkToggleBox" value="${requestScope.representativeTranscriptOnly ? 'checked=\"checked\"' : '' }"/>
    <div style="text-align:right;font-size:120%;padding-bottom:5px">
      <input style="transform:scale(1.5);margin:0 10px 0;" type="checkbox" ${checkToggleBox} data-stepid="${requestScope.wdkStep.stepId}" 
             onclick="javascript:toggleRepresentativeTranscripts(this)">
      Show Only One Transcript Per Gene
    </div>
    <c:set var="excludeBasketColumn" value="true" />
  </c:if>


<!-- ANY STEP, ANY VIEW -->
  <wdk:resultTable step="${step}" excludeBasketColumn="${excludeBasketColumn}"/>

</div>  <!--  end div ${view} -->

<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:if test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
  <script language="javascript">
    if (typeof customResultsPage === "function") {
      customResultsPage();
    }
  </script>
</c:if>

