<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ attribute name="first_step"
          type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Protocol from the SummaryPage"
%>
<%@ attribute name="stratId"
              required="true"
              description="Protocol from the SummaryPage"
%>            
<%@ attribute name="stratName"
              required="true"
              description="Protocol from the SummaryPage"
%>
<%@ attribute name="saved"
              type="java.lang.Boolean"
              required="true"
              description="Protocol from the SummaryPage"
%>
<%@ attribute name="savedName"
              required="true"
              description="Protocol from the SummaryPage"
%>
<%@ attribute name="importId"
              required="true"
              description="Protocol from the SummaryPage"
%>

<strategy name="${stratName}" id="${stratId}" saved="${saved}" savedName="${savedName}" importId="${importId}">
    <c:forEach var="step" items="${first_step.allSteps}">
        <c:set value="${step.stepId}" var="id" />
        <c:set value="${step.answerId}" var="answerId" />
        <c:set value="${step.customName}" var="customName" />
        <c:set value="${step.isCollapsible}" var="collapsible" />
        <c:set value="${step.collapsedName}" var="collapsedName" />
        <c:set value="${step.shortDisplayName}" var="sDName" />
        <c:set value="${step.customName}" var="cName" />
        <c:set value="${step.dataType}" var="dataType" />
        <c:set value="${step.resultSize}" var="resultSize" />
        <c:set value="${step.answerValue.question.fullName}" var="questionName" />
        <c:set value="${step.answerValue.question.displayName}" var="displayName"/>
        <c:set value="${step.answerValue.internalParams}" var="params"/>
        <c:set value="${step.answerValue.question.paramsMap}" var="displayParams"/>
        <c:set value="${step.answerValue.questionUrlParams}" var="urlParams"/>
        <c:set value="${step.isBoolean}" var="isboolean" />
        <c:set value="${step.isTransform}" var="isTransform" />
		<c:set value="${step.filtered}" var="isFiltered" />
		<c:set value="${step.filterDisplayName}" var="filterName" />
		
        <c:if test="${isboolean}">
        <c:set value="${step.childStep.stepId}" var="child_id" />
        <c:set value="${step.childStep.answerId}" var="child_answerId" />
        <c:set value="${step.childStep.customName}" var="child_customName" />
        <c:set value="${step.childStep.isCollapsible}" var="child_collapsible" />
        <c:set value="${step.childStep.collapsedName}" var="child_collapsedName" />
        <c:set value="${step.childStep.shortDisplayName}" var="child_sDName" />
        <c:set value="${step.childStep.customName}" var="child_cName" />
        <c:set value="${step.childStep.dataType}" var="child_dataType" />
        <c:set value="${step.childStep.resultSize}" var="child_resultSize" />
        <c:set value="${step.childStep.answerValue.question.fullName}" var="child_questionName" />
        <c:set value="${step.childStep.answerValue.question.displayName}" var="child_displayName"/>
        <c:set value="${step.childStep.answerValue.internalParams}" var="params"/>
        <c:set value="${step.childStep.answerValue.question.paramsMap}" var="displayParams"/>
        <c:set value="${step.childStep.answerValue.questionUrlParams}" var="urlParams"/>
        <c:set value="${step.childStep.isBoolean}" var="child_isboolean" />
        <c:set value="${step.childStep.isTransform}" var="child_isTransform" />
		<c:set value="${step.childStep.filtered}" var="child_isFiltered" />
        <c:set value="${step.childStep.filterDisplayName}" var="child_filterName" />
		</c:if>
    
                <c:choose>
                    <c:when test="${isboolean}">
                        <step name="${cName}"
                             id="${id}"
                             answerId="${answerId}"
                             isCollapsed="${collapsible}"
                             dataType="${dataType}"
                             shortName="${sDName}"
                             results="${resultSize}"
                             questionName="${questionName}"
                             displayName="${displayName}"
                             isboolean="${isboolean}"
							 istransform="${isTransform}"
                             operation="${step.operation}"
                             filtered="${isFiltered}">
							<filterName><![CDATA[${filterName}]]></filterName>
                            
                            <step name="${child_cName}"
                                 customName="${child_customName}"
                                 id="${child_id}"
                                 answerId="${child_answerId}"
                                 isCollapsed="${child_collapsible}"
                                 dataType="${child_dataType}"
                                 shortName="${child_sDName}"
                                 results="${child_resultSize}"
                                 questionName="${child_questionName}"
                                 displayName="${child_displayName}"
                                 isboolean="${child_isboolean}"
								 istransform="${child_isTransform}"
                                 filtered="${child_isFiltered}">
								<filterName><![CDATA[${child_filterName}]]></filterName>
                                    <c:choose>
                                        <c:when test="${child_collapsible == true}">
										 	<c:set var="tst" value="${step.childStep}" />
											<c:forEach var="tsts" items="${tst.allSteps}">
												<jsp:setProperty name="tsts" property="isCollapsible" value="false" />
											</c:forEach>
											<c:set var="step" value="${tst}" scope="request" />
	                                        <%--<c:set var="step" value="${step.childStep}" scope="request" />--%>
                                            <c:set var="strat_Id" value="${fn:split(stratId, '_')[0]}_${child_id}" scope="request" />
                                            <c:set var="strat_name" value="${child_collapsedName}" scope="request" />
                                            <c:set var="import_id" value="${importId}" scope="request" />
                                            <c:import url="/WEB-INF/includes/xml_recurse.jsp"/>
                                            <c:remove var="step" scope="request"/>
                                            <c:remove var="strat_Id" scope="request"/>
                                            <c:remove var="strat_name" scope="request"/>
                                            <c:remove var="import_id" scope="request"/>
                                        </c:when>
                                        <c:otherwise>
                                            <params>
                                                <urlParams><![CDATA[${urlParams}]]></urlParams>
                                                <c:forEach items="${displayParams}" var="p">
                                                    <c:set var="pNam" value="${p.key}"/>
                                                    <c:set var="qP" value="${p.value}"/>
                                                    <c:set var="aP" value="${params[pNam]}"/>
                                                    <jsp:setProperty name="qP" property="user" value="${sessionScope.wdkUser}" />
                                                    <jsp:setProperty name="qP" property="dependentValue" value="${aP}" />
                                                    <jsp:setProperty name="qP" property="truncateLength" value="1000" />
                                                    <c:choose>
                                                       <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                                                          <c:set var="dataset" value="${qP.dataset}" />  
                                                          <c:set var="aP">
                                                            ${dataset.summary}
                                                            <c:if test='${fn:length(dataset.uploadFile) > 0}'>
                                                                 from file &lt;${dataset.uploadFile}&gt;
                                                            </c:if>
                                                          </c:set>
                                                       </c:when>
                                                       <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.AnswerParamBean'}">
                                                            <c:set var="aP" value="Step ${aP}"/>
                                                       </c:when>
                                                       <c:otherwise>
                                                          <c:set var="aP" value="${qP.briefRawValue}" />
                                                       </c:otherwise>
                                                    </c:choose>
                                                    <param name="${pNam}" prompt="${fn:escapeXml(qP.prompt)}" value="${aP}" className="${qP.class.name}"/>
                                                </c:forEach>
                                            </params>
                                        </c:otherwise>
                                    </c:choose>
                            </step>
                    </c:when>
                    <c:otherwise>
                        <step name="${cName}"
                             customName="${customName}"
                             id="${id}"
                             answerId="${answerId}"
                             isCollapsed="${collapsible}"
                             dataType="${dataType}"
                             shortName="${sDName}"
                             results="${resultSize}"
                             questionName="${questionName}"
                             displayName="${displayName}"
                             isboolean="${isboolean}"
							 istransform="${isTransform}"
                             filtered="${isFiltered}">
							<filterName><![CDATA[${filterName}]]></filterName>
                                <c:choose>
                                    <c:when test="${child_collapsible == true}">
									 	<c:set var="tst" value="${step.childStep}" />
										<c:forEach var="tsts" items="${tst.allSteps}">
											<jsp:setProperty name="tsts" property="isCollapsible" value="false" />
										</c:forEach>
										<c:set var="step" value="${tst}" scope="request" />
                                        <%--<c:set var="step" value="${step.childStep}" scope="request" />--%>
                                        <c:set var="strat_Id" value="${stratId}_${child_id}" scope="request" />
                                        <c:set var="strat_name" value="${child_collapsedName}" scope="request" />
                                        <c:import url="/WEB-INF/includes/xml_recurse.jsp"/>
                                        <c:remove var="step" scope="request"/>
                                        <c:remove var="strat_Id" scope="request"/>
                                        <c:remove var="strat_name" scope="request"/>
                                    </c:when>
                                    <c:otherwise>
                                        <params>
                                            <urlParams><![CDATA[${urlParams}]]></urlParams>
                                            <c:forEach items="${displayParams}" var="p">
                                                <c:set var="pNam" value="${p.key}"/>
                                                <c:set var="qP" value="${p.value}"/>
                                                <c:set var="aP" value="${params[pNam]}"/>
                                                    <jsp:setProperty name="qP" property="user" value="${sessionScope.wdkUser}" />
                                                    <jsp:setProperty name="qP" property="dependentValue" value="${aP}" />
                                                    <jsp:setProperty name="qP" property="truncateLength" value="1000" />
                                                    <c:choose>
                                                       <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                                                          <c:set var="dataset" value="${qP.dataset}" />
                                                          <c:set var="aP">
                                                            ${dataset.summary}
                                                            <c:if test='${fn:length(dataset.uploadFile) > 0}'>
                                                                 from file &lt;${dataset.uploadFile}&gt;
                                                            </c:if>
                                                          </c:set>
                                                       </c:when>
                                                       <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.AnswerParamBean'}">
                                                            <c:set var="aP" value="Step ${aP}"/>
                                                       </c:when>
                                                       <c:otherwise>
                                                          <c:set var="aP" value="${qP.briefRawValue}" />
                                                       </c:otherwise>
                                                    </c:choose>
                                                    <param name="${pNam}" prompt="${fn:escapeXml(qP.prompt)}" value="${aP}" className="${qP.class.name
}"/>                                        
                                            </c:forEach>
                                        </params>
                                    </c:otherwise>
                                </c:choose>
                    </c:otherwise>
                </c:choose>
        </step>
    </c:forEach>
</strategy>
