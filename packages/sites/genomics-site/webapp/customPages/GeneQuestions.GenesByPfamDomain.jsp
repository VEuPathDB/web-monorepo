<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<c:set var="gidqpMap" value="${wdkQuestion.paramsMap}"/>
<c:set var="pfamTermParam" value="${gidqpMap['pfam_term']}"/>

<jsp:useBean scope="request" id="helps" class="java.util.HashMap"/>

<c:set value="${requestScope.questionForm}" var="qForm"/>

<!-- display page header with wdkQuestion displayName as banner -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>


<c:set var="headElement">
  <script src="js/pfamTypeahead.js" type="text/javascript"></script>
</c:set>

<c:set var="bodyElement">
	onLoad="loadData();"
</c:set>
<site:header title="${wdkModel.displayName} : Queries"
                 banner="${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Question"
                 division="queries_tools"
		 headElement="${headElement}"
		 bodyElement="${bodyElement}"/>



<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<p><b>${wdkQuestion.displayName}</b></p>

<!-- show all params of question, collect help info along the way -->
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.HashMap"/>

<!-- put an anchor here for linking back from help sections -->
<A name="${fromAnchorQ}"></A>
<html:form method="get" action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
<table>

<!-- show error messages, if any -->
<wdk:errors/>


<tr>		
	<td>
		<b>${pfamTermParam.prompt}</b>
	</td>
	<td>
			<input class="form_box" 
			id="searchBox" 
			value="${pfamTermParam.default}" 
			type="text" 
			name="myProp(${pfamTermParam.name})" 
			size="26" 
			maxlength="90"
			onClick="this.value=''" 
			onKeyUp="check_typeahead_list();">
	</td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td>
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pfamTermParam.name}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${pfamTermParam}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
         </td>

</tr>


<c:set value="${wdkQuestion.params}" var="qParams"/>
<c:forEach items="${qParams}" var="qP">
  <c:set var="isHidden" value="${qP.isVisible == false}"/>
  <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  <c:set var="pNam" value="${qP.name}"/>

  <!-- hide invisible params -->
  <c:choose>
  <c:when test="${isHidden}">
  </c:when>
  <c:otherwise>

  <!-- an individual param (can not use fullName, w/ '.', for mapped props) -->
  <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>

  <!-- choose between flatVocabParam and straight text or number param -->
  <c:choose>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.FlatVocabParamBean'}">
      <td>
        <c:set var="opt" value="0"/>

        <c:choose>
          <c:when test="${qP.multiPick}">
            <!-- multiPick is true, use scroll pane -->
            <html:select  property="myMultiProp(${pNam})" multiple="1">
              <c:set var="opt" value="${opt+1}"/>
              <c:set var="sel" value=""/>
              <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
              <html:options property="values(${pNam})" labelProperty="labels(${pNam})"/>
            </html:select>
          </c:when>
          <c:otherwise>
            <!-- multiPick is false, use pull down menu -->
            <html:select  property="myMultiProp(${pNam})">
              <c:set var="opt" value="${opt+1}"/>
              <c:set var="sel" value=""/>
              <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
              <html:options property="values(${pNam})" labelProperty="labels(${pNam})"/>
            </html:select>
          </c:otherwise>
        </c:choose>
      </td>
    </c:when>
    <c:otherwise>
      <td><c:choose>
              <c:when test="${isReadonly}">
                  <bean:write name="qForm" property="myProp(${pNam})"/>
                  <html:hidden property="myProp(${pNam})"/>
              </c:when>
              <c:otherwise><html:text property="myProp(${pNam})"/></c:otherwise>
          </c:choose>
      </td>
    </c:otherwise>
  </c:choose>

      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
      </td>
  </tr>

  </c:otherwise></c:choose>
</c:forEach>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
</table>


</html:form>

<hr>

			<div align="left" id="dataArea"></div>


<!-- display description for wdkQuestion -->
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>
The list below shows the subset of Pfam families found in ${wdkModel.displayName}. To search it, Expand All and use your web browser's Find function.
  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 


	<!-- Pfam Typeahead Area -->
	  <div id="storageArea" style="display:none"></div>


<site:footer/>
