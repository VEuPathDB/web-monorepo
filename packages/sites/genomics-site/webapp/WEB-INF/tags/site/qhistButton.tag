<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<c:choose>
<c:when test="${wdkUser.stepCount == null}">
<c:set var="count" value="0"/>
</c:when>
<c:otherwise>
<c:set var="count" value="${wdkUser.stepCount}"/>
</c:otherwise>
</c:choose>

<style type="text/css">
<!--
td.histBgnd
{
	background-image: url('/images/qhistButton.gif');
	background-repeat: no-repeat;
	text-align: center;
}
td.histBgnd a { display: block; }

a.histBtnTxt,a.histBtnTxtSm
{
	color: white;
	font-family: Arial,Helvetica;
	font-size: 18px;
	font-weight: bold;
	padding: 0 3px 0 0;
}

a.histBtnTxtSm { font-size: 11px; font-style: italic; }
-->

</style>

<table width="70" height="70" cellpadding="0" cellspacing="0"><tr>
  <td nowrap class="histBgnd">
<a href="/cryptodb/showQueryHistory.do" class="histBtnTxtSm">My<br>Queries:<br></a>
<a href="/cryptodb/showQueryHistory.do" class="histBtnTxt">${count}</a>
  </td>
</tr></table>
