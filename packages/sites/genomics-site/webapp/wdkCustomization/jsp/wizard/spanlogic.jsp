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

  #outputGroup,#comparisonGroup{
    margin-top: 15px;
  }
  .invisible {
    visibility: hidden;
  }  
  .instructions {
    text-align:center;
    color:gray;
    margin-bottom:16px;
  }
  .span-step-text{
	font-style:italic;
	white-space:nowrap;
	padding: 23px 0;
  }
  .span-step-text .param{
	display: inline;
  }
  .span-step-text.left {
    text-align:left;
  }
  .span-step-text.center {
    text-align:center;
  }
  .span-step-text.right {
    text-align:right;
  }
  .span-step-text .region_a,
  .span-step-text .region_b{
	background-color:#efefef;
	padding-bottom:45px;
	font-style:normal;
	font-weight: bold;
	padding-top: 3px;
	padding-left: 3px;
	padding-right: 3px;
	border-top: 1px solid grey;
	border-left: 1px solid grey;
	border-right: 1px solid grey;

  }
  .region_b {
    color: #C80064;   //same as rgb(200,0,100);    light green: #1acd22;
  }
  .region_a {
    color: #0000EE;
  }
  .span-step-text select{
	font-weight: bold;
  }

  ul.horizontal {
    padding: 5px 0;
  }
  ul.horizontal li {
    padding: 1px 4px;
  }
  ul.horizontal.singleline {
    white-space: nowrap;
  }
  ul.horizontal li input {
    padding: 0;
  }
  .regionText {
    width: 3.2em;
  }
  .regionParams {
    background: #efefef; 
    padding: 5px;
    width:375px;
  }
  .regionGraphic {
    background: #fff;
  }
  .regionHeader {
    font-style: italic;
    text-align: center;
    font-size: 85%;
  }

  .offsetOptions {
    display: inline-table;
    margin-left: 20px;
  }
  canvas, div#scale_a, div#scale_b{
	height:75px;
	margin:2px 8px;
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
    top: 60px;
    left: 27px;
    padding:20px;
    background-color: #efefef;
  }
  #spanLogicParams table {
  //  margin: auto;
  }
  .triangle {
    position:absolute;
    top: 16px;
    left: 40px;
    border-width: 0 30px 100px;
    border-style: solid;
  }
  .triangle.border {
    border-color: transparent transparent #666;
  }
  .triangle.body {
    border-color: transparent transparent #efefef;
    padding-top: 2px
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
