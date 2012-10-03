<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<%-- header includes menubar and announcements tags --%>
<%-- refer is used to determine what css and javascript to load, and which announcements are shown --%>
<imp:header refer="home"/>
<imp:sidebar/>
<imp:DQG /> 
<imp:footer  refer="home"/>



