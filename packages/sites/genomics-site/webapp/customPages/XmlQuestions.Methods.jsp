<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : ${banner}"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Methods"
                 division="methods"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 
These are the methods we used to generate/analyze the data in our queries.<br><hr>

 <tr>
  <td bgcolor=white valign=top>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->

<c:set var="i" value="1"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">

  <table border="0" cellpadding="2" cellspacing="0" width="100%">


  <c:if test="${i > 1}">
    <tr><td colspan="2"><hr></td></tr>
  </c:if>

  <c:forEach items="${record.attributes}" var="attr">
    <tr class="rowLight"><td valign="top"><b>${attr.displayName}</b><td>${attr.value}</td></tr>
  </c:forEach>

  <c:set var="tbls" value="${record.tables}"/>
  <c:forEach items="${tbls}" var="tbl">
    <c:set var="tblNam" value="${tbl.displayName}"/>
    <tr><td valign="top"><b>${tblNam}</b></td>
        <td><table border="0" cellpadding="2" cellspacing="0" width="100%">
            <c:set var="rows" value="${tbl.rows}"/>
            <c:forEach items="${rows}" var="row">
              <c:forEach items="${row}" var="col">
                <tr><td valign="top"><i>${col.displayName}</i></td><td>${col.value}</td></tr>
              </c:forEach>
            </c:forEach>
            </table></td></tr>
  </c:forEach>
  <tr><td colspan="2">&nbsp;</td></tr>

  </table>

  <c:set var="i" value="${i+1}"/>
</c:forEach>

<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
