<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="step"
	      type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step to be displayed by this tag"
%>

<%@ attribute name="strategyNum"
	      type="java.lang.String"
              required="true"
              description="Strategy Including this Step"
%>

<%@ attribute name="stepNum"
	      type="java.lang.String"
              required="true"
              description="Number of this step in the strategy"
%>

<c:choose>
<c:when test="${step.isFirstStep}">
<c:set value="${step.question.fullName}" var="questionName" />
<c:set value="${step.question.displayName}" var="displayName"/>
<c:set value="${step.params}" var="params"/>
<c:set value="${step.question.paramsMap}" var="displayParams"/>
<c:set value="${step.questionUrlParams}" var="urlParams"/>
</c:when>
<c:otherwise>
<c:set value="${step.childStep.question.fullName}" var="questionName" />
<c:set value="${step.childStep.question.displayName}" var="displayName"/>
<c:set value="${step.childStep.params}" var="params"/>
<c:set value="${step.childStep.question.paramsMap}" var="displayParams"/>
<c:set value="${step.childStep.questionUrlParams}" var="urlParams"/>
</c:otherwise>
</c:choose>

<c:set var="subq" value="" />
<!--  <div class="crumb_details" onmouseover="overdiv=1" onmouseout="overdiv=0; setTimeout('hideDetails()',50)">-->
	<div class="crumb_details">
	<c:if test="${step.childStep.isCollapsible}">
		<c:set var="displayName" value="${step.childStep.collapsedName}" />
	</c:if>
	<p class="question_name"><span>${displayName}</span></p>
        <div>good time</div>
	<table>
                    <c:forEach items="${displayParams}" var="p">
                       <c:set var="pNam" value="${p.key}"/>
                       <c:set var="qP" value="${p.value}"/>
                       <c:set var="aP" value="${params[pNam]}"/>
                       <c:if test="${qP.isVisible}">
                          <tr>
                             <td align="right" valign="top" nowrap class="medium"><b><i>${qP.prompt}</i><b></td>
                             <td valign="top" class="medium">&nbsp;:&nbsp;</td>
                                <c:choose>
                                   <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                                      <td class="medium">
                                      <jsp:setProperty name="qP" property="combinedId" value="${aP}" />
                                      <c:set var="dataset" value="${qP.dataset}" />  
                                      "${dataset.summary}"
                                      <c:if test='${fn:length(dataset.uploadFile) > 0}'>
                                         from file &lt;${dataset.uploadFile}&gt;
                                      </c:if>
                                   </c:when>
                                   <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.AnswerParamBean'}">
                                      <td class="medium">
                                      <jsp:setProperty name="qP" property="combinedId" value="${aP}" />
                                      <c:set var="subHistory" value="${qP.history}" />
                                      History #${subHistory.historyId}: ${subHistory.customName}
                                   </c:when>
                                   <c:otherwise>
                                      <jsp:setProperty name="qP" property="paramValue" value="${aP}" />
                                      <jsp:setProperty name="qP" property="truncateLength" value="1000" />
                                      <c:choose>
                                        <c:when test="${fn:length(qP.decompressedValue) <= 50}">
					  <td class="medium" nowrap align="left">
                                        </c:when>
                                        <c:otherwise>
                                          <td class="medium" align="left">
                                        </c:otherwise>
                                      </c:choose>
                                      ${qP.decompressedValue}
                                   </c:otherwise>
                                </c:choose>
                             </td>
                          </tr>
                       </c:if>
                    </c:forEach>
	<%-- <c:forEach var="displayParam" items="${displayParams}">
	     <tr class="param">
                <td align="right" nowrap class="name">${displayParam.key}&nbsp;=</td>
		<td align="left">&nbsp;${displayParam.value}</td>
             </tr>
        </c:forEach> --%>
	</table>
   <c:set var="oper" value="" />
   <c:choose>
      <c:when test="${step.isFirstStep}">
          <p><b>Results:&nbsp;</b>${step.resultSize}&nbsp;&nbsp;|&nbsp;<a href="downloadStep.do?step_id=${step.stepId}">Download</a></p>
      </c:when>
      <c:otherwise>
          <hr><p><b>Query Results:&nbsp;</b>${step.childStep.resultSize}&nbsp;&nbsp;|&nbsp;<a href="downloadStep.do?step_id=${step.childStep.stepId}">Download</a></p>
	      <c:set var="subq" value="&subquery=true" />
	      <c:set var="oper" value="${step.operation}" />
      </c:otherwise>
   </c:choose>
   <div class="crumb_menu">
    <a class="rename_step_link" href="javascript:void(0)" onclick="Rename_Step(this)">Rename</a>&nbsp;|&nbsp;
	<a class="view_step_link" onclick="NewResults(this,'showSummary.do?strategy=${strategyNum}&step=${stepNum}${subq}&resultsOnly=true')" href="javascript:void(0)">View</a>&nbsp;|&nbsp;
	<a class="edit_step_link" href="javascript:void(0)" onclick="Edit_Step(this,'showQuestion.do?questionFullName=${questionName}${urlParams}&questionSubmit=Get+Answer&goto_summary=0&partial=true')" id="${strategyNum}|${stepNum}|${oper}">Edit</a>&nbsp;|&nbsp;
	<!--<span style="color:#888;">Edit</span>&nbsp;|&nbsp;-->
	<c:set var="expandUrl" value="expandStep.do?strategy=${strategyNum}&step=${step.childStep.stepId}&collapsedName=Expanded%20${step.childStep.question.displayName}" />
<%--	<c:set var="expandUrl" value="expandStep.do?strategy=${strategyNum}&step=${step.childStep.stepId}" />
	<c:if test="${!step.isCollapsible}">
		<c:set var="expandUrl" value="expandStep.do?strategy=${strategyNum}&step=${step.childStep.stepId}&collapsedName=Expanded%20${step.childStep.question.displayName}" />
	</c:if>--%>
	<a class="expand_step_link" href="javascript:void(0)" onclick="Expand_Step(this,'${expandUrl}')">Expand</a>&nbsp;|&nbsp;
	<a class="insert_step_link" id="${strategyNum}|${stepNum}" href="javascript:void(0)" onclick="Insert_Step(this,'processFilter.do?strategy=${strategyNum}&insert=${stepNum}')">Insert Before</a>
	<!--<span style="color:#888;">Insert Before</span>-->&nbsp;|&nbsp;
	<a class="delete_step_link" href="javascript:void(0)" onclick="DeleteStep(this,'deleteStep.do?strategy=${strategyNum}&step=${stepNum}')">Delete</a>
	<span style="float:right; position:absolute; right: 6px"><a href="javascript:void(0)" onclick="hideDetails(this)">[x]</a></span)
	<!--<span style="color:#888;">Delete</span>&nbsp;|&nbsp;-->
<!--    <span><a href="deleteStep.do?strategy=${strategyNum}&delete=${stepNum}">Delete</a></span>-->
   </div>       
  </div><!--End Crumb_Detail-->
