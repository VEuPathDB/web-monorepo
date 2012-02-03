<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!--  TODO: Implement move to anchor, based on the comment ID -->

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<imp:header title="${wdkModel.displayName} : User Comments on ${id}"
                 banner="Comments on ${id}"/>

<c:set var="commentsTable" value="${requestScope.wdkRecord.tables['UserComments']}"/>
   
<table cellspacing=8 width="60%">
	<c:forEach var="row" items="${commentsTable.visibleRows}">
	
		<c:set var="commentId" value="${row['comment_id'].value}"/>	
		<c:set var="headline" value="${row['headline'].value}"/>
		<c:set var="content" value="${row['content'].value}"/>
		<c:set var="locations" value="${row['location_string'].value}"/>
		<c:set var="username" value="${row['user_name'].value}"/>
		<c:set var="organization" value="${row['organization'].value}"/>
		<c:set var="commentDate" value="${row['comment_date'].value}"/>
		<c:set var="projectVersion" value="${row['project_name_version'].value}"/>
		<c:set var="reviewStatus" value="${row['review_status_id'].value}"/>
		
		<a name=${commentId}>
		<tr><td>
		<hr/>
		<strong>Headline:</strong> ${headline}</a><br/>
		<div class=medium>
		<strong>By: </strong>${username}, ${organization} <br/>
		<strong>When:</strong> ${projectVersion} (${commentDate})<br>
		<c:if test="${reviewStatus == 'accepted'}">
			<strong>Status: </strong>
			<em>included in the Annotation Center's official annotation</em>
		</c:if>
		<c:if test="${! empty fn:trim(locations)}">
			<strong>Locations:</strong>
			${locations}
		</c:if>
		</div>
		<p align=justify>
		${content}
		</p>
		</td></tr>
		
	</c:forEach>
</table>

<hr/><br/><br/>
<imp:footer/>


