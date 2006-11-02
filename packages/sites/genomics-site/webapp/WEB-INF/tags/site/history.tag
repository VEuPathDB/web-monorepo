<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="modelName" value="${wdkModel.displayName}"/>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>


<c:choose>
   <c:when test="${modelName eq 'ApiDB'}">
   
	<table width="100%"  border="0" cellspacing="0" cellpadding="0">
	  <tr height="5">
		<td width="5" background="images/top_left_history.gif">&nbsp;</td>
		<td background="images/top_history.gif">&nbsp;</td>
		<td width="5"  background="images/top_right_history.gif">&nbsp;</td>
	  </tr>
	  <tr>
		<td width="5" background="images/left_history.gif">&nbsp;</td>
		<td bgcolor="#b0c4de" align="center">
		
		  <font color="#660000" size='3'><b>Items in my query history</b></font>
		  
		  <table width="100%" border="0" cellspacing="0" cellpadding="0">
		  <tr>
		  	<td width="35%">
			</td>
			<td bgcolor="#FAEBEE" width="30%" align="center">
				<a href='<c:url value="/showQueryHistory.do"/>'>
					<font size='+2'><b>
					<c:choose>
					  <c:when test="${wdkUser.historyCount == null}">0</c:when>
					 <c:otherwise>${wdkUser.historyCount}</c:otherwise>
					</c:choose>
					</b>
					</font>
				</a>
			</td>
			<td width="35%">
			</td>
		  </tr>
		  </table>

		
		</td>
		<td width="5" background="images/right_history.gif">&nbsp;</td>
	  </tr>
	  <tr height="25">
		<td width="25" background="images/bottom_left_history.gif">&nbsp;</td>
		<td background="images/bottom_history.gif">&nbsp;</td>
		<td width="25"  background="images/bottom_right_history.gif">&nbsp;</td>
	  </tr>
	</table>
 
   </c:when>   
   <c:otherwise>


	<table width="90%"  border="0" cellspacing="0" cellpadding="0">
	  <tr height="5">
		<td width="5" background="images/top_left_history.gif">&nbsp;</td>
		<td background="images/top_history.gif">&nbsp;</td>
		<td width="5"  background="images/top_right_history.gif">&nbsp;</td>
	  </tr>
	  <tr>
		<td width="5" background="images/left_history.gif">&nbsp;</td>
		<td bgcolor="#b0c4de" align="center">
		
		<table width="100%" border="0" cellspacing="0" cellpadding="0">
		  <tr>
		  	<td width="45%">
			</td>
			<td bgcolor="#FAEBEE" width="10%" align="center">
			
		  <font color="#660000" size='3'><b>Items in your query history</b></font>
		   <a style="color:#FAEBEE" href='<c:url value="/showQueryHistory.do"/>'>
		   <font size='+1'><b>
		   <c:choose>
			 <c:when test="${wdkUser.historyCount == null}">0</c:when>
			 <c:otherwise>${wdkUser.historyCount}</c:otherwise> 
		   </c:choose>
		  </b></font>
		  </a>
		
			</td>
			<td width="45%">
			</td>
		  </tr>
		  </table>
		</td>
		<td width="5" background="images/right_history.gif">&nbsp;</td>
	  </tr>
	  <tr height="25">
		<td width="25" background="images/bottom_left_history.gif">&nbsp;</td>
		<td background="images/bottom_history.gif">&nbsp;</td>
		<td width="25"  background="images/bottom_right_history.gif">&nbsp;</td>
	  </tr>
	</table>

     
   </c:otherwise>
</c:choose>


