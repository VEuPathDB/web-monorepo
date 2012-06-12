<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ attribute name="searchSite" 
			  required="true" 
			  description="Site being searched"
%>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<c:choose>
      <c:when test = "${project == 'EuPathDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'AmoebaDB'}">
             <c:set var="siteID" value="3266681"/>
      </c:when>
      <c:when test = "${project == 'CryptoDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'FungiDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'GiardiaDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'MicrosporidiaDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'PiroplasmaDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'PlasmoDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'ToxoDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'TrichDB'}">
             <c:set var="siteID" value=""/>
      </c:when>
      <c:when test = "${project == 'TriTrypDB'}">
             <c:set var="siteID" value="58147367"/>
      </c:when>
</c:choose>


<!-- start of freefind search box html  DYNAMIC (on popup)   -->
<table cellpadding=0 cellspacing=0 border=0 >
<tr>
	<td colspan=2 style="font-family: Arial, Helvetica, sans-serif; font-size: 7.5pt;">
		<form  id="ffresult_sbox0" style="margin:0px; margin-top:4px;" action="http://search.freefind.com/find.html" method="get" accept-charset="utf-8" onsubmit="ffresults.show(0);">
		<input type="hidden" name="si" value="${siteID}">
		<input type="hidden" name="pid" value="r">
		<input type="hidden" name="n" value="0">
		<input type="hidden" name="_charset_" value="">
		<input type="hidden" name="bcd" value="&#247;">
		<input type="hidden" name="sbv" value="j1">
		<input type="text" name="query" size="15"> 
		<input type="submit" value="search">
		</form>
	</td>
</tr>
<tr>
<!--
	<td style="text-align:left; font-family: Arial, Helvetica, sans-serif;	font-size: 7.5pt; padding-top:4px;">
		<a style="text-decoration:none; color:gray;" href="http://www.freefind.com"  
		onmouseover="this.style.textDecoration='underline'" 
		onmouseout="this.style.textDecoration='none'" >site search by
		<span style="color: #606060;">freefind</span></a>
	</td>
-->
	<td style="padding:0 0 0 3px;text-align:center; font-family: Arial, Helvetica, sans-serif;	font-size: 7.5pt;">
		<a id="ffresult_adv0" onclick="ffresults.show(0);" href="http://search.freefind.com/find.html?si=58147367&amp;pid=a&amp;sbv=j1">advanced</a>
	</td>
<td style="font-family: Arial, Helvetica, sans-serif; font-size: 7.5pt;text-align:center;" >  <a href="http://www.freefind.com/searchtipspop.html" target=searchtips onclick="somewin=window.open('http://www.freefind.com/searchtipspop.html', 'searchtips','resizable=yes,scrollbars=yes,width=508,height=508')">search&nbsp;tips</a></td>

</tr>
</table>
<!-- end of freefind search box html -->
