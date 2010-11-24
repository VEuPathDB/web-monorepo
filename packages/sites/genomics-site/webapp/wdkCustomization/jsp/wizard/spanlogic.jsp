<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
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
	font-size:13pt;
	font-weight:bold;
	padding:12px;
  }

  .roundLabel {
    -moz-border-radius:1.7em 1.7em 1.7em 1.7em;/* Not sure why this doesn't work @ 1.5em */
	border:2px solid red;
	float:left;
	height:2em;
	margin:7px;
	text-align:center;
	width:2em; 
	background-color:yellow;
  }

  .roundLabel span {
    font-size:1.5em;
	line-height:1.3;
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


	<table>
	<tr>
	<td colspan="2">
    		<div class="roundLabel"><span>1</span></div>
		<div class="span-step-text">Select regions relative to the ${wdkStepResultSize} ${wdkStepRecType} in your current result (step xxx)
		</div>
	</td>
	</tr>


	<tr>
	<td style="vertical-align:middle;">
    		<fieldset id="setAFields">
      		<table id="offsetOptions" cellpadding="2">
        	<tr>
		<td style="text-align:right">begin at:</td><td><wdk:enumParamInput qp="${pMap['span_begin_a']}"/></td>
		<td><wdk:enumParamInput qp="${pMap['span_begin_direction_a']}"/></td>
		<td align="left" valign="top">
            	<html:text styleId="span_begin_offset_a" property="value(span_begin_offset_a)" size="35" />
        	</td>
        	</tr>
        	<tr>
		<td style="text-align:right">end at:</td><td><wdk:enumParamInput qp="${pMap['span_end_a']}"/></td>
		<td><wdk:enumParamInput qp="${pMap['span_end_direction_a']}"/></td>
		<td align="left" valign="top">
            		<html:text styleId="span_end_offset_a" property="value(span_end_offset_a)" size="35" />
        	</td>
        	</tr>
      		</table>
    		</fieldset>
	</td>
	<td style="vertical-align:top;"><div id="scaleA"></div>
		<!--><canvas id="scaleA" width="400" height="75">
				This browser does not support Canvas Elements (probably IE) :(
		</canvas>-->
	</td>
	</tr>


	<tr>
	<td colspan="2">
    		<div class="roundLabel clear"><span>2</span></div>
		<div class="span-step-text">Select regions relative to the ${importStepResultSize} ${importStepRecType} in your new step (step xxx + 1)
		</div></td>
	</tr>


	<tr>
	<td style="vertical-align:middle;">
    		<fieldset id="setBFields">
      		<table id="offsetOptions" cellpadding="2">
        	<tr>
          	<td style="text-align:right">begin at:</td><td><wdk:enumParamInput qp="${pMap['span_begin_b']}"/></td>
		<td><wdk:enumParamInput qp="${pMap['span_begin_direction_b']}"/></td>
		<td align="left" valign="top">
	        	<html:text styleId="span_begin_offset_b" property="value(span_begin_offset_b)" size="35" />
	        </td>
	        </tr>
	        <tr>
		<td style="text-align:right">end at:</td><td><wdk:enumParamInput qp="${pMap['span_end_b']}"/></td>
		<td><wdk:enumParamInput qp="${pMap['span_end_direction_b']}"/></td>
		<td align="left" valign="top">
	        	<html:text styleId="span_end_offset_b" property="value(span_end_offset_b)" size="35" />
	        </td>
        	</tr>
      		</table>
    		</fieldset>
	</td>
	<td style="vertical-align:top;"><div id="scaleB"></div>
		<!--<canvas id="scaleB" width="400" height="75">
			This browser does not support Canvas Elements (probably IE) :(
		</canvas>-->
	</td>
	</tr>
	</table>

 	 <br>
	
	<table width="100%">
	<tr>
	<td>  
		<div class="roundLabel"><span>3</span></div> <div class="span-step-text">Define positional relationship between the above regions
		</div>
	</td>
	</tr>
	<tr>
	<td>
   		<table><tr>
			<td><wdk:enumParamInput qp="${pMap['span_operation']}" layout="horizontal"/></td>
		</tr></table>
	</td>
	</tr>
	<tr>
	<td>
		<div class="roundLabel"><span>4</span></div><div class="span-step-text">Restrict region pairs by strand
		</div>
	</td>
	</tr>
	<tr>
	<td>
		<table><tr>
    			<td><wdk:enumParamInput qp="${pMap['span_strand']}" layout="horizontal"/></td>
		</tr></table>
	</td>
	</tr>
	<tr>
	<td>
		<div class="roundLabel"><span>5</span></div><div class="span-step-text">Choose your result from
		</div>
	</td>
	</tr>
	<tr>
	<td>
		<table><tr>

    			<c:if test="allowBoolean == false">
      			<c:set var="disabled" value="DISABLED"/>
      			<c:set var="selected" value="CHECKED" />
      			You cannot select output because there are steps in the strategy after the current one you are working on.
    			</c:if>
    
			<!--<td><input type="radio" name="output" value="A" ${disabled} ${selected}>Set A</input></td>
    				<td><input type="radio" name="output" value="B" ${disabled}>Set B</input></td>-->
	
			<wdk:enumParamInput qp="${pMap['span_output']}" layout="horizontal"/>

		</tr></table>
	</td>
	</tr>
	</table>

</div>

<div id="sentence" style="text-align:center;font-size:150%"><br><hr></div><br>

<div class="filter-button"><html:submit property="questionSubmit" value="Run Step" styleId="submitButton"/></div>
</html:form>

<script>
	initWindow();
</script>
