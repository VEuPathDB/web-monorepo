<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="question" value="${requestScope.wdkQuestion}"/>
<c:set var="importStep" value="${requestScope.importStep}"/>
<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="allowChooseOutput" value="${requestScope.allowChooseOutput}"/>


<style>
  #spanLogicParams, #spanLogicGraphics {
 /*   float:left;  */
    margin:5px;
  }

  #spanLogicParams fieldset {
 /*   float:left;  */
  /*  border:1px solid gray; */
/*	height:75px; */
  }

  #spanLogicGraphics {
	
  }
 
  #spanLogicParams fieldset:first-of-type {
/*    margin-bottom: 5px; */
  }
 
  #spanLogicParams fieldset:nth-of-type(2) {
    margin-top: 5px;
  }

  .invisible {
    visibility: hidden;
  }  

  .span-step-text{
	font-size:11pt;
	font-weight:bold;
	padding:10px;
  }

  .span-step-text .param{
	display: inline;
  }

  .span-step-text select{
	font-weight: inherit;
	font-size:10pt;
  }

  ul.horizontal.center {
    text-align: center;
  }
 
  ul.horizontal li {
    display: inline;
  }
  canvas, div#scaleA, div#scaleB{
/*	border:1px solid black; */
	height:75px;
	margin:auto;
	width:400px;
  }
</style>
<c:set var="pMap" value="${question.paramsMap}"/>
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/wizard.do"  onsubmit="callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">

<h2 style="text-align:center;">Combine Step <span class="current_step_num"></span> and Step <span class="new_step_num"></span></h2>

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
	<c:set var="wdkStepRecType" value="${wdkStep.displayType}"/>
	<c:set var="importStepRecType" value="${importStep.displayType}"/>
	<c:set var="wdkStepResultSize" value="${wdkStep.resultSize}"/>
	<c:set var="importStepResultSize" value="${importStep.resultSize}"/>
	<c:if test="${wdkStepResultSize > 1}"><c:set var="wdkStepRecType" value="${wdkStepRecType}s"/></c:if>
	<c:if test="${importStepResultSize > 1}"><c:set var="importStepRecType" value="${importStepRecType}s"/></c:if>

	<div style="text-align:center;">
	<span class="span-step-text">Return each <wdk:enumParamInput qp="${pMap['span_output']}" /> whose <span class="comparisonRegion">region</span>
          <wdk:enumParamInput qp="${pMap['span_operation']}" />&nbsp;the <span class="outputRegion">region</span> of a
          <span class="selected_output_type"></span> in Step
          <span class="selected_output_num"</span> and is on
          <wdk:enumParamInput qp="${pMap['span_strand']}" />
        </span>
	</div>

        <div id="outputGroup" style="float: left">
          <site:spanlogicGraph groupName="A" question="${question}" />
        </div>

        <div id="comparisonGroup" style="float: right">
          <site:spanlogicGraph groupName="B" question="${question}" />
        </div>

    	<c:if test="allowBoolean == false">
      	  <c:set var="disabled" value="DISABLED"/>
      	  <c:set var="selected" value="CHECKED" />
      	  You cannot select output because there are steps in the strategy after the current one you are working on.
    	</c:if>

</div>

<div class="filter-button clear"><html:submit property="questionSubmit" value="Run Step" styleId="submitButton"/></div>
</html:form>

<script>
	$(document).ready(function(){
		initWindow();
	});
</script>
