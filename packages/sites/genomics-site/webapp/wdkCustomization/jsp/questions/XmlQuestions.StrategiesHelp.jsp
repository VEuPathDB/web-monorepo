<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} : Did You Know"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Did you know"
                 division="about">



<div id="strategyTips">

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

<c:choose>

<c:when test="${param['idx'] != null && param['idx'] != i}">
</c:when>

<c:otherwise>
<tr class="rowLight">
  <td>

  <c:if test="${alreadyPrintedSomething}"><hr></c:if>
  <c:set var="alreadyPrintedSomething" value="true"/>

  <c:set var="title" value="${record.attributesMap['title']}"/>
  <c:set var="text" value="${record.attributesMap['body']}"/>
  <c:set var="image" value="${record.attributesMap['image']}"/>
  <c:set var="showTip" value="${record.attributesMap['showTipAsDidYouKnow']}"/>
  <c:set var="tip" value="${record.attributesMap['tip']}"/>
  <b id="strat_help_${i}" class="strat_help_title">${title}</b>

  <c:if test="${showTip}"><span id="tip_${i}"><div style="margin: 10px 15px 15px;"><p><b>...${tip}</b>&nbsp;<a href="#strat_help_${i}">Learn more...</a></p></div></span></c:if>

  <br><br>${text}

  <br><c:if test="${image != null && image != ''}"><img src="<c:url value="${image}"/>" alt=""/></c:if>



  </td>
</tr>
</c:otherwise>
</c:choose>

<c:set var="i" value="${i+1}"/>
</c:forEach>

</tr>
</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>


</div>
</imp:pageFrame>
