<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="partial" value="${requestScope.partial}" />

<c:choose>

<c:when test = "${fn:containsIgnoreCase(wdkQuestion.name, 'Blast') || fn:containsIgnoreCase(wdkQuestion.name, 'BySimilarity')}">
	<c:choose>
  	<c:when test="${partial}">
		<site:blast/>
  	</c:when>

  	<c:otherwise>
    		<site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
		<site:blast/>
    		<site:footer />
  	</c:otherwise>
	</c:choose>
</c:when>


<c:when test = "${fn:containsIgnoreCase(wdkQuestion.name, 'OrthologPattern')}">
	<c:choose>
  	<c:when test="${partial}">
		<site:orthologpattern/>
  	</c:when>

  	<c:otherwise>
    		<site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
		<site:orthologpattern/>
    		<site:footer />
  	</c:otherwise>
	</c:choose>
</c:when>

<c:otherwise>
	<c:choose>
  	<c:when test="${partial}">
		<site:question/>
  	</c:when>

  	<c:otherwise>
    		<site:header title="Search for ${wdkQuestion.recordClass.type}s by ${wdkQuestion.displayName}" refer="customQuestion" />
		<site:question/>
    		<site:footer />
  	</c:otherwise>
	</c:choose>
</c:otherwise>


</c:choose>
