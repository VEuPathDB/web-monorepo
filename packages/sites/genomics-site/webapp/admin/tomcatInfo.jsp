<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<api:checkWSKey keyFile="/usr/local/tomcat_instances/shared/.apidb_siteinfo_key" />

<h2>Tomcat</h2>
<api:webappInfo var="app"/>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<tr><td><b>Instance:</b></td><td class="p">${app.instanceName}</td></tr>
<tr><td><b>Instance uptime:</b></td><td class="p">${app.instanceUptimeText}</td></tr>

<tr><td>&nbsp;</td></tr>
<tr><td><b>Webapp:</b> </td><td class="p">${app.contextPath}</td></tr>
<tr><td><b>Webapp uptime:</b></td><td class="p">${app.webappUptimeText}</td></tr>
<tr><td>&nbsp;</td></tr>
<tr><td><b>Servlet container:</b> </td><td class="p">${app.serverInfo}</td></tr>
<tr><td><b>Servlet info:</b> </td><td class="p">${app.servletInfo}</td></tr>
<tr><td><b>Servlet API version:</b> </td><td class="p">${app.servletApiVersion}</td></tr>
</table>
<p>
<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('classpathlist','blind'); return false">Webapp Classpath &#8593;&#8595;</a></b>
<div id="classpathlist" style="padding: 5px; display: none;"><div>
<c:forTokens items="${app.classpath}" delims=":" var="path">${path}<br></c:forTokens>
</div></div>
</p>
<p>
<b><a href="<c:url value="/admin/logger.jsp" />">Manage Log Levels</a></b> for this running instance of the webapp
</p>
