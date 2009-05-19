<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%--  if we want to have footer spanning only under buckets --%>
<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>

<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />

<%-------------  SITE Version and DATE  ----------------%>
<c:choose>
   <c:when test="${fn:containsIgnoreCase(siteName, 'CryptoDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
<c:when test="${fn:containsIgnoreCase(siteName, 'GiardiaDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
 <c:when test="${fn:containsIgnoreCase(siteName, 'PlasmoDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
<c:when test="${fn:containsIgnoreCase(siteName, 'ToxoDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
<c:when test="${fn:containsIgnoreCase(siteName, 'TrichDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
 <c:when test="${fn:containsIgnoreCase(siteName, 'TriTrypDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
<c:when test="${fn:containsIgnoreCase(siteName, 'ApiDB')}">
     <c:set var="date" value="June 2009" />
   </c:when>
</c:choose>

<%------------ divs defined in header.tag for all pages but home/home2  -----------%>
<c:if test="${refer != 'home' && refer != 'home2'}">
</div> <%-- class="innertube"   --%>
</div> <%-- id="contentcolumn2" --%>
</div> <%-- id="contentwrapper" --%>
</c:if>

<c:if test="${fn:containsIgnoreCase(siteName, 'ApiDB')}">
     <c:set var="siteName" value="EupathDB" />
</c:if>

<%--------------------------------------------%>

<div id="footer" >
<div style="float:left;padding-left:9px;padding-top:9px;">
 	 <a href="http://${fn:toLowerCase(siteName)}.org">${siteName}.org</a> ${version},&nbsp;${date}
		<br>&copy;2009 The EuPath Project Team
</div>
<div style="float:right;padding-right:9px;padding-top:9px;">
	<a href="http://www.eupathdb.org"><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage"/></a>
</div>
<span style="font-size:1.4em;line-height:3;">Please <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a> with any questions or comments</span>
</div>
</body>
</html>
