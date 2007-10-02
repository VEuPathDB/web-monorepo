<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- 
attributes:
    comments: an array of Comment object
    stable_id: the stable id the comments are on
    project_id: the project id for the comments
--%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : User Comments on ${stable_id}"
                 banner="Comments on ${stable_id}"/>
${stable_id}
<table cellspacing=8 width="60%">
	<c:forEach var="comment" items="${comments}">
		<tr>
    		<td>
        		<div align="center"><a name=${comment.commentId}><strong>${comment.headline}</strong></a>
        		</div>
        		<div class=medium>
        		<strong>By: </strong>${comment.userName}, ${comment.organization} <br/>
        		<strong>For: </strong>${comment.projectName}, version ${comment.projectVersion} <br/>
        		<strong>At:</strong> ${comment.commentDate}<br>
        		<c:if test="${comment.reviewStatus == 'accepted'}">
        			<strong>Status: </strong>
        			<em>included in the Annotation Center's official annotation</em>
        			<br />
        		</c:if>
        		
        		<%-- display external database info --%>
        		<c:set var="externalDbs" value="${comment.externalDbs}" />
        		<c:if test="${fn:length(externalDbs) > 0}">
        			<strong>External Databases:</strong>
        			<c:set var="firstItem" value="1" />
        			<c:forEach var="externalDb" items="${externalDbs}">
        			    <c:choose>
        			        <c:when test="${firstItem == 1}">
        			            <c:set var="firstItem" value="0" />
        			        </c:when>
        			        <c:otherwise>, </c:otherwise>
        			    </c:choose>
        			    ${externalDb.externalDbName} ${externalDb.externalDbVersion}
        			</c:forEach>
        			<br />
        		</c:if>

                <%-- display locations --%>
        		<c:set var="locations" value="${comment.locations}" />
        		<c:if test="${fn:length(locations) > 0}">
        			<strong>Locations:</strong>
        			<c:set var="firstItem" value="1" />
        			<c:forEach var="location" items="${locations}">
        			    <c:choose>
        			        <c:when test="${firstItem == 1}">
        			            <c:set var="firstItem" value="0" />
        			        </c:when>
        			        <c:otherwise>, </c:otherwise>
        			    </c:choose>
        			    ${location.coordinateType}: ${location.locationStart}-${location.locationEnd}
        			    <c:if test="${location.reversed}">(reversed)</c:if>
        			</c:forEach>
        		</c:if>
        		</div>
            		<p align=justify>${comment.content}</p>
        		<hr/>
    		</td>
		</tr>
	</c:forEach>
</table>

<hr/><br/><br/>
<site:footer/>


