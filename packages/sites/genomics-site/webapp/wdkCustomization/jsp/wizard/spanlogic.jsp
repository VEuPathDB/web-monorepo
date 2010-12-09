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


<style>
  .regionParams .param-group[type="ShowHide"]{
    border:none;
    background:none;
  }
  #spanLogicParams, #spanLogicGraphics {
    margin:5px;
  }

  #spanLogicParams fieldset {
	//padding: 0 10px;
	width: 400px;    //415px;
  }
  #outputGroup,#comparisonGroup{
    margin: 15px 10px 10px;
  }
  .invisible {
    visibility: hidden;
  }  
  .instructions {
    text-align:center;
    color:gray;
    margin-bottom:35px;    //57px;
  }
  .span-step-text{
	font-style:italic;
	white-space:nowrap;
	text-align:center;
	padding: 23px;
  }
  .span-step-text.bottom{
	padding-top:40px;
	padding-bottom: 0;
	color:darkred;  /* darkgreen */
  }
  .span-step-text.bottom .region_a,
  .span-step-text.bottom .region_b{
	background:none;
	padding:0;
	font-weight:inherit;
	font-style:inherit;
        color:inherit;
	border-color: white;
  }
  .span-step-text .param{
	display: inline;
  }

  .region {
  //  font-weight: bold;
  }

  .span-step-text .region_a,
  .span-step-text .region_b{
	background-color:#efefef;
	padding-bottom:45px;   //25px;
	font-style:normal;
	padding-top: 3px;
	padding-left: 3px;
	padding-right: 3px;
	border-top: 1px solid grey;
	border-left: 1px solid grey;
	border-right: 1px solid grey;

  }
  .region_b {
    color: darkgreen;  /* darkred  */
  }
  .region_a {
    color: darkblue;
  }
  .span-step-text select{
	font-weight: bold;
  }

  ul.horizontal {
   // text-align:center;
    padding: 5px 0;
  }
  ul.horizontal li {
    display: inline;
    padding: 0 5px;
  }
  ul.horizontal.singleline {
    white-space: nowrap;
  }
  .regionText {
    width: 3.2em;
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
    display: inline-table;
  }
  canvas, div#scale_a, div#scale_b{
	height:75px;
	margin:5px auto;
	width:375px;  //400px;
	border:1px solid gray;
  }
  .span-operations{
    position:relative;
    display: inline;
  }
  .span-operations .operation-help {
    position:absolute;
    display: inline;
    width: 45px;
    height: 40px;
    top: -40px;
    left: 35px;
    padding-top:2px;
    background: url(/assets/images/operationHelp.png) no-repeat scroll -48px 0;
  }
  #spanLogicParams table {
    margin: auto;
  }
</style>
<c:set var="pMap" value="${question.paramsMap}"/>
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/wizard.do"  onsubmit="callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">

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
<c:choose>
    <c:when test="${wdkStep.previousStep == null || action != 'revise'}">
        <c:set var="stepId" value="${wdkStep.stepId}" />
    </c:when>
    <c:otherwise>
        <c:set var="stepId" value="${wdkStep.previousStep.stepId}" />
    </c:otherwise>
</c:choose>
<span style="display:none" id="stepId">${stepId}</span>
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
	  <span>Return each <wdk:enumParamInput qp="${pMap['span_output']}" /> whose <span class="region outputRegion region_a">region</span></span>
          <div class="span-operations">
            <div class="operation-help">
              <div></div><!-- This is where the operation icon will go.  -->
            </div>
            <wdk:enumParamInput qp="${pMap['span_operation']}" />
          </div>
          <span>&nbsp;the <span class="region comparisonRegion region_b">region</span> of a
          <span class="comparison_type"></span> in Step
          <span class="comparison_num"></span> and is on
          <wdk:enumParamInput qp="${pMap['span_strand']}" /></span>
	</div>

        <table><tr><td>
        <div id="outputGroup">
          <site:spanlogicGraph groupName="a" question="${question}" step="${wdkStep}" stepType="current_step"/>
        </div>
        </td>
	<td style="width:33px"></td>
	<td>
        <div id="comparisonGroup">
          <site:spanlogicGraph groupName="b" question="${question}" step="${importStep}" stepType="new_step" />
        </div>
        </td></tr></table>
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

<div class="filter-button"><html:submit property="questionSubmit" value="Submit" styleId="submitButton"/></div>
</html:form>

<script>
	$(document).ready(function(){
		initWindow();
	});
</script>
