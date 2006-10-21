<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<table border='0'>
  <tr>
    <td colspan="3" align="center">Items in your query history</td>
  </tr>

  <tr align='center' valign="bottom">
    <td width='30'>&nbsp;</td>
    <td width='30' bgcolor="yellow" fgcolor="#660000" valign="middle">
       <a href='/showQueryHistory.do'>
       <font size='+2'><b>
       <c:choose>
         <c:when test="${wdkUser.historyCount == null}">0</c:when>
         <c:otherwise>${wdkUser.historyCount}</c:otherwise> 
       </c:choose>
      </b></font>
      </a>
    </td>
    <td width='30'>&nbsp;</td>
  </tr>
</table>
