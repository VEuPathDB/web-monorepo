<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="question" value="${requestScope.wdkQuestion}"/>
<c:set var="importStep" value="${requestScope.importStep}"/>
<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="allowChooseOutput" value="${requestScope.allowChooseOutput}"/>


<style>
  #spanLogicParams, #spanLogicGraphics {
    margin:5px;
  }

  #spanLogicParams fieldset {
	padding: 0 30px;
	width: 420px;
  }
  #outputGroup,#comparisonGroup{
    margin: 20px 10px 10px;
  }
  #outputGroup{
    float: left;
  }
  #comparisonGroup{
    float: right;
  }
  .invisible {
    visibility: hidden;
  }  
  .instructions {
    text-align:center;
    color:gray;
  }
  .span-step-text{
	font-size:11pt;
	font-style:italic;
	white-space:nowrap;
	text-align:center;
  }
  .span-step-text.bottom{
	padding-top:10px;
	color:darkgreen;
  }
  .span-step-text.bottom .comparisonRegion,
  .span-step-text.bottom .outputRegion{
	background:none;
	padding:0;
	font-weight:inherit;
	font-style:inherit;
        color:inherit;
  }
  .span-step-text .param{
	display: inline;
  }

  .region {
    font-weight: bold;
  }

  .span-step-text .comparisonRegion,
  .span-step-text .outputRegion{
	background-color:#efefef;
	padding-bottom:25px;
	font-style:normal;
  }
  .comparisonRegion,
  #comparisonGroup .region {
    color: darkred;
  }
  .outputRegion,
  #outputGroup .region  {
    color: darkblue;
  }
  .span-step-text select{
	font-weight: bold;
	font-size:10pt;
  }

  ul.horizontal {
    padding-right: 5px;
  }
  ul.horizontal.center {
    text-align: center;
  }
 
  ul.horizontal li {
    display: inline;
  }
  .regionText {
    width: 6em;
  }
  .regionParams {
    background: #efefef;  
    padding-top: 5px;
  }
  .regionGraphic {
    background: #fff;
  }
  .regionHeader {
    font-style: italic;
    text-align: center;
  }
  .offsetOptions {
    margin: auto;
  }
  canvas, div#scale_a, div#scale_b{
	height:75px;
	margin:5px auto;
	width:400px;
  }
</style>
<c:set var="pMap" value="${question.paramsMap}"/>
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/wizard.do"  onsubmit="callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">

<h2 style="text-align:center;">Combine Step <span class="current_step_num"></span> and Step <span class="new_step_num"></span></h2>

<c:set var="step_dataType" value="${importStep.displayType}" />
<c:choose>
	<c:when test="${fn:endsWith(step_dataType,'y')}">
		<c:set var="newPluralType" value="${fn:substring(step_dataType,0,fn:length(step_dataType)-1)}ies" />
	</c:when>
	<c:otherwise>
		<c:set var="newPluralType" value="${step_dataType}s" />
	</c:otherwise>	
</c:choose>

<c:set var="step_dataType" value="${wdkStep.displayType}" />
<c:choose>
	<c:when test="${fn:endsWith(step_dataType,'y')}">
		<c:set var="oldPluralType" value="${fn:substring(step_dataType,0,fn:length(step_dataType)-1)}ies" />
	</c:when>
	<c:otherwise>
		<c:set var="oldPluralType" value="${step_dataType}s" />
	</c:otherwise>	
</c:choose>

<div class="instructions" style="">Your ${newPluralType} search (Step <span class="new_step_num"></span>) returned ${importStep.resultSize} ${newPluralType}.  Use this page to combine them with the ${oldPluralType} in your previous result (Step <span class="current_step_num"></span>).</div><br><br>
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

	<div class="span-step-text">
	  Return each <wdk:enumParamInput qp="${pMap['span_output']}" /> whose <span class="region outputRegion">region</span>
          <wdk:enumParamInput qp="${pMap['span_operation']}" />&nbsp;the <span class="region comparisonRegion">region</span> of a
          <span class="comparison_type"></span> in Step
          <span class="comparison_num"></span> and is on
          <wdk:enumParamInput qp="${pMap['span_strand']}" />
	</div>

        <div id="outputGroup">
          <site:spanlogicGraph groupName="a" question="${question}" step="${wdkStep}" stepType="current_step"/>
        </div>

        <div id="comparisonGroup">
          <site:spanlogicGraph groupName="b" question="${question}" step="${importStep}" stepType="new_step" />
        </div>

    	<c:if test="allowBoolean == false">
      	  <c:set var="disabled" value="DISABLED"/>
      	  <c:set var="selected" value="CHECKED" />
      	  You cannot select output because there are steps in the strategy after the current one you are working on.
    	</c:if>
	<div class="span-step-text bottom clear">
	  "Return each <span class="span_output"></span> whose <span class="region outputRegion">region</span>
          <span class="span_operation"></span>&nbsp;the <span class="region comparisonRegion">region</span> of a
          <span class="comparison_type"></span> in Step
          <span class="comparison_num"></span> and is on
          <span class="span_strand"></span>"
	</div>
</div>

<div class="filter-button"><html:submit property="questionSubmit" value="Run Step" styleId="submitButton"/></div>
</html:form>

<script>
	$(document).ready(function(){
		initWindow();
	});
</script>
