<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />
<c:choose>
	<c:when test="${projectId != 'CryptoDB' }">  <!-- plasmo and toxo -->
		<site:question/>
	</c:when>

	<c:otherwise>
<p>For metabolic pathway information please visit our <a href="http://apicyc.apidb.org/CPARVUM/server.html">CryptoCyc database</a> at  
<a href="http://apicyc.apidb.org/CPARVUM/server.html"><b>http://apicyc.apidb.org/CPARVUM/server.html</b></a>
<br><p>Maps of metabolic pathways were computationally constructed for <i>C. parvum</i> and <i>C. hominis</i> with 
the <a href="http://bioinformatics.oxfordjournals.org/cgi/content/abstract/18/suppl_1/S225">Pathway Tools</a> software package.
<br><p>Searches issued at <a href="http://apicyc.apidb.org/CPARVUM/server.html">CryptoCyc</a> will <b>not</b> be recorded in your Search History.
	</c:otherwise>
</c:choose>


