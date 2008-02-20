<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set var="qForm" value="${requestScope.questionForm}"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="headElement">
  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>
  <script src="js/Top_menu.js" type="text/javascript"></script>
  <link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
</c:set>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'ApiDB'}">
	<c:set var="portalsProp" value="${props['PORTALS']}" />
<%--	<c:set var="portalsArr" value="${fn:split(portalsProp,';')}" />
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
	</c:forEach>
--%>
</c:if>


  
<site:header title="${wdkModel.displayName} : ${wdkQuestion.displayName}"
                 banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Question"
                 division="queries_tools"
		 headElement="${headElement}"/>



<script language="JavaScript" type="text/javascript">
<!--

function showParamGroup(group, isShow) 
{
    var groupLink = document.getElementById(group + "_link");
    var groupArea = document.getElementById(group + "_area");

    if (isShow == "yes") {
        groupLink.innerHTML = "<a href=\"#\" onclick=\"return showParamGroup('" + group + "', 'no');\">Hide</a>";
        groupArea.style.display = "block";
    } else {
        groupLink.innerHTML = "<a href=\"#\" onclick=\"return showParamGroup('" + group + "', 'yes');\">Show</a>";
        groupArea.style.display = "none";
    }
     
    return false;
}

//-->
</script>

<c:if test="${wdkModel.displayName eq 'ApiDB'}">
     <div id="question_Form">
</c:if>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form method="post" enctype='multipart/form-data' action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

<!-- show error messages, if any -->
<wdk:errors/>
<c:set var="hasOrganism" value="false"/>
<c:set value="${wdkQuestion.paramMapByGroups}" var="paramGroups"/>
<c:forEach items="${paramGroups}" var="paramGroupItem">
    <c:set var="group" value="${paramGroupItem.key}" />
    <c:set var="paramGroup" value="${paramGroupItem.value}" />
  
    <%-- detemine starting display style by displayType of the group --%>
    <c:set var="groupName" value="${group.displayName}" />
    <c:set var="displayType" value="${group.displayType}" />
    <c:choose>
        <c:when test="${displayType eq 'empty'}">    
            <table border="0">
        </c:when>
        <c:when test="${displayType eq 'ShowHide'}">
            <div style="background: #DEDEDE">
                <hr><b>${groupName}</b>
                <span id="${group.name}_link">
                    <a href="#" onclick="return showParamGroup('${group.name}', 'yes');">Show</a>
                </span>
                <div id="${group.name}_area" style="display:none">
                <table border="0">
                    <tr><td colspan="4">${group.description}</td></tr>
        </c:when>
        <c:otherwise>
            <hr><b>${groupName}</b><br>
            <div>${group.description}</div>
            <table border="0">
        </c:otherwise>
    </c:choose>
    
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
            <c:when test="${isHidden}">
		<c:choose>
		   <c:when test="${fn:containsIgnoreCase(wdkModel.displayName, 'ApiDB')}">
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
		         <c:when test="${fn:contains(pNam,'organism') && wdkModel.displayName eq 'ApiDB'}">
			   <c:set var="hasOrganism" value="true"/>
                           <td width="300" align="left" valign="top" rowspan="${paramCount}" cellpadding="5"><table border="0"><tr>
			   <td ><b>${qP.prompt}&nbsp;&nbsp;&nbsp;</b>
			      <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                              <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
                              <a href="#${anchorQp}">
                              <img valign="bottom" src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a><br>
			      <site:cardsOrgansimParamInput qp="${qP}" portals="${portalsProp}" />
		           </td></tr></table></td><td valign="top" align="center"><table border="0">
                         </c:when>
                        
			    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.FlatVocabParamBean'}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                <site:flatVocabParamInput qp="${qP}" />
                    </td>
                            </c:when>
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                <site:enumParamInput qp="${qP}" />
                    </td>
                            </c:when>
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.HistoryParamBean'}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                <wdk:historyParamInput qp="${qP}" />
                    </td>
                            </c:when>
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                <wdk:datasetParamInput qp="${qP}" />
                    </td>
                            </c:when>
                            <c:otherwise>  <%-- not flatvocab --%>
                                <c:choose>
                                    <c:when test="${isReadonly}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                        <bean:write name="qForm" property="myProp(${pNam})"/>
                                        <html:hidden property="myProp(${pNam})"/>
                    </td>
                                    </c:when>
                                    <c:otherwise>
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                                        <html:text property="myProp(${pNam})" size="35" />
                    </td>
                                    </c:otherwise>
                                </c:choose>
                            </c:otherwise>
                        </c:choose>
                    <c:if test="${pNam != 'organism' && wdkModel.displayName eq 'ApiDB'}">
                    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                    <td valign="top" width="50" nowrap>
                        <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                        <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
                        <a href="#${anchorQp}">
                        <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
                    </td>
		    </c:if>
                </tr>
 
            </c:otherwise> <%-- end visible param --%>
        </c:choose>
        
    </c:forEach>
    
    <%-- detemine ending display style by displayType of the group --%>
    <c:choose>
        <c:when test="${hasOrganism == 'true'}">
 </table></table>
	</c:when>
	<c:otherwise>
    <c:choose>
        <c:when test="${group.name eq 'empty'}">
            </table>
        </c:when>
        <c:when test="${displayType eq 'ShowHide'}">
                </table>
                </div> <%-- show/hide div --%>
            <hr>
            </div>  <%-- group background div --%>
        </c:when>
        <c:otherwise>
            </table>
        </c:otherwise>
    </c:choose>
    	</c:otherwise>
    </c:choose>
</c:forEach>

<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<div align="center"><html:submit property="questionSubmit" value="Get Answer"/></div>
</html:form>

<c:if test="${wdkModel.displayName eq 'ApiDB'}">
	</div><!--End Question Form Div-->
</c:if>

<hr>
<%-- display description for wdkQuestion --%>
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>

<%-- get the attributions of the question if not ApiDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />

</c:if>

 <%-- </td>--%>
  <td valign=top class=dottedLeftBorder></td> 

</tr>
</table> 


<site:footer/>
