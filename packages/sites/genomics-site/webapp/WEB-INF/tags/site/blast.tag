<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>
<c:set var="qForm" value="${requestScope.questionForm}"/>
<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'ApiDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${wdkModel.displayName eq 'ApiDB'}">
     <div id="question_Form">
</c:if>
<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<input id="questionFullName" type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>

<!-- show error messages, if any -->
<wdk:errors/>

<%-- the js has to be included here in order to appear in the step form --%>
<script type="text/javascript" src='<c:url value="/assets/js/wdkQuestion.js"/>'></script>
<script src="/assets/js/blast.js" type="text/javascript"></script>

<c:set var="hasOrganism" value="false"/>
<c:set value="${wdkQuestion.paramMapByGroups}" var="paramGroups"/>
<div class="params">
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
  
		<%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
		  <tr>
		  <c:choose>
		   <c:when test="${pNam eq 'BlastQuerySequence'}">
		   <td align="right" id="parameter_label"><b href="#" id="help_${pNam}" rel="htmltooltip"><jsp:getProperty name="qP" property="prompt"/></b></td>
		  </c:when>
		  <c:otherwise>
		   <td align="right"><b href="#" id="help_${pNam}" rel="htmltooltip"><jsp:getProperty name="qP" property="prompt"/></b></td>
		  </c:otherwise>
		  </c:choose>
		  <%-- Handle database-type parm in HTML, so it can set questionFullName --%>
		  <c:choose>

		<%--    <c:when test="${pNam eq 'BlastDatabaseType'}"> --%>
		    <c:when test="${pNam eq 'BlastAlgorithm'}">
		      <td>

			<c:set var="counter" value="0"/>
		        <c:forEach items="${qP.vocab}" var="flatVoc">
		              <input type="radio" name="algorithm" value="${flatVoc}" id="BlastAlgorithm_${flatVoc}" onClick="changeLabel();checkSequenceLength()" disabled><font id="${flatVoc}_font" color="gray">${flatVoc}</font></input>
			      <c:set var="counter" value="${counter+1}"/>
		       </c:forEach>
		        <input type="hidden" name="myMultiProp(${pNam})" id="blastAlgo"/>
		      </td>
		    </c:when>
		    <c:when test="${pNam eq 'BlastDatabaseOrganism'}">
		      <td>
			<select name="blastOrganism" id="BlastOrganism" multiple="multiple" onChange="updateOrganism()">
		           <option value="-">Select Target Data Type to display appropriate organisms</option>
		        </select><br>
			<input type="button" onClick="selectAll_None(true)" value="All"/>&nbsp;&nbsp;<input onClick="selectAll_None(false)" type="button" value="None"/><br>
		        <input name="myMultiProp(${pNam})" type="hidden" id="blastOrg"/> 



		      </td>
		    </c:when>
		<%--  <c:when test="${pNam eq 'BlastAlgorithm'}"> --%>
		    <c:when test="${pNam eq 'BlastDatabaseType'}">
		     <td>

		       <c:set var="counter" value="0"/>
		       <c:forEach items="${qP.vocab}" var="flatVoc">
		              <input class="blast-type" type="radio" name="type" value="${flatVoc}" id="BlastType_${counter}" 
                                     onClick="getBlastAlgorithm();changeQuestion();checkSequenceLength()" />
                              <span>${flatVoc}</span>
			      <c:set var="counter" value="${counter+1}"/>	
		       </c:forEach>
		       <input type="hidden" name="myMultiProp(${pNam})" id="blastType"/>

		     </td>

		    </c:when>
		    <c:otherwise> <%-- not BlastDatabaseType --%>

		      <%-- choose between enum param and straight text or number param --%>
		      <c:choose>
		        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
		          <td>
		            <wdk:enumParamInput qp="${qP}" />
		          </td>
		        </c:when>
		        <c:otherwise>
		          <td>
		            <c:choose>
		              <c:when test="${pNam == 'BlastQuerySequence'}">
		                  <html:textarea property="myProp(${pNam})" styleId="sequence" cols="50" rows="4" onchange="checkSequenceLength()"/>
				  <br>

		              </td> 
			      </c:when>
		              <c:when test="${pNam == '-e'}">
		                  <html:text property="myProp(${pNam})" styleId="e"/></td>
		              </c:when>
		              <c:otherwise>
		                <html:text property="myProp(${pNam})" styleId="${qP.id}" /></td>
		              </c:otherwise>
		            </c:choose>
		          <!--</td>-->
		        </c:otherwise>
		      </c:choose>

		    </c:otherwise> <%-- not BlastDatabaseType --%>
		  </c:choose>

		      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
		      <td>
		          <a href="#" id="help_${pNam}" rel="htmltooltip">
		          <img src="/assets/images/help.png" border="0" alt="Help"></a>
		      </td>
		  </tr>
       


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

</div> <%-- end of params div --%>

<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>
<span id="short_sequence_warning" style="display: none;
								background: url('/images/text_bubble.png'); 
								font-size: 12px; 
								height: 66px; 
								left: 369px; 
								padding-left: 40px; 
								padding-top: 12px; 
								position: relative; 
								top:-243px; 
								width: 360px;
			"></span>
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
<%-- site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" /--%>

</c:if>

 <%-- </td>--%>
  <td valign=top class=dottedLeftBorder></td> 

</tr>
</table> 

