<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<!-- display page header with xmlquestion display in banner -->
<site:header banner="${xmlAnswer.question.displayName}"/>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->

<table border="0" cellpadding="2" cellspacing="0" width="100%">

<c:set var="i" value="0"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:choose>
  <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
  <c:otherwise><tr class="rowDark"></c:otherwise>
</c:choose>

  <td>
  <table>
  <c:forEach items="${record.attributes}" var="recAttr"> 
    <tr>
    <c:set var="attrName" value="${recAttr.name}"/>
    <c:set var="attrVal" value="${recAttr.value}"/>
    <td width=1 nowrap align="right"><b>${attrName}:</b></td>
    <td>
    <!-- need to know if fieldVal should be hot linked -->
    <c:choose>
      <c:when test="${attrName eq 'link' or attrName eq 'url'}">
        <a href="${attrVal}">${attrVal}</a>
      </c:when>
      <c:otherwise>
        ${attrVal}
      </c:otherwise>
    </c:choose>
    </td></tr>
  </c:forEach>
  </table>
  </td>
</tr>
<c:set var="i" value="${i+1}"/>
</c:forEach>

</tr>
</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>

<site:footer/>
