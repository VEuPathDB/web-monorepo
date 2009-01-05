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
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="headElement">
  <script src="js/AjaxInterpro.js" type="text/javascript"></script>
  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>
  <script src="js/Top_menu.js" type="text/javascript"></script>
  <link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
  <style type="text/css">
      div.searchBoxupdate ul {
      margin:0px;
      padding:0px;
    }
    div.searchBoxupdate ul li {
      display:block;
      margin:0;
      padding:2px;
      cursor:pointer;
    }
    div.searchBoxupdate ul li.selected { 
      background-color: #666; 
      color:#FFFFFF}
  </style>
</c:set>

<c:if test="${wdkModel.displayName eq 'ApiDB'}">
	<c:set var="portalsProp" value="${props['PORTALS']}" />
<%--	<c:set var="portalsArr" value="${fn:split(portalsProp,';')}" />
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
	</c:forEach>
--%>
</c:if>
<site:home_header refer="interproQuestion" />
<site:menubar />
<%--
<site:header title="${wdkModel.displayName} : ${wdkQuestion.displayName}"
             banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
             parentDivision="Queries & Tools"
             parentUrl="/showQuestionSetsFlat.do"
             divisionName="Question"
             division="queries_tools"
             headElement="${headElement}"/>
--%>
<div id="contentwrapper">
  <div id="contentcolumn2">
    <div class="innertube">

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<html:form method="get" action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
<table>

<!-- show error messages, if any -->
<wdk:errors/>

<c:set value="${wdkQuestion.params}" var="qParams"/>
<c:forEach items="${qParams}" var="qP">
  <c:set var="isHidden" value="${qP.isVisible == false}"/>
  <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  <c:set var="pNam" value="${qP.name}"/>

  <%-- hide invisible params --%>
  <c:choose>
  <c:when test="${isHidden}">
     <c:choose>
       <c:when test="${pNam eq 'domain_database'}">
          <input type="hidden" name="myProp(${pNam})" id="domain_database_list" value="${qP.default}" />
          <script type="text/javascript">loadSelectedData();</script>
       </c:when>
       <c:otherwise>
         <html:hidden property="myProp(${pNam})"/>
       </c:otherwise>
     </c:choose>
  </c:when>
  <c:otherwise>
    
    <c:set var="paramCount" value="${fn:length(paramGroup)}"/>

  <%-- an individual param (can not use fullName, w/ '.', for mapped props) 
  <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>--%>
    
  <%-- choose between enum param and straight text or number param --%>
  <c:choose>
    <c:when test="${pNam eq 'domain_database'}">
      <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td><td>
      <select name="myMultiProp(domain_database)" id="domain_database_list" onChange="loadSelectedData();">
          <c:forEach items="${qP.vocab}" var="flatVoc">
              <option value="${flatVoc}">${flatVoc}</option>
          </c:forEach>
      </select>
      </td>

      <%-- reload term list on back button --%>
      <script type="text/javascript">
      if ( document.getElementById('domain_database_list').selectedIndex != 0 ) loadSelectedData();
      </script>

    </c:when>
    <c:when test="${pNam eq 'domain_accession'}">
          <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td><td>
          <input type="text" id="searchBox" name="myProp(${pNam})" size="50" class="form_box"/>
          </td>
    </c:when>
    <c:otherwise>
    <tr>
      <c:choose> 
        <c:when test="${fn:contains(pNam,'organism') && wdkModel.displayName eq 'ApiDB'}">
                    <td width="300" align="left" valign="top" rowspan="${paramCount}" cellpadding="5"><b>${qP.prompt}&nbsp;&nbsp;&nbsp;</b>
			<c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
                        <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
                        <a href="#${anchorQp}">
                        <img valign="bottom" src="/assets/images/help.png" border="0" alt="Help"></a><br>
				<site:cardsOrgansimParamInput qp="${qP}" portals="${portalsProp}" />
		    </td> </tr></table></td><td valign="top" align="center"><table border="0">
        </c:when>
        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
          <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td><td>
            <wdk:enumParamInput qp="${qP}" />
          </td>
        </c:when>
        <c:otherwise>  <%-- not enum param --%>
          <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td><td><c:choose>
                  <c:when test="${isReadonly}">
                      <bean:write name="qForm" property="myProp(${pNam})"/>
                      <html:hidden property="myProp(${pNam})"/>
                  </c:when>
                  <c:otherwise>
    <%--<html:text property="myProp(${pNam})" size="35" class="form_box"/> --%>
                      <input type="text" id="searchBox" name="myProp(${pNam})" size="50" class="form_box"/>
                  </c:otherwise>
              </c:choose>
          </td>
        </c:otherwise>
      </c:choose>
      </c:otherwise></c:choose>
      <c:if test="${pNam != 'organism' && wdkModel.displayName eq 'ApiDB'}">
          <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
          <td>
              <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
              <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
              <a href="#${anchorQp}">
              <img src="/assets/images/help.png" border="0" alt="Help"></a>
          </td>
      </c:if>
      </tr>
    
    </c:otherwise></c:choose>

</c:forEach>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>
</table> 
  <tr><td></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
</table>

				<!-- onKeyDown="safariDownFix( event, 'searchBoxupdate');" -->
 <div id="searchBoxupdate"
      class="searchBoxupdate"
      style="display:none;border:1px solid black;background-color:white;height:125px;overflow:auto;">
 </div>

</html:form>

<hr>
<%-- display description for wdkQuestion --%>
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>


<%-- get the attributions of the question if not ApiDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />
</c:if>

<%--  </td> --%>

  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table>

    </div>
  </div>
</div>

<site:footer/>
