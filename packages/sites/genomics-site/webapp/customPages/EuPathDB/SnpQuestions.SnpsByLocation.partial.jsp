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
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>

<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<c:if test="${showParams == false || showParams == null}">
  <script src="/assets/js/AjaxSnpLocation.js" type="text/javascript"></script>
  <script id="initscript" language="javascript">
	initSNPLoc();
  </script>
</c:if>
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
<table>

<!-- show error messages, if any -->
<wdk:errors/>

<c:set value="${wdkQuestion.params}" var="qParams"/>
<div class="params">
<c:if test="${showParams == true || showParams == null}">
<c:forEach items="${qParams}" var="qP">
  <c:set var="isHidden" value="${qP.isVisible == false}"/>
  <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  <c:set var="pNam" value="${qP.name}"/>
  
  <%-- hide invisible params --%>
  <c:choose>
  <c:when test="${isHidden}"><html:hidden property="myProp(${pNam})"/></c:when>
  <c:otherwise>

  <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
  <tr><td align="right" valign="top"><b><jsp:getProperty name="qP" property="prompt"/></b></td>

  <%-- choose between enum param and straight text or number param --%>
  <c:choose>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
      <td>
         <c:choose>
	        <c:when test="${pNam eq 'organism'}">
		      <input name="myMultiProp(${pNam})" id="orgText" type="hidden"/>
	          <select id="orgSelect" onchange="changeLists()">
		      <option value="--">---Choose Organism---</option>
		      <!--
                      <option value="Plasmodium falciparum">Plasmodium falciparum</option>
		      <option value="Toxoplasma gondii">Toxoplasma gondii</option>
		      -->
                  </select>
            </c:when>
	        <c:when test="${pNam eq 'snp_strain_a'}">
	          <select name="myMultiProp(${pNam})" id="StrainA" >
                      
                  </select>
            </c:when>
	    
            <c:when test="${pNam eq 'snp_strain_m'}">
	          <select name="myMultiProp(${pNam})" multiple='multiple' id="StrainM">
                     
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
		<c:choose>  
			<c:when test="${pNam eq 'chromosomeOptional'}">
				<input name="myProp(${pNam})" id="${pNam}" type="hidden"/>
                                <select name="chromo" id="chromoSelect" onchange="updateSelectInput('chromosomeOptional','chromoSelect')">
                        </c:when>
			<c:otherwise> 
				<html:text property="myProp(${pNam})" size="35" />
			</c:otherwise>
		</c:choose>
	      </c:otherwise>
          </c:choose>
      </td>
    </c:otherwise>
  </c:choose>

      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td valign="top">
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
      </td>
  </tr>

  </c:otherwise></c:choose>

</c:forEach>
</c:if></div>

<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td></td>
      <c:if test="${showParams == false || showParams == null}"> <td><html:submit property="questionSubmit" value="Get Answer"/></td></c:if>
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
