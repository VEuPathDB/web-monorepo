<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%--############# Access URL Params ############--%>
<c:set var="geneList"  value="${param.geneList}" />
<c:set var="pathwayId" value="${param.pathway}" />
<c:set var="projectId" value="${param.model}" />

<base target="_parent" />

   <!-- StyleSheets provided by WDK -->
<imp:wdkStylesheets refer="window"/>

    <!-- JavaScript provided by WDK -->
<imp:wdkJavascripts refer="window"/>

<br>
<div align="center">
<img align="middle" src="http://${pageContext.request.serverName}/cgi-bin/colorKEGGmap.pl?model=${projectId}&pathway=${pathwayId}&geneList=${geneList}" usemap="#pathwayMap"/>
<imp:pathwayMap projectId="${projectId}" pathway="${pathwayId}" geneList="${geneList}" />
</div>
<br>


