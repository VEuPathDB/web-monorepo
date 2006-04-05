<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:choose>

<c:when test="${param['idx'] != null}">
  <c:set var="banner" value="Featured Dataset"/>
</c:when>

<c:when test="${param['datasets'] != null}">
  <c:set var="banner" value="Data Sources for ${param['title']}"/>
</c:when>

<c:otherwise>
<c:set var="banner" value="${xmlAnswer.question.displayName}"/>
</c:otherwise>
</c:choose>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : Coming Soon"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Coming Soon"
                 division="coming_soon"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->

<table border="0" cellpadding="2" cellspacing="0" width="100%">

<c:set var="i" value="0"/>
<c:set var="alreadyPrintedSomething" value="false"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<tr class="rowLight">
  <td>

  <c:if test="${alreadyPrintedSomething}"><hr></c:if>
  <c:set var="alreadyPrintedSomething" value="true"/>

  <c:set var="title" value="${record.attributesMap['title']}"/>
  <c:set var="tag" value="${record.attributesMap['tag']}"/>


<a name="${tag}"/>

<table width="100%" cellpadding="4">
<tr bgcolor="#bbaacc"><td colspan="4" align="left"><b>${title}</b></td></tr>
<tr><td>
  <font size="-1">
    <c:set var="lst" value="${record.tables[0]}"/>
    <c:set var="rows" value="${lst.rows}"/>
    <c:forEach items="${rows}" var="row">
      <b>${row[0].value}</b><br>
      ${row[1].value}<br><br>
    </c:forEach>
  </font>
</td></tr></table>

  <br><br>

  </td>
</tr>

<c:set var="i" value="${i+1}"/>
</c:forEach>

</tr>
</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
