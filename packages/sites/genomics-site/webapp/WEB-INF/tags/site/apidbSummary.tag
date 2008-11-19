<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<c:set value="${requestScope.wdkHistory}" var="history"/>
<c:set var="historyId" value="${history.userAnswerId}"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set value="${requestScope.wdk_history_id}" var="altHistoryId"/>

<c:set value="Error" var="QUERY_ERROR"/>
<c:set value="NA" var="NA"/>

<c:set value="${wdk_paging_pageSize}" var="pageSize"/>

<c:choose>
                   <c:when test="${historyId == null}">
                      <c:set value="${altHistoryId}" var="histID"/>
                   </c:when>
                   <c:otherwise>
                       <c:set value="${historyId}" var="histID"/>
                   </c:otherwise>
</c:choose>

<font id="result_summary_strip"></font>

<script language="Javascript" type="text/javascript">
var pageSize = ${wdk_paging_pageSize};
var results = new Array ();
	<c:forEach items="${wdkAnswer.resultSizesByProject}" var="rSBP">
var ${rSBP.key}_array = new Array(2); 
${rSBP.key}_array[0] = "${rSBP.key}";
${rSBP.key}_array[1] = ${rSBP.value};
results.push(${rSBP.key}_array);
	</c:forEach>
write_links();
function result_page_link(i)
{
	var testString = "";
	var pName = results[i][0];
	var value = results[i][1];
	if(i == 0){
		window.location = "showSummary.do?wdk_history_id=${histID}&pager.offset=0";		
	}else{
		var subTotalRes = 0;
		for(var x=0; x<i; x++){
			subTotalRes = subTotalRes + results[x][1];
		}
		var offset = subTotalRes % pageSize;
		offset = subTotalRes - offset;
		window.location = "showSummary.do?wdk_history_id=${histID}&pager.offset=" + offset;
	}		
}

function write_links(){
	var summary_strip = "";
	for(var i=0; i<results.length; i++){
		var rs = results[i][1];
		if(rs == 0){
			summary_strip = summary_strip + "&nbsp;&nbsp;" + results[i][0] + ":&nbsp;" + results[i][1];
		}else if(rs == -1) {
			summary_strip = summary_strip + "&nbsp;&nbsp;" + results[i][0] + ":&nbsp;" + "Error";
		}else if(rs == -2) {
			summary_strip = summary_strip + "&nbsp;&nbsp;" + results[i][0] + ":&nbsp;" + "N/A";
		}else{
			summary_strip = summary_strip + "&nbsp;&nbsp;<a href='javascript:result_page_link(" + i + ")'>" + results[i][0] + ":&nbsp;" + results[i][1] + "</a>";
		}
		document.getElementById('result_summary_strip').innerHTML = summary_strip;
	}
}


</script>







<c:if test="${wdkAnswer.resultSize > 0}">



<font size="-2"><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Note: Links to pages only apply when results are sorted by ascendent organism.</font><br>

   </c:if>


