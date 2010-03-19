<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set var="qForm" value="${requestScope.questionForm}"/>
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
        <c:set var="recordType" value="Transcript Assemblie" />
</c:if>

${Question_Header}

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

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>


<c:choose>
    <c:when test="${showParams == true}">
        <%-- display params section only --%>
        <html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
            <input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
            <jsp:include page="GeneQuestions.GenesByLocation.partial.jsp" />
        </html:form>
    </c:when>
    <c:otherwise>
        <%-- display question section --%>


<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>



<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<script id="import_script" src="/assets/js/AjaxLocation.js" type="text/javascript"></script>
<script id="initscript" language="javascript">
	initLocation();
</script>

<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

<!-- show error messages, if any -->
<api:errors/>

<%-- this comes from question.tag,   --%>
<script type="text/javascript" src='<c:url value="/w
dk/js/wdkQuestion.js"/>'></script>
<c:if test="${showParams == null}">
            <script type="text/javascript">
              $(document).ready(function() { initParamHandlers(); });
            </script>
</c:if>



<div class="params">

<%-- comes from question.tag ..... this first if is close at the end --%>
<c:if test="${showParams == null}">

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
    <%-- display parameter list --%>



    <c:forEach items="${paramGroup}" var="paramItem">
        <c:set var="pNam" value="${paramItem.key}" />
        <c:set var="qP" value="${paramItem.value}" />
        
        <c:set var="isHidden" value="${qP.isVisible == false}"/>
        <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  
        <%-- hide invisible params --%>
        <c:choose>
            <c:when test="${isHidden}">
		<c:choose>
		   <c:when test="${fn:containsIgnoreCase(wdkModel.displayName, 'EuPathDB')}">
			<c:choose>
		   		<c:when test="${pNam eq 'signature'}">
					<html:hidden property="myProp(${pNam})" value="${wdkUser.signature}"/>
		   		</c:when>
		   		<c:otherwise>
		    			<html:hidden property="myProp(${pNam})" styleId="${pNam}"/>
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
		   <c:if test="${pNam != 'chromosomeOptional'}"> <c:if test="${pNam != 'organism'}">
			<td align="right" valign="top"><b>${qP.prompt}</b></td>
		   </c:if></c:if>
                   <td>
                        <%-- choose between enum param and straight text or number param --%>
                        <c:choose>
			   
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
				<c:choose>
					<c:when test="${pNam eq 'organism' || pNam eq 'chromosomeOptional'}">
						<input name="myProp(${pNam})" id="${pNam}" type="hidden"/>
                            		</c:when>
					<c:otherwise> 
                                		<wdk:enumParamInput qp="${qP}" />
					</c:otherwise>
				</c:choose>
                            </c:when>
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.AnswerParamBean'}">
                                <wdk:answerParamInput qp="${qP}" />
                            </c:when>
                            <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
                                <wdk:datasetParamInput qp="${qP}" />
                            </c:when>
                            <c:otherwise>  <%-- string param --%>
                                <c:choose>
                                    <c:when test="${isReadonly}">
                                        <bean:write name="qForm" property="myProp(${pNam})"/>
                                        <html:hidden property="myProp(${pNam})"/>
                                    </c:when>
                                    <c:otherwise>
					<c:choose>  
						<c:when test="${pNam eq 'chromosomeOptional'}">
							<input name="myProp(${pNam})" id="${pNam}" type="hidden"/>
                            			</c:when> 
						<c:when test="${pNam == 'sequenceId'}">
							<input name="myProp(${pNam})" id="${pNam}" type="hidden" />
							<table border="0" bgcolor="#EEEEEE" cellspacing="0" cellpadding="0">
							<!-- display an input box for user to enter data -->
							   <tr>
							        <td align="left" valign="top" nowrap>
							            <input type="radio" name="${pNam}_radio" 
							                   ${(dataset == null)? "checked" : ""}
							                   onclick="chooseType('${pNam}', 'CHROMOSOME')" />
								            Organism:&nbsp;
								</td>
							        <td align="left">
							            <select id="orgSelect" onchange="loadStrains()">
									<option value="--">---Choose Organism---</option>
								    </select>
								</td>
							   </tr>
							   <tr>
							         <td>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Chromosomes:&nbsp;
							         </td>
							         <td>
							       	        <select name="CHRO" id="${pNam}_chromo" onchange="updateSelectInput('chromosomeOptional', '${pNam}_chromo')">
										<option value="--">--</option>
									</select>
							         </td>
							   </tr>
							   <tr>
							         <td align="left" valign="top" nowrap>
							                <input type="radio" name="${pNam}_radio"  
							                   onclick="chooseType('${pNam}', 'CONTIG')" />
								            Genomic Sequence Id:&nbsp;
							         </td>
							         <td align="left">
        <input name="CONT" id="${pNam}_contig" size="35" onchange="updateTextInput('${pNam}', '${pNam}_contig')" onblur = "updateTextInput('${pNam}', '${pNam}_contig')" />
							         </td>
							   </tr>
							</table>
						</c:when>
						<c:otherwise>
							<html:text property="myProp(${pNam})" size="35" />
						</c:otherwise>
					</c:choose>
                                    </c:otherwise>
                                </c:choose>
                            </c:otherwise>
                        </c:choose>
                    </td>


		<c:if test="${pNam != 'chromosomeOptional'}">	<c:if test="${pNam != 'organism'}">
                    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                    <td valign="top" width="50" nowrap>
                        <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                        <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
                        <a href="#${anchorQp}">
                        <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
                    </td></c:if></c:if>
                </tr>
 
            </c:otherwise> <%-- end visible param --%>
        </c:choose>
        
    </c:forEach>
    
    <%-- detemine ending display style by displayType of the group --%>
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
    
</c:forEach>



<%-- set the weight --%>

<div name="All_weighting" class="param-group" type="ShowHide">
	<c:set var="display" value="none"/>
	<c:set var="image" value="plus.gif"/>
	<div class="group-title">
    		<img style="position:relative;top:5px;"  class="group-handle" src='<c:url value="/images/${image}" />' />
    			Give this search a weight
	</div>
	<div class="group-detail" style="display:${display};text-align:center">
    		<div class="group-description">
			<p><input type="text" name="weight" value="0">  </p> 
			<p>Optionally give this search a "weight" (for example 10, 200, -50).<br>In a search strategy, unions and intersects will sum the weights, giving higher scores to items found in multiple searches. </p>
	
    		</div><br>
	</div>
</div>



</c:if>    <%--  <c:if test="${showParams == null}"> --%>
</div>     <%-- end of params div --%>



<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>


<div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>


<script language="javascript">
	chooseType('sequenceId','CHROMOSOME');
</script>


</html:form>



<hr>

<%-- display description for wdkQuestion --%>
<div id="${descripId}"><b>Description: </b><jsp:getProperty name="wdkQuestion" property="description"/></div>



</td>
</tr>
</table> 



</c:otherwise> <%-- otherwise of showParams == true --%>
</c:choose>

${Question_Footer}

