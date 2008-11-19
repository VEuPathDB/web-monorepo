<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="i" value="0"/>
<c:forEach items="${wdkAnswer.records}" var="record">
<%-- Set Line Color --%>
<c:choose>
  <c:when test="${i % 2 == 0}">
	<tr class="lines">
  </c:when>
  <c:otherwise>
	<tr class="linesalt">
  </c:otherwise>
</c:choose>

<c:set var="j" value="0"/>
<c:forEach items="${wdkAnswer.summaryAttributeNames}" var="attrName">
<c:if test="${j != 0}">
<c:set var="recAttr" value="${record.summaryAttributes[attrName]}" />
<td align="left">
   <c:set value="${recAttr.briefValue}" var="fieldVal"/>
     ${fieldVal}
</td>
</c:if>
<c:set var="j" value="${j+1}"/>
</c:forEach>
<c:set var="i" value="${i+1}" />
</tr>
</c:forEach>



