<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="question" value="${requestScope.wdkQuestion}"/>
<c:set var="importStep" value="${requestScope.importStep}"/>
<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="action" value="${requestScope.action}"/>
<c:set var="allowChooseOutput" value="${requestScope.allowChooseOutput}"/>

<c:set var="pMap" value="${question.paramsMap}"/>
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/wizard.do"  onsubmit="callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">
<c:if test="${action == 'revise'}">
  <c:set var="spanStep" value="${wdkStep}"/>
  <c:set var="wdkStep" value="${wdkStep.previousStep}"/>
</c:if>
<h2 style="text-align:center;">Combine Step <span class="current_step_num"></span> and Step <span class="new_step_num"></span></h2>

<jsp:useBean id="typeMap" class="java.util.HashMap"/>
<c:set target="${typeMap}" property="singular" value="${importStep.displayType}"/>
<wdk:getPlural pluralMap="${typeMap}"/>
<c:set var="newPluralType" value="${typeMap['plural']}"/>

<c:set target="${typeMap}" property="singular" value="${wdkStep.displayType}"/>
<wdk:getPlural pluralMap="${typeMap}"/>
<c:set var="oldPluralType" value="${typeMap['plural']}"/>

<div class="instructions" style="">Your ${newPluralType} search (Step <span class="new_step_num"></span>) returned ${importStep.resultSize} ${newPluralType}.  Use this page to combine them with the ${oldPluralType} in your previous result (Step <span class="current_step_num"></span>).</div>
<span style="display:none" id="strategyId">${wdkStrategy.strategyId}</span>
<span style="display:none" id="stepId">${wdkStep.stepId}</span>
<span style="display:none" id="span_a_num" class="current_step_num"></span>
<span style="display:none" id="span_b_num" class="new_step_num"></span>
  
<input type="hidden" id="stage" value="process_span" />
  
<div id="spanLogicParams">
	<wdk:answerParamInput qp="${pMap['span_a']}"/>
	<wdk:answerParamInput qp="${pMap['span_b']}"/>
	<input type="hidden" value="${wdkStep.displayType}" id="span_a_type"/>
	<input type="hidden" value="${importStep.displayType}" id="span_b_type"/>
	<c:if test="${action == 'revise'}">
	  <input type="hidden" value="${spanStep.params['span_output']}" id="span_output_default"/>
	  <input type="hidden" value="${spanStep.params['span_operation']}" id="span_operation_default"/>
	  <input type="hidden" value="${spanStep.params['span_strand']}" id="span_strand_default"/>
        </c:if>
	<input type="hidden" value="${importStep.displayType}" id="span_b_type"/>
	<c:set var="wdkStepRecType" value="${wdkStep.displayType}"/>
	<c:set var="importStepRecType" value="${importStep.displayType}"/>
	<c:set var="wdkStepResultSize" value="${wdkStep.resultSize}"/>
	<c:set var="importStepResultSize" value="${importStep.resultSize}"/>
	<c:if test="${wdkStepResultSize > 1}"><c:set var="wdkStepRecType" value="${wdkStepRecType}s"/></c:if>
	<c:if test="${importStepResultSize > 1}"><c:set var="importStepRecType" value="${importStepRecType}s"/></c:if>

<%-- sentence --%>
        <table><tr><td>
	<div class="span-step-text right">
	  <span>Return each <wdk:enumParamInput qp="${pMap['span_output']}" /> whose <span class="region outputRegion region_a">region</span></span>
        </div>


<%-- region areas --%>
        <div id="outputGroup">
          <site:spanlogicGraph groupName="a" question="${question}" step="${wdkStep}" stepType="current_step"/>
        </div>
        </td>

	<%--  space in between areas --%>
	<td>
	<div class="span-step-text center">
          <div class="span-operations">
            <div class="triangle border"></div>
            <div class="triangle body"></div>
            <div class="operation-help">
              <div></div><!-- This is where the operation icon will go.  -->
            </div>
            <wdk:enumParamInput qp="${pMap['span_operation']}" />
          </div>
          &nbsp;the
        </div>
        </td> 
  
	<td>
	<div class="span-step-text left">
          <span class="region comparisonRegion region_b">region</span> of a
          <b><span class="comparison_type"></span> in Step
          <span class="comparison_num"></span></b> and is on
          <wdk:enumParamInput qp="${pMap['span_strand']}" /></span>
	</div>
        <div id="comparisonGroup">
          <site:spanlogicGraph groupName="b" question="${question}" step="${importStep}" stepType="new_step" />
        </div>
        </td></tr>
	</table>


    	<c:if test="allowBoolean == false">
      	  <c:set var="disabled" value="DISABLED"/>
      	  <c:set var="selected" value="CHECKED" />
      	  You cannot select output because there are steps in the strategy after the current one you are working on.
    	</c:if>

<%--
	<div class="span-step-text bottom clear">
	  "Return each <span class="span_output"></span> whose <span class="region outputRegion">region</span>
          <span class="span_operation"></span>&nbsp;the <span class="region comparisonRegion">region</span> of a
          <span class="comparison_type"></span> in Step
          <span class="comparison_num"></span> and is on
          <span class="span_strand"></span>"
	</div>
--%>
</div>

<div class="filter-button"><html:submit property="questionSubmit" value="Submit" styleId="submitButton"/></div>
</html:form>

<script>
	$(document).ready(function(){
		initWindow();
	});
</script>
