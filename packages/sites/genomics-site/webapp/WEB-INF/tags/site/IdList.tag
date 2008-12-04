<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>


<table cellspacing="0" cellpadding="0" border="0" width="100%">
<c:set value="${wdkAnswer.summaryAttributes[0]}" var="sumAttrib"/>
<c:set var="attrName" value="${sumAttrib.name}" />
<tr class="subheaderrow">
    <th align="left" valign="middle">
      ${sumAttrib.displayName}
    </th>
</tr>


<tr class="headerrow">
    <th align="left" valign="middle">
      <table border="0" cellspacing="2" cellpadding="0">
       <tr class="headerInternalRow">
 	<td valign="middle">
	   <img src="<c:url value='/images/move_left_g.gif' />" alt="Move column left" border="0" />
	</td>
 	<td valign="middle">
	   <div>
  		<a href="${commandUrl}&command=sort&attribute=${attrName}&sortOrder=asc"
                                    title="Sort by ${sumAttrib}">
                                    <img src="<c:url value='/images/sort_up.gif' />" alt="Sort results up" border="0" /></a>
	   </div>
	   <div>
                <a href="${commandUrl}&command=sort&attribute=${attrName}&sortOrder=desc"
                                    title="Reverse sort by ${sumAttrib}">
                                    <img src="<c:url value='/images/sort_down.gif' />" alt="Sort results down" border="0" /></a>
	   </div>
	</td>
	<td valign="middle">
	   <img src="<c:url value='/images/move_right_g.gif' />" alt="Move column right" border="0" />
	</td>
 	<td valign="middle">
	   <img src="<c:url value='/images/remove_g.gif' />" alt="Remove column" border="0" />
	</td>
       </tr>
      </table>
    </th>
</tr>


<c:set var="i" value="0"/>
<c:forEach items="${wdkAnswer.records}" var="record">

<%-- Set Line Color --%>
<c:choose>
  <c:when test="${i % 2 == 0}">
	<tr class="lines">
  </c:when>
  <c:otherwise>
	<tr class="linesalt">
  </c:otherwise>
</c:choose>
<c:set var="primaryKey" value="${record.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="pKeyName" value="${record.summaryAttributeNames[0]}" />
<td align="left">
   <c:set value="${record.recordClass.fullName}" var="recNam" />
     <span id="list_gene_id_${primaryKey.value}"> 
       <a href="javascript:ToggleGenePageView('gene_id_${primaryKey.value}', 'showRecord.do?name=${recNam}&project_id=${projectId}&primary_key=${id}')">${primaryKey.value}
</a></span>
</td>
</tr>
<c:set var="i" value="${i+1}" />
</c:forEach>
</table>
