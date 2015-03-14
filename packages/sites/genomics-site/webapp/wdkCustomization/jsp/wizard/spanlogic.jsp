<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="question" value="${requestScope.wdkQuestion}"/>
<c:set var="importStep" value="${requestScope.importStep}"/>
<c:set var="wdkStep" value="${requestScope.wdkStep}"/>
<c:set var="action" value="${requestScope.action}"/>
<c:set var="allowChooseOutput" value="${requestScope.allowChooseOutput}"/>

<c:set var="pMap" value="${question.paramsMap}"/>

<c:set var="newStepId">
  <c:choose>
    <c:when test="${action == 'add'}">${wdkStep.frontId + 1}</c:when>
    <c:otherwise>${wdkStep.frontId}</c:otherwise>
  </c:choose>
</c:set>
<c:set var="currentStepId" value="${newStepId - 1}" />

<%-- query_form is used for all popups.... Strategies.css
     for showing questions, max-width 75% to solve the problem that long descriptions use all browser space --which is annoying
				BUT the span logic popup below needs often more than 100% (for smaller scrren resolutions): set to 150%
                            left is set to 140px (good for smaller popups) 
				BUT the span logic popup below is wide so we set it closer to the left  
				Problem: IE makes width = max-width independently of the content
			    #query_form form {	margin-top: 40px;}
				BUT here we need 0px
--%>
<style type="text/css">
	#query_form {	max-width: 150%; left:45px;}
	#query_form form {	margin-top: 29px;}
						
</style>

<html:form method="post" enctype='multipart/form-data' action="/wizard.do"  onsubmit="wdk.addStepPopup.callWizard('wizard.do?action=${requestScope.action}&step=${wdkStep.stepId}&',this,null,null,'submit')">
<c:if test="${action == 'revise'}">
  <c:set var="spanStep" value="${wdkStep}"/>
  <c:set var="wdkStep" value="${wdkStep.previousStep}"/>
</c:if>


<div class="h2center" style="text-align:center;">Genomic Colocation
<span>
<a href="<c:url value="/help_spanlogic.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">
  <imp:image title="Help text in a popup window" src="wdk/images/spanhelp.png" width="19"  alt="help with combining IDs via relative genomic location" />
</a>
<a href="http://eupathdb.org/tutorials/colocate/colocate_viewlet_swf.html" target="_blank" onClick="poptastic(this.href); return false;">
	<imp:image style="position:relative;right:8px" title="7-minute flash tutorial on a popup window" src="images/camera.png" width="22" alt="help with combining IDs via relative genomic location" />
</a>
</span>
</div>

<div class="h3center" style="color:grey">Combine Step <span class="current_step_num">${currentStepId}</span> and Step <span class="new_step_num">${newStepId}</span> using relative locations in the genome</div>

<c:set var="newPluralType" value="${importStep.recordClass.displayNamePlural}"/>

<c:set var="oldPluralType" value="${wdkStep.recordClass.displayNamePlural}"/>

<div class="instructions">
You had <b style="color:blue">${wdkStep.resultSize} ${oldPluralType}</b> in your Strategy <span style="color:blue">(Step</span> <span style="color:blue" class="new_step_num">${currentStepId}</span><span style="color:blue">).</span>
</b> &nbsp;&nbsp;
Your new <b>${newPluralType}</b> search <span style="color:#c60056">(Step</span> <span style="color:#c80064" class="new_step_num">${newStepId}</span><span style="color:#c80064">) returned <b>${importStep.resultSize} ${newPluralType}</b>.</span>  

<br><br>
</div>









<span style="display:none" id="strategyId">${wdkStrategy.strategyId}</span>
<span style="display:none" id="stepId">${wdkStep.stepId}</span>
<span style="display:none" id="span_a_num" class="current_step_num">${currentStepId}</span>
<span style="display:none" id="span_b_num" class="new_step_num">${newStepId}</span>
  
<input type="hidden" id="stage" value="process_span" />

<%-- sentence and region areas --%>
<div id="spanLogicParams">
	<imp:answerParamInput qp="${pMap['span_a']}"/>
	<imp:answerParamInput qp="${pMap['span_b']}"/>
	<input type="hidden" value="${wdkStep.recordClass.displayName}" id="span_a_type"/>
	<input type="hidden" value="${importStep.recordClass.displayName}" id="span_b_type"/>
	<c:if test="${action == 'revise'}">
          <c:forEach items="${spanStep.params}" var="spanParam">
            <input type="hidden" value="${fn:escapeXml(spanParam.value)}" id="${spanParam.key}_default"/>
          </c:forEach>
        </c:if>

	<c:set var="wdkStepRecType" value="${wdkStep.recordClass.displayName}"/>
	<c:set var="importStepRecType" value="${importStep.recordClass.displayName}"/>
	<c:set var="wdkStepResultSize" value="${wdkStep.resultSize}"/>
	<c:set var="importStepResultSize" value="${importStep.resultSize}"/>
	<c:if test="${wdkStepResultSize > 1}"><c:set var="wdkStepRecType" value="${wdkStepRecType}s"/></c:if>
	<c:if test="${importStepResultSize > 1}"><c:set var="importStepRecType" value="${importStepRecType}s"/></c:if>


       
<%-- sentence --%>
        <table>
	<tr><td>
	<div class="span-step-text right">
	  <span>"Return each <imp:enumParamInput qp="${pMap['span_output']}" /> whose <span class="region outputRegion region_a">region</span></span>
        </div>


<%-- region areas --%>
        <div id="outputGroup">
          <imp:spanlogicGraph groupName="a" question="${question}" step="${wdkStep}" stepType="current_step" />
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
            <imp:enumParamInput qp="${pMap['span_operation']}" />
          </div>
          &nbsp;the
        </div>
        </td> 
  
	<td>
	<div class="span-step-text left">
          <span class="region comparisonRegion region_b">region</span> of a
          <span class="comparison_type">...</span> <span class="other_step">in Step</span>
          <span class="comparison_num">...</span> and is on
          <imp:enumParamInput qp="${pMap['span_strand']}" />
           "
	</div>
        <div id="comparisonGroup">
          <imp:spanlogicGraph groupName="b" question="${question}" step="${importStep}" stepType="new_step" />
        </div>
        </td></tr>
	</table>


    	<c:if test="allowBoolean == false">
      	  <c:set var="disabled" value="DISABLED"/>
      	  <c:set var="selected" value="CHECKED" />
      	  You cannot select output because there are steps in the strategy after the current one you are working on.
    	</c:if>

<%-- used --%>
	<div class="span-step-text bottom">
	  Return each <span class="span_output"></span> whose <span class="region outputRegion">region</span>
          <span class="span_operation"></span>&nbsp;the <span class="region comparisonRegion">region</span> of a
          <span class="comparison_type"></span> in Step
          <span class="comparison_num"></span> and is on
          <span class="span_strand"></span>
	</div>

        <input type="hidden" id="span_sentence" name="value(span_sentence)" value="" />
</div>

<div class="filter-button"><html:submit property="questionSubmit" value="Submit" styleId="submitButton"/></div>
</html:form>

<script>
	$(document).ready(function(){
		initWindow();
	});
</script>
