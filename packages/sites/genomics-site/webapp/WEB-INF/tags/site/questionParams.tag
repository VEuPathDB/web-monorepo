<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="qForm" value="${requestScope.questionForm}"/>
<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${fn:contains(recordType, 'Assem') }">
        <c:set var="recordType" value="Assemblie" />
</c:if>



<c:set var="hasOrganism" value="false"/>
<c:set value="${wdkQuestion.paramMapByGroups}" var="paramGroups"/>

<c:forEach items="${paramGroups}" var="paramGroupItem">
    <c:set var="group" value="${paramGroupItem.key}" />
    <c:set var="paramGroup" value="${paramGroupItem.value}" />
  
    <%-- detemine starting display style by displayType of the group --%>
    <c:set var="groupName" value="${group.displayName}" />
    <c:set var="displayType" value="${group.displayType}" />
    <div name="${wdkQuestion.name}_${group.name}"
         class="param-group" 
         type="${displayType}">
    <c:choose>
        <c:when test="${displayType eq 'empty'}">
            <%-- output nothing else --%> 
            <div class="group-detail">
        </c:when>
        <c:when test="${displayType eq 'ShowHide'}">
            <c:set var="display">
                <c:choose>
                    <c:when test="${group.visible}">block</c:when>
                    <c:otherwise>none</c:otherwise>
                </c:choose>
            </c:set>
            <c:set var="image">
                <c:choose>
                    <c:when test="${group.visible}">minus.gif</c:when>
                    <c:otherwise>plus.gif</c:otherwise>
                </c:choose>
            </c:set>
            <div class="group-title">
                <img class="group-handle" src='<c:url value="/images/${image}" />' />
                ${groupName}
            </div>
            <div class="group-detail" style="display:${display};">
                <div class="group-description">${group.description}</div>
        </c:when>
        <c:otherwise>
            <div class="group-title">${groupName}</div>
            <div class="group-detail">
                <div class="group-description">${group.description}</div>
        </c:otherwise>
    </c:choose>
    
    <table border="0" width="100%">
    
    <c:set var="paramCount" value="${fn:length(paramGroup)}"/>
    <%-- display parameter list --%>
    <c:forEach items="${paramGroup}" var="paramItem">
        <c:set var="pNam" value="${paramItem.key}" />
        <c:set var="qP" value="${paramItem.value}" />
        
        <c:set var="isHidden" value="${qP.isVisible == false}"/>
        <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  
        <%-- hide invisible params --%>
        <c:choose>
            <%--<c:when test="${isHidden}"><html:hidden property="myProp(${qP.class.name})"/></c:when>--%>
            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.TimestampParamBean'}">
                <wdk:timestampParamInput qp="${qP}" />
            </c:when>
            <c:when test="${isHidden}">
                <c:choose>
                   <c:when test="${fn:containsIgnoreCase(wdkModel.displayName,'EuPathDB')}">
                        <c:choose>
                           <c:when test="${pNam eq 'signature'}">
                            <html:hidden property="myProp(${pNam})" value="${wdkUser.signature}"/>
                           </c:when>
                           <c:otherwise>
                                <html:hidden property="myProp(${pNam})"/>
                           </c:otherwise>
                        </c:choose>
                   </c:when>
                   <c:otherwise>
                        <html:hidden property="myProp(${pNam})"/>
                   </c:otherwise>
                </c:choose>
            </c:when>
            <c:otherwise> <%-- visible param --%>
                <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
                <tr>
                    <c:choose>
                        <c:when test="${fn:containsIgnoreCase(pNam,'organism') && wdkModel.displayName eq 'EuPathDB'}">
                            <c:set var="hasOrganism" value="true"/>
                            <td width="300" align="left" valign="top" rowspan="${paramCount}" cellpadding="5">
                                <table border="0">
                                    <tr>
                                    <td ><b>${qP.prompt}&nbsp;&nbsp;&nbsp;</b>
                                    <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                                    <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
