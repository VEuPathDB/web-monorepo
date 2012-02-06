<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
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
<imp:header refer="home"/>
<imp:DQG /> 
<imp:sidebar  twitter="${twitter}" facebook="${facebook}"/>
<imp:footer  refer="home"/>



