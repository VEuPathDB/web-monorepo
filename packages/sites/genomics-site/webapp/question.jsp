<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${requestScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.HashMap"/>

<!-- display page header with wdkQuestion displayName as banner -->
<site:header banner="${wdkQuestion.displayName}" />

<!-- display description for wdkQuestion -->
<p><b><jsp:getProperty name="wdkQuestion" property="description"/></b></p>

<hr>

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

  <!-- an individual param (can not use fullName, w/ '.', for mapped props) -->
    <c:set var="pNam" value="${paramItem.key}" />
    <c:set var="qP" value="${paramItem.value}" />
    <c:set var="isHidden" value="${qP.isVisible == false}"/>
    <c:set var="isReadonly" value="${qP.isReadonly == true}"/>
    
    <tr><td align="right"><b><jsp:getProperty name="qP" property="prompt"/></b></td>

    <!-- choose between flatVocabParam and straight text or number param -->
    <choose>
        <c:when test="${isHidden}">
            <html:hidden property="myProp(${pNam})"/>
        </c:when>
        <c:otherwise>
            <c:choose>
                <c:when test="${qP.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
                    <td align="right" valign="top"><b>${qP.prompt}</b></td>
                    <td valign="top">
                        <wdk:enumParamInput qp="${qP}" />
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
         </c:otherwise>
      </c:choose>

      <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td>
          <c:set var="anchorQp" value="HELP_${fromAnchorQ}_${pNam}"/>
          <c:set target="${helpQ}" property="${anchorQp}" value="${qP}"/>
          <a href="#${anchorQp}">
          <img src='<c:url value="/assets/images/help.png"/>' border="0" alt="Help!"></a>
      </td>
  </tr>
</c:forEach>
<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

  <tr><td></td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td>
      <td><html:submit property="questionSubmit" value="Expand Question"/></td>
</table>
</html:form>



<site:footer/>
