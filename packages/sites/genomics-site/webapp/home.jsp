<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:choose>
<c:when test="${project eq 'FungiDB'}" >
	<c:set var="twitter" value="FungiDB"/>
	<c:set var="facebook" value="FungiDB"/>
</c:when>
<c:otherwise>
	<c:set var="twitter" value="EuPathDB"/>
	<c:set var="facebook" value="pages/EuPathDB/133123003429972"/>
</c:otherwise>
</c:choose>

<%-- header includes menubar and announcements tags --%>
<%-- refer is used to determine which announcements are shown --%>
<site:header refer="home"/>
<site:DQG /> 
<site:sidebar  twitter="${twitter}" facebook="${facebook}"/>
<site:footer  refer="home"/>