<%--
                                    <a href="#${anchorQp}">
                                    <img valign="bottom" src="/assets/images/help.png" border="0" alt="Help"></a><br>
--%>
                                    <site:cardsOrgansimParamInput qp="${qP}" portals="${portalsProp}" />
                                    </td>
                                    </tr>
                                </table>
                             </td>
                             <td valign="top" align="center">
			         <table border="0">
                        </c:when>
                        
                        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
                            <td width="30%" align="right" style="vertical-align:top"><b id="help_${pNam}" class="help_link" rel="htmltooltip">${qP.prompt}</b>
				

<%-- to have select, clear, expand, collapse, under parameter name 
				<c:if test="${qP.multiPick}">
 					<%@ include file="/WEB-INF/includes/selectAllParamOpt2.jsp" %>
				</c:if>
use enumParamInput2 in next <td> below --%>

			    </td>
                            <td align="left" style="vertical-align:bottom" id="${qP.name}aaa">
                                <wdk:enumParamInput qp="${qP}" />
                            </td>
                        </c:when>
                        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.HistoryParamBean'}">
                            <td width="30%" align="right" valign="top"><b id="help_${pNam}" class="help_link" rel="htmltooltip">${qP.prompt}</b></td>
                            <td align="left" valign="top">
                                <wdk:answerParamInput qp="${qP}" />
                            </td>
                        </c:when>
                        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                            <td width="30%" align="right" valign="top"><b id="help_${pNam}" class="help_link" rel="htmltooltip">${qP.prompt}</b></td>
                            <td align="left" valign="top">
                                <wdk:datasetParamInput qp="${qP}" />
                            </td>
                        </c:when>
                        <c:otherwise>  <%-- not enumParam --%>
                            <c:choose>
                                <c:when test="${isReadonly}">
                                    <td width="30%" align="right" valign="top"><b id="help_${pNam}" class="help_link" rel="htmltooltip">${qP.prompt}</b></td>
                                    <td align="left" valign="top">
                                        <bean:write name="qForm" property="myProp(${pNam})"/>
                                        <html:hidden property="myProp(${pNam})"/>
                                    </td>
                                </c:when>
                                <c:otherwise>
                                    <td width="30%" align="right" valign="top"><b id="help_${pNam}" class="help_link" rel="htmltooltip">${qP.prompt}</b></td>
                                    <td align="left" valign="top">
                                        <html:text property="myProp(${pNam})" size="35" />
                                    </td>
                                </c:otherwise>
                            </c:choose>
                        </c:otherwise>
                    </c:choose>

                    <c:if test="${!fn:containsIgnoreCase(pNam,'organism')}">
                        <td width="10%">&nbsp;&nbsp;&nbsp;&nbsp;</td>
                        <td valign="top" width="50" nowrap>
                            <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                            <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
                            <a id="help_${pNam}" class="help_link" href="#" rel="htmltooltip">
                            	<img src="/assets/images/help.png" border="0" alt="Help">
    						</a>
                        </td>
                    </c:if>
                </tr>
            </c:otherwise> <%-- end visible param --%>
        </c:choose>
        
        </c:forEach> <%-- end of forEach params --%>
        
        <%-- detemine ending display style by displayType of the group --%>
        <c:if test="${hasOrganism}"></table></c:if>
        </table>
    
        <%-- prepare the help info --%>
        <c:forEach items="${paramGroup}" var="paramItem">
            <c:set var="pNam" value="${paramItem.key}" />
            <c:set var="qP" value="${paramItem.value}" />
            
            <c:set var="isHidden" value="${qP.isVisible == false}"/>
            <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
    
                <c:if test="${!isHidden}">
                        <c:if test="${!fn:containsIgnoreCase(pNam,'organism')}">
                	        <div class="htmltooltip" id="help_${pNam}_tip">${qP.help}</div>
                        </c:if>
                </c:if>
            
        </c:forEach>
    
        </div> <%-- end of group-detail div --%>
    </div> <%-- end of param-group div --%>

</c:forEach> <%-- end of foreach on paramGroups --%>

