<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="userAnswers" value="${wdkUser.recordAnswerMap}"/>

<table>
  <tr>
    <td colspan=3 align=center>Items in query history</td>
  </tr>

  <tr align=center>
    <td width=30>&nbsp;</td>
    <td width=30 bgcolor="yellow" fgcolor="#660000">
       <font size=+2 face='Helvetica'><b><a href='/showQueryHistory.do'>
       <c:choose>
         <c:when test="${wdkUser.answerCount == null}">0</c:when>
         <c:otherwise>${wdkUser.answerCount}</c:otherwise> 
       </c:choose>
      </a></b></font>
    </td>
    <td width=30>&nbsp;</td>
  </tr>
</table>
