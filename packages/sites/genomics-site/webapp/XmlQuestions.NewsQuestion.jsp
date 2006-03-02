<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<site:header title="PlasmoDB : News"
                 banner="${banner}"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="News"
                 division="news"/>

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

<c:set var="i" value="1"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <c:set var="headline" value="${record.attributesMap['headline']}"/>
  <c:set var="tag" value="${record.attributesMap['tag']}"/>
  <c:set var="date" value="${record.attributesMap['date']}"/>
  <c:set var="item" value="${record.attributesMap['item']}"/>

  <a name="newsItem${i}"/>
  <a name="${tag}"/>
  <table border="0" cellpadding="2" cellspacing="0" width="100%">

  <c:if test="${i > 1}"><tr><td colspan="2"><hr></td></tr></c:if>
  <tr class="rowLight"><td>
    <b>${headline}</b> (${date})<br><br>${item}</td></tr></table>
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
