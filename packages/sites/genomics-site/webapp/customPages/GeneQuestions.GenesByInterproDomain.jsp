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

<c:set var="headElement">
  <script src="js/AjaxInterpro.js" type="text/javascript"></script>
  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>
</c:set>

<site:header title="${wdkModel.displayName} : ${wdkQuestion.displayName}"
             banner="Identify ${wdkQuestion.recordClass.type}s based on ${wdkQuestion.displayName}"
             parentDivision="Queries & Tools"
             parentUrl="/showQuestionSetsFlat.do"
             divisionName="Question"
             division="queries_tools"
             headElement="${headElement}"/>

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
  <c:when test="${isHidden}"><html:hidden property="myProp(${pNam})"/></c:when>
  <c:otherwise>
    
  <%-- an individual param (can not use fullName, w/ '.', for mapped props) --%>
  <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>
    
  <%-- choose between flatVocabParam and straight text or number param --%>
  <c:choose>
    <c:when test="${pNam eq 'domain_database'}">
      <td>
      <select name="myMultiProp(domain_database)" id="domain_database_list" onChange="loadSelectedData();">
          <c:forEach items="${qP.vocab}" var="flatVoc">
              <option value="${flatVoc}">${flatVoc}</option>
          </c:forEach>
      </select>
      </td>
    </c:when>
    <c:when test="${pNam eq 'domain_accession'}">
          <td>
          <input type="text" id="searchBox" name="myMultiProp(${pNam})" size="50" class="form_box"/>
          </td>
    </c:when>
    <c:otherwise>
    
      <c:choose>
        <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.FlatVocabParamBean'}">
          <td>
            <c:set var="opt" value="0"/>
    
            <c:choose>
              <c:when test="${qP.multiPick}">
                <%-- multiPick is true, use checkboxes or scroll pane --%>
                <c:choose>
                  <c:when test="${fn:length(qP.vocab) < 15}">
                     <c:set var="i" value="0"/>
                     <table border="1" cellspacing="0"><tr><td>
                     <c:forEach items="${qP.vocab}" var="flatVoc">
                        <c:if test="${i == 0}"><c:set var="checked" value="checked"/></c:if>
                        <c:if test="${i > 0}"><br></c:if>
    
                        <c:choose>
                        <c:when test="${pNam == 'organism' or pNam == 'ecorganism'}">
                            <html:multibox property="myMultiProp(${pNam})" value="${flatVoc}"/>
    			    <i>${flatVoc}</i>&nbsp;
    		    </c:when>
                        <c:otherwise>
                            <html:multibox property="myMultiProp(${pNam})" value="${flatVoc}"/>
    			    ${flatVoc}&nbsp;
    		    </c:otherwise>
                        </c:choose>	
    
                         <c:set var="i" value="${i+1}"/>
                         <c:set var="checked" value=""/>
                     </c:forEach>
                     </td></tr></table>
                  </c:when>
                  <c:otherwise>
                <html:select  property="myMultiProp(${pNam})" multiple="1">
                  <c:set var="opt" value="${opt+1}"/>
                  <c:set var="sel" value=""/>
                  <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
                  <html:options property="values(${pNam})" labelProperty="labels(${pNam})"/>
                </html:select>
                  </c:otherwise>
                </c:choose>
              </c:when>
              <c:otherwise>
                <%-- multiPick is false, use pull down menu --%>
                ERROR: can't handle multpick for "${pNam}" in "GenesByProteinDomain!"
              </c:otherwise>
            </c:choose>
          </td>
        </c:when>
        <c:otherwise>  <%-- not flatvocab --%>
          <td><c:choose>
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

 <div id="searchBoxupdate"
      style="display:none;border:1px solid black;background-color:white;height:125px;overflow:auto;"></div>

</html:form>

<hr>
<%-- display description for wdkQuestion --%>
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 


<site:footer/>
