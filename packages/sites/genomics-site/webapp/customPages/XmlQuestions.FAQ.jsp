<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : FAQ"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="FAQ"
                 division="about"/>

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

<%-- first pass, show the jumpers --%>
<tr><td>&nbsp;</td></tr>

<tr><td>

<ul>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <c:set var="question" value="${record.attributesMap['question']}"/>
  <c:set var="tag" value="${record.attributesMap['tag']}"/>
  <li><a href="#${tag}">${question}</a></li>
</c:forEach>
</ul>

</td></tr>

<tr><td>&nbsp;</td></tr>

<tr><td><hr class="brown"></td></tr>

<%-- second pass, show the records --%>
<c:set var="i" value="0"/>
<c:set var="alreadyPrintedSomething" value="false"/>
<c:forEach items="${xmlAnswer.recordInstances}" var="record">

<c:if test="${alreadyPrintedSomething}"><tr><td>&nbsp;</td></tr></c:if>
<c:set var="alreadyPrintedSomething" value="true"/>

<c:set var="question" value="${record.attributesMap['question']}"/>
<c:set var="answer" value="${record.attributesMap['answer']}"/>
<c:set var="tag" value="${record.attributesMap['tag']}"/>

<tr class="rowLight" bgcolor="#cdcdff"><td><a name="${tag}"></a>${question}</td><tr>
<tr><td>&nbsp;</td></tr>
<tr class="rowLight"><td>${answer}</td></tr>

<c:set var="i" value="${i+1}"/>
</c:forEach>

</table>

<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
