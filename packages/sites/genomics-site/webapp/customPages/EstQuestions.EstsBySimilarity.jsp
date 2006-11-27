<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<site:header title="${wdkModel.displayName} : BLAST"
                 banner="${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="BLAST"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<p><b>${wdkQuestion.displayName}</b></p>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<!-- put an anchor here for linking back from help sections -->
<A name="${fromAnchorQ}"></A>
<html:form method="post" action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
<table>

<!-- show error messages, if any -->
<wdk:errors/>

<c:set value="${wdkQuestion.params}" var="qParams"/>
<c:forEach items="${qParams}" var="qP">

  <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
  <c:set value="${qP.name}" var="pNam"/>
  <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>
    
  <%-- choose between flatVocabParam and straight text or number param --%>
  <c:choose>
    <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.FlatVocabParamBean'}">
      <td>
        <site:flatVocabParamInput qp="${qP}" />
      </td>
    </c:when>
    <c:otherwise>
      <td>
        <c:choose>
          <c:when test="${pNam == 'BlastQuerySequence'}">
            <html:textarea property="myProp(${pNam})" styleId="${qP.id}" cols="50" rows="4"/>
          </c:when>
          <c:otherwise>
            <html:text property="myProp(${pNam})" styleId="${qP.id}" />
          </c:otherwise>
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
</c:forEach>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td><html:hidden property="altPageSize" value="1000000"/></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td></tr>
</table>
</html:form>

<hr>

<%-- display description for wdkQuestion --%>
<p><b>Query description:</b> <jsp:getProperty name="wdkQuestion" property="description"/></p>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
