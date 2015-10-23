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
<!-- In a boolean step, when in the residual transcripts view (if defined in the model), 
     the step here is not a boolean, but a transform 
-->
<c:set var="recordClass" value="${step.answerValue.question.recordClass}"/>
<c:set var="genesMissingTranscriptsCount"
       value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}" />

<c:if test="${genesMissingTranscriptsCount gt 0}">
  <c:set var="missingNative" value="true"/>
  <c:set var="addTransformAction"
         value="eupathdb.transcripts.openTransform(${step.stepId}); return false;"/>
  <!-- if there are missing trasncripts the warning icon is shown in the tr-tab, in ANY step, while seeing results in ANY view 
       (a boolean step will show the icon TOO under YN/NY conditions, below)
  -->
  <script>
    if ($("i#tr-warning").length == 0){
        $( "li#transcript-view a span" ).append( $( "<i id='tr-warning' style='color: #0039FF;' title='Some ${recordClass.displayNamePlural} in your result have Transcripts with divergent function or characteristics.'  class='fa fa-lg fa-exclamation-circle'></i>" ) );
    }
  </script>
</c:if>

<c:if test="${view eq 'transcripts'}">
  <c:set var="showNativeCount" value="true"/>
</c:if>

<div id="${view}">

  <!-- leaf step, transcripts view warning -->
  <c:if test="${view eq 'transcripts' && !step.isBoolean && genesMissingTranscriptsCount gt 0}">
    <p style="text-align: center; margin: .4em 0;">
      <i style="color: #0039FF;" class="fa fa-lg fa-exclamation-circle"></i>
      <strong>
        Some ${recordClass.displayNamePlural}
        in your result have ${genesMissingTranscriptsCount} Transcripts with divergent function or characteristics. 
        <a href="#" onClick="${addTransformAction}"> Explore these.</a>
      </strong>
    </p>
  </c:if>

  <!-- boolean step, icon and transcripts view warning -->
  <c:if test="${step.isBoolean}"> 
    <c:set var="option" value="${step.filterOptions.filterOptions['gene_boolean_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>
    <style>
      .gene-boolean-filter,
      .gene-boolean-filter.ui-widget {
        text-align: center;
        display: none;
        margin-bottom: 4px;
      }
      .gene-boolean-filter-controls {
        display: none;
      }
      .gene-boolean-filter table {
        border-collapse: separate;
        color: black;
      }
      .gene-boolean-filter-summary {
        display: inline-block;
      }
    </style>

    <!-- YY/NY/YN table:  
         - a jsp/tag (geneBooleanFilter) will generate the table with correct display
         - the condition to show the icon in a boolean step requires this table's counts 
         - the icon is shown in the tr-tab while we see results in ANY view -->
    <div class="gene-boolean-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="gene_boolean_filter_array">
      <p style="text-align: center; margin: .4em 0;">
        <i style="color: #0039FF;" class="fa fa-lg fa-exclamation-circle"></i>
        <strong>
          Some Transcripts in your combined result were not returned by one of the two input searches.
          <a href="#" class="gene-boolean-filter-controls-toggle">Explore these.</a>
        </strong>
      </p>
      <div class="gene-boolean-filter-controls">
        <form action="applyFilter.do" name="apply-gene-boolean-filter">
          <input type="hidden" name="step" value="${step.stepId}"/>
          <input type="hidden" name="filter" value="gene_boolean_filter_array"/>
          <div class="gene-boolean-filter-summary">
            Loading filters...
          </div>
          <p style="text-align: center; margin: .4em 0;">
            <button class="gene-boolean-filter-apply-button" title="This will change the step results and therefore have an effect on the strategy.">Apply selection</button>
          </p>
        </form>
        <script type="application/json" class="gene-boolean-filter-values">
          ${values}
        </script>
      </div>
    </div>
  </c:if>   <!-- if boolean step  -->

  <c:if test="${view eq 'transcripts'}">
    <c:set var="checkToggleBox" value="${requestScope.representativeTranscriptOnly ? 'checked=\"checked\"' : '' }"/>
    <div style="text-align:right;font-size:120%;padding-bottom:5px">
      <input type="checkbox" ${checkToggleBox} data-stepid="${requestScope.wdkStep.stepId}" 
             onclick="javascript:toggleRepresentativeTranscripts(this)">
      Show Only One Transcript Per Gene
    </div>
  </c:if>

  <wdk:resultTable step="${step}" showNativeCount="${showNativeCount}" missingNative="${missingNative}"/>

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

