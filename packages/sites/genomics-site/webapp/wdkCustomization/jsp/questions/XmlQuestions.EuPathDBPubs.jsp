<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="EuPathDB Publications"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Publications"
                 division="about"/>

<style type="text/css">
  .thinTopBottomBorders ul { 
    list-style: inside disc;
	padding-left: 2em;
    text-indent: -1em;
  }
  .thinTopBottomBorders ul ul {
    list-style-type: circle;
  }
  .thinTopBottomBorders p {
	margin-top: 1em;
	margin-bottom: 1em;
  }
</style>

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
  <c:set var="tag" value="${record.attributesMap['tag']}"/>
  <c:set var="text" value="${record.attributesMap['text']}"/>

  <a name="newsText${i}"/>
  <a name="${tag}"/>
  <table border="0" cellpadding="2" cellspacing="0" width="100%">

  <c:if test="${i > 1}"><tr><td colspan="2"><hr></td></tr></c:if>
  <tr class="rowLight"><td>
    ${text}</td></tr></table>
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
