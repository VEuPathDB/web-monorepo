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
  <script src="js/ApidbAjax.js" type="text/javascript"></script>
</c:set>

<c:set var="bodyElement">
onLoad="ac = new ajaxControl('showRecord.do?name=UtilityRecordClasses.PfamTermList.jsp&id=%20', 'searchBox', 'dataArea', '100' ); ac.loadData();"
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


<c:set value="${wdkQuestion.params}" var="qParams"/>
<c:forEach items="${qParams}" var="qP">
  <c:set var="isHidden" value="${qP.isVisible == false}"/>
  <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
  <c:set var="pNam" value="${qP.name}"/>

  <!-- hide invisible params -->
  <c:choose>
  <c:when test="${isHidden or qP.name eq pfamTermParam.name }">
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

<%-- multiPick is true, use checkboxes or scroll pane --%>
            <c:choose>
              <c:when test="${fn:length(qP.vocab) < 15}">
                 <c:set var="i" value="0"/>
                 <table border="1" cellspacing="0"><tr><td>
                 <c:forEach items="${qP.vocab}" var="flatVoc">
                    <c:if test="${i == 0}"><c:set var="checked" value="checked"/></c:if>
                    <c:if test="${i > 0}"><br></c:if>
                    <html:multibox property="myMultiProp(${pNam})"
                                   value="${flatVoc}"/>${flatVoc}&nbsp;
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

<%--
            <!-- multiPick is true, use scroll pane -->
            <html:select  property="myMultiProp(${pNam})" multiple="1">
              <c:set var="opt" value="${opt+1}"/>
              <c:set var="sel" value=""/>
              <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
              <html:options property="values(${pNam})" labelProperty="labels(${pNam})"/>
            </html:select>
          </c:when>
--%>

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
            size="60" 
            maxlength="120"
            onKeyUp="ac.check_typeahead_list();">
    </td>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
        <td>
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pfamTermParam.name}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${pfamTermParam}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/images/toHelp.jpg"/>' border="0" alt="Help!"></a>
         </td>

</tr>

  </c:otherwise></c:choose>
</c:forEach>
<tr><td colspan='4' align="center"><div align="left" id="dataArea"></div></td></tr>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
</table>


</html:form>

<hr>



<!-- display description for wdkQuestion -->
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>
As a guide, the list above shows the subset of Pfam families found in ${wdkModel.displayName} (CryptoDB, PlasmoDB or ToxoDB).By typing a few letters in the Pfam Term field the list will update to show Pfam Descriptions that contain those letters. You may click an item in the list to enter it into the term field.
  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 


    <!-- Pfam Typeahead Area -->
      <div id="storageArea" style="display:none"></div>


<site:footer/>
