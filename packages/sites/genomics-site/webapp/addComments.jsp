<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<site:header title="${wdkModel.displayName}.org :: Add A Comment"
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

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:choose>
	<c:when test="${empty wdkUser || wdkUser.guest}">
		<p align=center>Please login to post a comment.</p>
		<table align='center'><tr><td><site:login/></td></tr></table>
	</c:when>
	
	<c:otherwise>

		<c:choose>
		<c:when test="${submitStatus eq 'success'}">
		
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

		<c:when test="${fn:containsIgnoreCase (submitStatus, 'error')}">
			<p align=center>
			<font color=red>${submitStatus}<br/><br/></font>

			<c:url var="commentsUrl" value="showAddComment.do">
		    	<c:param name="stableId" value="${stableId}"/>
			    <c:param name="commentTargetId" value="${commentTarget.commentTargetId}"/>
			    <c:param name="externalDbName" value="${externalDbName}" />
			    <c:param name="externalDbVersion" value="${externalDbVersion}"/>
			</c:url>
			
			<a href="${commentsUrl}">Return to Add Comment on ${commentTarget.displayName} ${stableId} page</a>
			</p>
			
		</c:when>

		<c:otherwise>
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
			If you want to report a problem, use the <a href="<c:url value='/help.jsp'/>">support page.</a>
			
			<p>
			Your comments are appreciated. They will be forwarded to the Annotation Center for review and possibly 
			included in future releases of the genome.</p>
			</td></tr></table>
			<br/>
			<form method=post action="processAddComment.do">
			<input type="hidden" name="commentTargetId" value="${commentTarget.commentTargetId}"/>
			<input type="hidden" name="stableId" value="${stableId}"/>
			<input type="hidden" name="externalDbName" value="${externalDbName}"/>
			<input type="hidden" name="externalDbVersion" value="${externalDbVersion}"/>
			
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
				<td><textarea name="content"></textarea></td>
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
			
<c:set var="formatHelp" value="
				<div class=medium>
				Use the formatting commands exemplified below to add bold, italics, underline, superscript, subscript 
				and lists to your comment:
				<p/>
				Your comment can contain [i]italicized text[/i], some [b]bold words[/b] and a few [u]underlined words[/u]. 
				Subscripts such as A[sub]min[/sub] or superscripts such as B[sup]max[/sup] are allowed. You can also
				use numbered lists such as:
				<br/>
				[ol]<br/>
				[li] One Apple[/li]<br/>
				[li] Two Oranges[/li]<br/>
				[li] Three bananas[/li]<br/>
				[/ol]<br/>
				<br/>
				using the [OL] tag, or bulleted lists using the [UL] tag:<br/>
				[ul]<br/>
				[li] One Apple[/li]<br/>
				[li] Two Oranges[/li]<br/>
				[li] Three bananas[/li]<br/>
				[/ul]<br/>
				<br/>
				Shown below is how the above comment appears to everyone:
				</div>
				<table class=mybox>
				<tr><td>
				<div class=medium>
				Your comment can contain <i>italicized text</i>, some <b>bold words</b> and a few <u>underlined words</u>. 
				Subscripts such as A<sub>min</sub> or superscripts such as Z<sup>max</sup> are allowed. You can also
				use numbered lists such as:

				<ol>
				<li>One Apple</li>
				<li>Two Oranges</li>
				<li>Three bananas</li>
				</ol>

				using the [OL] tag, or bulleted lists using the [UL] tag:
				
				<ul>
				<li> Apples</li>
				<li> Oranges</li>
				<li> Bananas</li>
				</ul>
				</div>
				
				</td></tr></table>"/>
		
		<table width=60% align=center>
		<tr><td>
		${formatHelp}
		</td></tr>
		</table>
		
		</c:otherwise>
		</c:choose>  
	</c:otherwise>
</c:choose> 
<br/><br/>              
<site:footer/>
