<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step bean we are looking at"
%>

<c:set var="wdkAnswer" value="${step.answerValue}"/>
<c:set
  var="missingTranscriptsCount"
  value="${step.answerValue.resultProperties['genesMissingTranscriptsCount']}"
/>

<div>
  <%-- FIXME Remove hardcoded flag --%>
  <c:if test="${missingTranscriptsCount gt 0 or wdkAnswer.params['Exon Count >='] eq '5'}">
  <p style="text-align: center;">
    <i style="color: #0039FF;" class="fa fa-lg fa-exclamation-circle wdk-tooltip" title="# missing transcripts: ${missingTranscriptsCount}"></i>
    <strong>Some Genes in your result have transcripts that did not match your search.</strong>
  </p>
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

