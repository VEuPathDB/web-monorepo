<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="histories" value="${wdkUser.historiesByCategory}"/>
<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>
<c:if test="${dsCol == null}"><c:set var="dsCol" value=""/></c:if>
<c:if test="${dsColVal == null}"><c:set var="dsColVal" value="orthologs"/></c:if>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb')}" />

<site:header title="${wdkModel.displayName} : Query History"
                 banner="My Query History"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Query History"
                 division="query_history"/>
                 


<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
var IE = document.all?true:false
var mouseX = 0;
var mouseY = 0;
var currentHistoryId = 0;

document.onmousemove = getMousePos;

//alert(IE);

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) {
   document.captureEvents(Event.CLICK);
   document.captureEvents(Event.MOUSEOVER);
   document.captureEvents(Event.MOUSEOUT);
}

function getMousePos(e) {
   if (!e)
      var e = window.event||window.Event;
      
   if('undefined'!=typeof e.pageX){
      mouseX = e.pageX;
      mouseY = e.pageY;
   } else {
      mouseX = e.clientX + document.body.scrollLeft;
      mouseY = e.clientY + document.body.scrollTop;
   }
}

function displayName(histId) {
   // alert(mouseX);
   if (currentHistoryId == histId) return;
   
   var name = document.getElementById('div_' + histId);
   name.style.position = 'absolute';
   name.style.left = mouseX;
   name.style.top = mouseY;
   name.style.display = 'block';
}

function hideName(divId) {
   var name = document.getElementById(divId);
   name.style.display = 'none';
}

function enableRename(histId, customName) {
   // close the previous one
   if (currentHistoryId != '0') {
      var input = document.getElementById('input_' + currentHistoryId);
      input.innerText = "";
      input.style.display = 'none';
      var text = document.getElementById('text_' + currentHistoryId);
      text.style.display = 'block';
   }
   
   currentHistoryId = histId;
   var text = document.getElementById('text_' + histId);
   text.style.display = 'none';
   var input = document.getElementById('input_' + histId);
   input.innerHTML = "<table border='0' cellspacing='0' cellpadding='0'><tr>"
                   + "<td><input name='wdk_history_id' type='hidden' value='" + histId + "'>"
                   + "<input name='wdk_custom_name' type='text' size='55' value='" + customName + "'></td>" 
                   + "<td><input type='submit' value='Save'></td></tr></table>";
   input.style.display='block';
}

// -->
</script>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- show error messages, if any -->
<wdk:errors/>

<!-- decide whether history is empty -->
<c:choose>
  <c:when test="${wdkUser.historyCount == 0}">

<table align="center"><tr><td> *** Your history is empty *** </td></tr></table>

  </c:when>
  <c:otherwise>

<!-- show user answers grouped by RecordTypes -->

<c:set var="typeC" value="0"/>
<c:forEach items="${histories}" var="historyEntry">
  <c:set var="type" value="${historyEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
  <c:set var="histList" value="${historyEntry.value}"/>
  <c:set var="recDispName" value="${histList[0].answer.question.recordClass.type}"/>

  <!-- deciding whether to show only selected sections of history -->
  <c:choose>
    <c:when test="${param.historySectionId != null && param.historySectionId != type}">
    </c:when>
    <c:otherwise>

<c:set var="typeC" value="${typeC+1}"/>
<c:choose><c:when test="${typeC != 1}"><hr></c:when></c:choose>

