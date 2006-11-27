<%-- 
Provides form input element for a given FlatVocbParam.

For a multi-selectable parameter a form element is provided as either a 
series of checkboxes or a multiselect menu depending on number of 
parameter options. Also, if number of options is over a threshhold, this tag
includes a checkAll button to select all options for the parameter.

Otherwise a standard select menu is used.
--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="qp"
              type="org.gusdb.wdk.model.jspwrap.FlatVocabParamBean"
              required="true"
              description="parameter name"
%>

<c:set var="qP" value="${qp}"/>
<c:set var="pNam" value="${qP.name}"/>
<c:set var="opt" value="0"/>

<c:choose>
<c:when test="${qP.multiPick}">
  <%-- multiPick is true, use checkboxes or scroll pane --%>
  <c:choose>
    <c:when test="${fn:length(qP.vocab) < 15}"><%-- use checkboxes --%>
      <c:set var="i" value="0"/>
      <table border="1" cellspacing="0"><tr><td>
      <c:forEach items="${qP.vocab}" var="flatVoc">
        <c:if test="${i == 0}"><c:set var="checked" value="checked"/></c:if>
        <c:if test="${i > 0}"><br></c:if>
        
        <c:choose>
        <%-- test for param labels to italicize --%>
        <c:when test="${pNam == 'organism' or pNam == 'ecorganism'}">
          <html:multibox property="myMultiProp(${pNam})" value="${flatVoc}" styleId="${qP.id}" />
          <i>${flatVoc}</i>&nbsp;
        </c:when>
    <c:otherwise> <%-- use multiselect menu --%>
          <html:multibox property="myMultiProp(${pNam})" value="${flatVoc}" styleId="${qP.id}" />
          ${flatVoc}&nbsp;
        </c:otherwise>
        </c:choose> 
        
        <c:set var="i" value="${i+1}"/>
        <c:set var="checked" value=""/>
      </c:forEach>
  
      <%@ include file="/WEB-INF/includes/selectAllParamOpt.jsp" %>
      
      </td>
      </tr>
      </table>
    </c:when>
    <c:otherwise>
      <html:select  property="myMultiProp(${pNam})" multiple="1" styleId="${qP.id}">
        <c:set var="opt" value="${opt+1}"/>
        <c:set var="sel" value=""/>
        <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
        <html:options property="values(${pNam})" labelProperty="labels(${pNam})" />
      </html:select>
  
      <%@ include file="/WEB-INF/includes/selectAllParamOpt.jsp" %>
  
    </c:otherwise>
</c:choose>
</c:when>
<c:otherwise>
  <%-- multiPick is false, use pull down menu --%>
  <html:select  property="myMultiProp(${pNam})" styleId="${qP.id}">
    <c:set var="opt" value="${opt+1}"/>
    <c:set var="sel" value=""/>
    <c:if test="${opt == 1}"><c:set var="sel" value="selected"/></c:if>      
    <html:options property="values(${pNam})" labelProperty="labels(${pNam})"/>
  </html:select>
</c:otherwise>
</c:choose>
