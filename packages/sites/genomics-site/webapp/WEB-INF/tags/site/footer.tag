<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="siteName" value="${applicationScope.wdkModel.name}" />

<%-------------  SITE Version and DATE  ----------------%>
<c:choose>
   <c:when test="${fn:containsIgnoreCase(siteName, 'CryptoDB')}">
     <c:set var="version" value="4.0" />
     <c:set var="date" value="May 16th, 2009" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(siteName, 'GiardiaDB')}">
     <c:set var="version" value="1.1" />
     <c:set var="date" value="May 12th, 2009" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(siteName, 'PlasmoDB')}">
     <c:set var="version" value="5.5" />
     <c:set var="date" value="Sep 16th, 2009" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(siteName, 'ToxoDB')}">
     <c:set var="version" value="5.0" />
     <c:set var="date" value="Nov 18th, 2009" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(siteName, 'TrichDB')}">
     <c:set var="version" value="1.0" />
     <c:set var="date" value="Sep 14th, 2009" />
   </c:when>

 <c:when test="${fn:containsIgnoreCase(siteName, 'TriTrypDB')}">
     <c:set var="version" value="1.0" />
     <c:set var="date" value="May 15th, 2009" />
   </c:when>


<c:when test="${fn:containsIgnoreCase(siteName, 'EuPathDB')}">
     <c:set var="version" value="2.0" />
     <c:set var="date" value="May 15th, 2009" />
   </c:when>


</c:choose>



<%------------ divs defined in header.tag for all pages but home/home2  -----------%>
<c:if test="${refer != 'home' && refer != 'home2'}">
</div> <%-- class="innertube"   --%>
</div> <%-- id="contentcolumn2" --%>
</div> <%-- id="contentwrapper" --%>
</c:if>

<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
 <c:if test="${fn:containsIgnoreCase(dispModelName, 'ApiDB')}">
     <c:set var="dispModelName" value="EupathDB" />
</c:if>

<div align="center">


<div id="footer">
	<div style="position:absolute;top:0px;left:0px;padding:9px;text-align:left;">Version ${version}<br/>${date}</div>	

	<a href="http://www.eupathdb.org"><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage" width="144" height="25" align="right" border='0' /></a>

	&copy;2009  The EuPath Project Team:: <a href="http://${fn:toLowerCase(dispModelName)}.org">${dispModelName}.org</a> <br />
	Please <a href="<c:url value="/help.jsp"/>">Contact Us</a> with any questions or concerns.


</div>

</div>



</body>
</html>