<h3>${recDispName} query history</h3>

  <!-- show user answers one per line -->
  <c:set var="NAME_TRUNC" value="80"/>
  <table border="0" cellpadding="0">

    <tr>
      <td>
        <html:form method="get" action="/renameHistory.do">
        
      <table border="0" cellpadding="2">
      <tr class="headerRow">
          <th>ID</th> 
          <th>Query</th>
          <th>Size</th>
          <th>&nbsp;</th>
          <c:if test="${isGeneRec}"><th>${dsCol}</th></c:if>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
       </tr>

      <c:set var="i" value="0"/>
      <c:forEach items="${histList}" var="history">
        
        <jsp:setProperty name="history" property="nameTruncateTo" value="${NAME_TRUNC}"/>

        <c:choose>
          <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
          <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>

        <td>${history.historyId}
            <div id="div_${history.historyId}" 
                  style="display:none;position:absolute;left:0;top:0;width:300;background-color:#ffff99;">
                  ${history.customName}</div>
        </td>
        <c:set var="dispNam" value="${history.truncatedName}"/>
        <td width=450
            onmouseover="displayName('${history.historyId}')"
            onmouseout="hideName('div_${history.historyId}')">
            <div id="text_${history.historyId}"
                 onclick="enableRename('${history.historyId}', '${history.customName}')" nowrap>
                 ${dispNam}</div>
            <div id="input_${history.historyId}" style="display:none" nowrap></div>
        </td>
        <td nowrap>${history.estimateSize}</td>
        <td nowrap>
           <input type='button' value='Rename'
                  onclick="enableRename('${history.historyId}', '${history.customName}')">
        </td>
        <td nowrap>
           <c:if test="${isGeneRec && showOrthoLink}">
                <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${history.historyId}&plasmodb_dataset=${history.answer.datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a>
            </c:if>
         </td>	    
         <td nowrap><a href="showSummary.do?wdk_history_id=${history.historyId}">view</a></td>
         <td nowrap><a href="downloadHistoryAnswer.do?wdk_history_id=${history.historyId}">download</a></td>

            <c:set value="${history.answer.question.fullName}" var="qName" />
            <c:set var="isBooleanQuestion" value="${fn:containsIgnoreCase(qName, 'BooleanQuestion')}"/>
         <td nowrap>
               <c:if test="${isBooleanQuestion == false}">
		          <c:set value="${history.answer.questionUrlParams}" var="qurlParams"/>
	              <c:set var="questionUrl" value="" />
                  <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
	                 refine</a>
	           </c:if>
	           &nbsp;
         </td>

         <td nowrap>
               <c:set var="isDepended" value="${history.depended}"/>
               <c:choose>
                  <c:when test="${isDepended == false}">
                     <a href="deleteHistory.do?wdk_history_id=${history.historyId}">delete</a>
                  </c:when>
                  <c:otherwise>
                     no delete <a href='#nodelete'>?</a>
                  </c:otherwise>
               </c:choose>
         </td>
      
        </tr>
      <c:set var="i" value="${i+1}"/>
      </c:forEach>
      </table>
        </html:form>
      </td>
      </tr>
      <tr>
        <c:choose>
          <c:when test="${isGeneRec && showOrthoLink}"><td colspan="7" align="left"></c:when>
          <c:otherwise><td colspan="6" align="left"></c:otherwise>
	</c:choose>
            <br>
            <html:form method="get" action="/processBooleanExpression.do">
              Combine results:
              <html:text property="booleanExpression" value=""/>
                <font size="-1">[eg: 1 or ((4 and 3) not 2)]</font><br>
              <html:hidden property="historySectionId" value="${type}"/>
              <html:reset property="reset" value="Clear"/>
              <html:submit property="submit" value="Get Combined Result"/>
            </html:form>
          </td>
          <td colspan="1"></td></tr>

  </table>
    </c:otherwise>
  </c:choose> <!-- end of deciding sections to show -->

</c:forEach>

<table>
<tr><td><br></td></tr>
<tr><td><font face="Arial,Helvetica" size="-1">
The boolean operators AND, OR and NOT are defined as in <a href="http://www.ncbi.nlm.nih.gov/entrez/query/static/help/helpdoc.html#Boolean_Operators">NCBI Entrez</a>.
<ul>
<li>(1 AND 2) finds all genes that appear in BOTH 1 and 2 results (i.e., the intersection of 1 and 2)

<li>(1&nbsp;&nbsp;  OR 2) finds all genes that appear in EITHER 1 or 2 (i.e., the union of 1 and 2).

<li>(1 NOT 2) finds all genes that appear in result 1 BUT NOT in result 2 (i.e., the difference 1 - 2).
</ul>
</font></td></tr>
<tr><td>
  <b>NOTE: </b>
  <ul>
    <li>
      <a name='nodelete'>'no delete'</a> - You cannot delete a history if other history/histories depend on it.
    </li>
  </ul>
</td></tr>
</table>


  </c:otherwise>
</c:choose> <!-- end of deciding history emptiness -->


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
