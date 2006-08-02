<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<site:header title="PlasmoDB.org :: Add A Comment"
                 banner="Add A Comment"/>
<head>
<style type="text/css">
    table.mybox {
      width:     40em;
      max-width: 100%;
      padding:   0.5em 1em;
      overflow:  auto;
      border:    1px solid #666;
      color:     #000;
    }
	
	input.textbox {
		width:   100%;
	}
	
	textarea {
		width:   100%;
		height:  30ex;
	}
</style>
</head>

<c:choose>
<c:when test="${showThanks}">
	<c:choose>
		<c:when test="${commentTarget.commentTargetId eq 'gene'}">
			<c:set var="returnUrl" 
				value="${pageContext.request.contextPath}/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=&primary_key=${stableId}"/>
		</c:when>
		<c:otherwise>
			<c:set var="returnUrl" 
				value="${pageContext.request.contextPath}/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=&primary_key=${stableId}"/>
		</c:otherwise>
	</c:choose>
	<p align=center>Thank you for the comment.
	<br/><br/>
	<a href="${returnUrl}">Return to ${commentTarget.displayName} ${stableId} page</a>
	</p>
</c:when>

<c:otherwise>
	<!-- <c:set var="locationHelp" value="Expected format: start-end.
				Multiple locations, if applicable, should be of the form:
				<i>start1-end1, start2-end2, ...</i> and so on. Leave this
				blank if location information is not applicable or unavailable."/> -->
	
	<c:choose>
		<c:when test="${commentTarget.requireLocation}">
			<c:set var="locationStr" value="(Required)"/> 
		</c:when>
		
		<c:otherwise>
			<c:set var="locationStr" value="(Optional)"/> 
		</c:otherwise>
	</c:choose>
	
		
	<table cellspacing=8 width=100%>
	<tr><td>

	<strong>Add a comment to ${commentTarget.displayName} ${stableId}</strong>
	
	<p align=justify>
	Please add only scientific comments to be displayed on the ${commentTarget.displayName} page for ${stableId}. 
	If you want to report a problem, use the <a href="http://www.plasmodb.org/plasmo/help.jsp">support page.</a>
	</td></tr></table>
	
	<form method=post action="processAddComment.do">
	<input type="hidden" name="commentTargetId" value="${commentTarget.commentTargetId}"/>
	<input type="hidden" name="stableId" value="${stableId}"/>
	
	<table width=60% cellspacing=8 bgcolor="#88aaca" align=center>

	<!-- <th><tr>
		<td></td>
		<td><strong>${commentTarget.displayName} ${stableId}</strong></td>
		</tr></th> -->
		
	<tr>
		<td><div class=medium">Headline</div></td>
		<td><input type=text class="textbox" name="headline"/></td>
		</tr>
		
	<tr>
		<td valign=top><div class="medium">Comment</div></td>
		</td><td><textarea name="content"></textarea></td>
		</tr>
		
	<tr>
		<td valign=top><div class="medium">Location<br/>${locationStr}</div></td>
		<td>
		<table class=mybox widht=100%>
		<tr>
			<td>
				<div class="medium">
					<input type=radio name="locType" value=genomef checked>Genome Coordinates (Forward strand)</input><br/>
					<input type=radio name="locType" value=genomer>Genome Coordinates (Reverse strand)</input><br/>
					<c:if test="${commentTarget.commentTargetId eq 'gene'}">
					<input type=radio name="locType" value=protein>Protein Coordinates</input>
					</c:if>
				</div>
				</td>
			</tr>
		<tr>
			<td colspan=2><input type=text name="locations" size=50/>
			<p class=medium>
			* Leave blank if Location is not applicable<br/>
			* Example 1: 1000-2000<br/>
			* Example 2: 1000-2000, 2500-2600, 3000-5000<br/>
			* Always use the forward strand (5'-3') coordinates
			</p>
			</td></tr>
			
		</table>
		</td>
		</tr>
		
	<tr>
		<td colspan=2 align=center>
		<br/>
		<input type=submit value="Add Comment"/></td>
		</tr>
		
	</table>
	</form>
	                 
</c:otherwise>
</c:choose>   
              
<site:footer/>