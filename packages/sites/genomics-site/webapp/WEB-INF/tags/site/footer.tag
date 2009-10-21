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
<c:set var="date" value="Nov. 2009" />


<%------------ divs defined in header.tag for all pages but home/home2  -----------%>
<c:if test="${refer != 'home' && refer != 'home2'}">
</div> <%-- class="innertube"   --%>
</div> <%-- id="contentcolumn2" --%>
</div> <%-- id="contentwrapper" --%>

</c:if>

<%--------------------------------------------%>

<div id="footer" >
	<div style="float:left;padding-left:9px;padding-top:9px;">
 	 	<a href="http://${fn:toLowerCase(siteName)}.org">${siteName}</a> ${version}&nbsp;&nbsp;&nbsp;&nbsp;${date}
		<br>&copy;2009 The EuPathDB Project Team
	</div>

	<div style="float:right;padding-right:9px;padding-top:9px;font-size:1.4em;line-height:2;">
		Please <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a> with any questions or comments
	</div>

	<span style="position: relative; top: -9px;">
		<a href="http://www.eupathdb.org"><br><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage"/></a>&nbsp;&nbsp;
		<a href="http://cryptodb.org"><img border=0 src="/assets/images/CryptoDB/cryptodb_w50.png"     	width=30></a>&nbsp;
       		<a href="http://giardiadb.org"><img border=0 src="/assets/images/GiardiaDB/giardiadb_w50.png"  	width=30></a>&nbsp;&nbsp;
        	<a href="http://plasmodb.org"><img border=0 src="/assets/images/PlasmoDB/plasmodb_w50.png"     	width=30></a>&nbsp;&nbsp;
        	<a href="http://toxodb.org"><img border=0 src="/assets/images/ToxoDB/toxodb_w50.png"           	width=30></a>&nbsp;&nbsp;
        	<a href="http://trichdb.org"><img border=0 src="/assets/images/TrichDB/trichdb_w65.png"        	height=30></a>&nbsp;&nbsp;
        	<a href="http://tritrypdb.org"><img border=0 src="/assets/images/TriTrypDB/tritrypdb_w40.png"	width=25></a>
	</span>

</div>

</body>
</html>
