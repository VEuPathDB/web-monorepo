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

<c:set var="wdkAnswer" value="${step.answerValue}"/>
<c:set var="recordClass" value="${wdkAnswer.question.recordClass}"/>
<c:set var="genesMissingTranscriptsCount"
       value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}" />

<div>
  <c:if test="${genesMissingTranscriptsCount gt 0}">
    <c:set var="addTransformAction"
           value="eupathdb.transcripts.openTransform(${step.stepId}); return false;"/>

    <p style="text-align: center;">
      <i style="color: #0039FF;" class="fa fa-lg fa-exclamation-circle"></i>
      <strong>
        ${genesMissingTranscriptsCount}
        ${genesMissingTranscriptsCount eq 1 ? recordClass.displayName : recordClass.displayNamePlural}
        in your result have transcripts that did not match your search.
        To investigate, you may <a href="#" onClick="${addTransformAction}">add a transform</a>
        to the strategy based on the missing transcripts.
      </strong>
    </p>
  </c:if>

  <c:if test="${step.isBoolean}">
    <!-- selected values -->
    <c:set var="option" value="${step.filterOptions.filterOptions['gene_boolean_filter_array']}"/>
    <c:set var="values" value="${option.value}"/>

    <style>
      .gene-boolean-filter {
        text-align: center;
        display: none;
      }
      .gene-boolean-filter table {
        margin: 1em auto;
      }
      .gene-boolean-filter th, td {
        text-align: center;
      }
      .gene-boolean-filter tr > td:last-child {
        text-align: right;
      }
    </style>

    <div class="gene-boolean-filter"
      data-step="${step.stepId}"
      data-filter="gene_boolean_filter_array">
      <form action="applyFilter.do" name="apply-gene-boolean-filter">
        <input type="hidden" name="step" value="${step.stepId}"/>
        <input type="hidden" name="filter" value="gene_boolean_filter_array"/>
        <div class="gene-boolean-filter-summary">
          Loading filters...
        </div>
        <button>Apply filter</button>
      </form>
      <script type="application/json" class="gene-boolean-filter-values">
        ${values}
      </script>
    </div>
  </c:if>

  <wdk:resultTable step="${step}" />
</div>

<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:if test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
<script language="javascript">
  if (typeof customResultsPage === "function") {
    customResultsPage();
  }
</script>
</c:if>

