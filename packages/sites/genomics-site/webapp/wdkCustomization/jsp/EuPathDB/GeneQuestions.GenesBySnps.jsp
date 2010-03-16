<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set value="${requestScope.questionForm}" var="qForm"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="used_sites" value="${applicationScope.wdkModel.properties['SITES']}"/>

<c:set var="headElement">
  
  <script src="/assets/js/AjaxSnp.js" type="text/javascript"></script>
  <script>
	initGeneSNP();
  </script>
  
</c:set>
<site:header title="${wdkModel.displayName} : ${wdkQuestion.displayName}"
                 banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Question"
                 division="queries_tools"
		refer="customQuestion" 
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



<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

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
<table>

<!-- show error messages, if any -->
<wdk:errors/>

<%-- REMOVED to deal with adavnced params 
<c:set value="${wdkQuestion.params}" var="qParams"/>

<c:forEach items="${qParams}" var="qP">
--%>

<%-- ADDED to deal with adavnced params --%>

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

<%--- END OF ADDED --%>

  <c:set var="isHidden" value="${qP.isVisible == false}"/>
  <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
<%--  <c:set var="pNam" value="${qP.name}"/> --%>
  
  <%-- hide invisible params --%>
  <c:choose>
  <c:when test="${isHidden}"><html:hidden property="myProp(${pNam})"/></c:when>
  <c:otherwise>

  <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
  <tr><td align="right" valign="top"><b><jsp:getProperty name="qP" property="prompt"/></b></td>

  <%-- choose between enum param and straight text or number param --%>
  <c:choose>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
      <td >
         <c:choose>
	        <c:when test="${pNam eq 'organism'}">
	          <select id="orgSelect" onchange="loadStrains()">
		      <option value="--">---Choose Organism---</optioin>
                      <!--  
		      <option value="Cp">Cryptosporidium parvum</optioin>
                      <option value="Pf">Plasmodium falciparum</optioin>
		      <option value="Tg">Toxoplasma gondii</optioin>
		      -->
                  </select>
		        <input name="myProp(${pNam})" type="hidden" id="myOrg"/>
            </c:when>
	        <c:when test="${pNam eq 'snp_strain_a'}">
	          <select name="myMultiProp(${pNam})" id="StrainA" >
                      
                  </select>
            </c:when>
            <c:when test="${pNam eq 'snp_strain_m'}">
	          <select name="myMultiProp(${pNam})" id="StrainB">
                     
                  </select>
            </c:when>
            <c:otherwise>
		        <wdk:enumParamInput qp="${qP}" />
            </c:otherwise>
         </c:choose>
      </td>
    </c:when>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.AnswerParamBean'}">
      <td>
            <wdk:answerParamInput qp="${qP}" />
      </td>
    </c:when>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.DatasetParamBean'}">
      <td>
            <wdk:datasetParamInput qp="${qP}" />
      </td>
    </c:when>
    <c:otherwise>  <%-- string param --%>
      <td><c:choose>
              <c:when test="${isReadonly}">
                  <bean:write name="qForm" property="myProp(${pNam})"/>
                  <html:hidden property="myProp(${pNam})"/>
              </c:when>
              <c:otherwise>
			<html:text property="myProp(${pNam})" size="35" />
		</c:otherwise>
          </c:choose>
    </c:otherwise>
  </c:choose>
 </td>



      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td valign="top">
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
      </td>
  </tr>

  </c:otherwise> <%-- end visible param --%>
</c:choose>

<%-- ADDED to deal with adavnced params --%>

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


<%-- END OF ADDED to deal with adavnced params --%>

</c:forEach>


<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
</table>
</html:form>

<hr>
<%-- display description for wdkQuestion --%>
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 


<div id="data_div"></div>

<site:footer/>
