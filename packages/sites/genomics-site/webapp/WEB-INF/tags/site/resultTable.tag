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

<!-- in the residual transcripts view the step is a transform -->
<c:set var="genesMissingTranscriptsCount"
       value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}" />

<c:if test="${genesMissingTranscriptsCount gt 0}">
  <c:set var="missingNative" value="true"/>
  <c:set var="addTransformAction"
         value="eupathdb.transcripts.openTransform(${step.stepId}); return false;"/>
</c:if>

<c:if test="${view eq 'transcripts'}">
  <c:set var="showNativeCount" value="true"/>
</c:if>

<div id="${view}">

  <c:if test="${view eq 'missing-transcripts'}">
    <p style="text-align: center; margin: .4em 0;">
      <strong>This tab shows ${genesMissingTranscriptsCount} <i>residual transcripts</i>. These are transcripts from genes in your result that were <i>not returned by the step</i>.  <a href="#" onClick="${addTransformAction}">Advanced options</a>
      </strong>
    </p>
  </c:if>

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
/*
      .gene-boolean-filter h3 {
        font-size: 100%;
      }
*/
      .gene-boolean-filter table {
    /*    margin: auto;
        border-spacing: 0 4px;  */
        border-collapse: separate;
        color: black;
     /*   border: 1px solid grey;
        padding: 6px; */
      }
/*
      .gene-boolean-filter th, .gene-boolean-filter td {
        text-align: center;
        font-weight: bold;
      }
      .gene-boolean-filter tr > td {
        border: 1px solid rgb(189, 189, 189);
        background: rgb(237, 237, 237);
      }
      .gene-boolean-filter tr > td:first-child {
        border: none;
        background: none;
      }
*/
      .gene-boolean-filter-summary {
        display: inline-block;
      }
/*
      .gene-boolean-filter-apply-button {
        position: relative;
        top: -1em;
        left: 2em;
      }
*/
    </style>

    <!-- YY/NY/YN table:  a jsp/tag file with name geneBooleanFilter will generate the table -->
    <div class="gene-boolean-filter ui-helper-clearfix"
         data-step="${step.stepId}"
         data-filter="gene_boolean_filter_array">
      <p style="text-align: center; margin: .4em 0;">
        <i style="color: #0039FF;" class="fa fa-lg fa-exclamation-circle"></i>
        <strong>
          Some transcripts in your combined result were not returned by one of the two input searches.
          <a href="#" class="gene-boolean-filter-controls-toggle">Please explore.</a>
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
  </c:if>   <!-- if boolean step && YN/NY ne 0 -->

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

