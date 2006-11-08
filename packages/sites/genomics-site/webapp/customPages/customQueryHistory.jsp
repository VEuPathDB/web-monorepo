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
var overHistoryId = 0;
var currentHistoryId = 0;

document.onmousemove = getMousePos;

//alert(IE);

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) {
   document.captureEvents(Event.CLICK);
   document.captureEvents(Event.MOUSEOVER);
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
   if (overHistoryId != histId) hideAnyName();
   overHistoryId = histId;

   if (currentHistoryId == histId) return;
   if (mouseX == 0 && mouseY == 0) return;
   
   var name = document.getElementById('div_' + histId);
   name.style.position = 'absolute';
   name.style.left = mouseX+3;
   name.style.top = mouseY+3;
   name.style.display = 'block';
}

function hideName(histId) {
   if (overHistoryId == 0) return;
   
   //alert(mouseX);

   var name = document.getElementById('div_' + histId);
   name.style.display = 'none';
}

function hideAnyName() {
    hideName(overHistoryId);
}

function enableRename(histId, customName) {
   // close the previous one
   disableRename();
   hideAnyName();
   
   currentHistoryId = histId;
   var button = document.getElementById('btn_' + histId);
   button.disabled = true;
   var text = document.getElementById('text_' + histId);
   text.style.display = 'none';
   var input = document.getElementById('input_' + histId);
   input.innerHTML = "<table border='0' cellspacing='2' cellpadding='0'><tr>"
                   + "<td><input name='wdk_history_id' type='hidden' value='" + histId + "'>"
                   + "<input id='wdk_custom_name' name='wdk_custom_name' type='text' size='42' maxLength='2000' value='" + customName + "'></td>" 
                   + "<td><input type='submit' value='Update'></td>"
                   + "<td><input type='reset' value='Cancel' onclick='disableRename()'>"
                   + "</td></tr></table>";
   input.style.display='block';
   var nameBox = document.getElementById('wdk_custom_name');
   nameBox.select();
   nameBox.focus();
}

function disableRename() {
   if (currentHistoryId != '0') {
      var button = document.getElementById('btn_' + currentHistoryId);
      button.disabled = false;
      var input = document.getElementById('input_' + currentHistoryId);
      input.innerText = "";
      input.style.display = 'none';
      var text = document.getElementById('text_' + currentHistoryId);
      text.style.display = 'block';
      currentHistoryId = 0;
   }
}

function deleteAllHistories() {
    var agree=confirm("Are you sure you want to delete all your query histories?");
    if (agree) {
       window.location.href = "<c:url value='/deleteAllHistories.do'/>";
	   //return true ;
    } else {
	   return false ;
    }
}


function reviseBooleanQuery(type, expression) {
    var spanTitle = document.getElementById('comb_title_' + type);
    spanTitle.innerHTML = 'Revise combined query';
    var spanInput = document.getElementById('comb_input_' + type);
    var input = spanInput.getElementsByTagName('input')[0];
    input.value = expression;
    input.focus();
    input.select();
    return false;
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

<c:set var="typeC" value="${typeC+1}"/>
<c:if test="${typeC != 1}"><hr></c:if>

<h3>${recDispName} query history</h3>

  <!-- show user answers one per line -->
  <c:set var="NAME_TRUNC" value="65"/>
  <table width="100%" border="0" cellpadding="0">

    <tr>
      <td>
        <html:form method="get" action="/renameHistory.do">

      <table border="0" cellpadding="5" cellspacing="0">
      <tr class="headerRow">
          <th>ID</th> 
          <th onmouseover="hideAnyName()">&nbsp;</th>
          <th onmouseover="hideAnyName()">Query</th>
          <th onmouseover="hideAnyName()">Size</th>
          <c:if test="${isGeneRec}"><th>&nbsp;${dsCol}</th></c:if>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
       </tr>

      <c:set var="i" value="0"/>
      
      <!-- begin of forEach history in the category -->
      <c:forEach items="${histList}" var="history">
         <jsp:setProperty name="history" property="nameTruncateTo" value="${NAME_TRUNC}"/>

         <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
         </c:choose>

         <td>${history.historyId}
	    <!-- begin of floating info box -->
            <div id="div_${history.historyId}" 
	         class="small"
                 style="display:none;font-size:8pt;position:absolute;left:0;top:0;background-color:#ffffCC;"
                 onmouseover="hideAnyName()">
               <c:set var="wdkAnswer" value="${history.answer}"/>
               <table border="0" cellspacing="5">
                  <tr>
                     <td valign="top" align="right" width="10" class="small" nowrap><b>Query:</b></td>
                     <td valign="top" align="left" class="small">${wdkAnswer.question.displayName}</td>
                  </tr>
                  <tr>
                     <td valign="top" align="right" width="10" class="small" nowrap><b>Parameters:</b></td>
		     <td valign="top" align="left" class="small">
                        <c:choose>
                           <c:when test="${history.boolean}">
                              <!-- boolean question -->
                              ${history.booleanExpression}
                           </c:when>
                           <c:otherwise>
                              <!-- simple question -->
                              <c:set value="${wdkAnswer.internalParams}" var="params"/>
                              <c:set value="${wdkAnswer.question.paramsMap}" var="qParamsMap"/>
                              <table cellpadding="2" cellspacing="0" border="1">
                                 <c:forEach items="${qParamsMap}" var="p">
                                    <c:set var="pNam" value="${p.key}"/>
                                    <c:set var="qP" value="${p.value}"/>
                                    <c:set var="aP" value="${params[pNam]}"/>
                                    <c:if test="${qP.isVisible}">
                                       <tr>
                                          <td align="right" class="small"><i>${qP.prompt}</i></td>
                                          <td class="small">${aP}</td>
                                       </tr>
                                    </c:if>
                                 </c:forEach>
                              </table>
                           </c:otherwise>
                        </c:choose>
		     </td>
	          </tr>
               </table>
            </div> 
	    <!-- end of floating info box -->
         </td>
        <td onmouseover="hideAnyName()" nowrap>
           <input type='button' id="btn_${history.historyId}" value='Rename'
                  onclick="enableRename('${history.historyId}', '${history.customName}')">
        </td>
        <c:set var="dispNam" value="${history.truncatedName}"/>
        <td width=450 onmouseover="displayName('${history.historyId}')">
            <div id="text_${history.historyId}"
                 onclick="enableRename('${history.historyId}', '${history.customName}')">
                 ${dispNam}</div>
            <div id="input_${history.historyId}" style="display:none"></div>
        </td>
        <td align='right' onmouseover="hideAnyName()" nowrap>${history.estimateSize}</td>
        <c:if test="${isGeneRec && showOrthoLink}">
           
           <td nowrap>
                <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${history.historyId}&plasmodb_dataset=${history.answer.datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a>
           </td>	    
        </c:if>
        <td nowrap><a href="showSummary.do?wdk_history_id=${history.historyId}">view</a></td>
        <td nowrap><a href="downloadHistoryAnswer.do?wdk_history_id=${history.historyId}">download</a></td>

            <c:set value="${history.answer.question.fullName}" var="qName" />
         <td nowrap>
            <c:choose>
               <c:when test="${history.boolean == false}">
		  <c:set value="${history.answer.questionUrlParams}" var="qurlParams"/>
	          <c:set var="questionUrl" value="" />
                  <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
	                 revise</a>
	       </c:when>
	       <c:otherwise>
	          <c:set value="${history.booleanExpression}" var="expression"/>
	          <a href="#" onclick="return reviseBooleanQuery('${type}', '${expression}')">
	             revise</a>
	       </c:otherwise>
	    </c:choose>
         </td>

         <td nowrap>
               <c:set var="isDepended" value="${history.depended}"/>
               <c:choose>
                  <c:when test="${isDepended == false}">
                     <a href="deleteHistory.do?wdk_history_id=${history.historyId}">delete</a>
                  </c:when>
                  <c:otherwise>
                     <a href="#" 
                        style="color:gray" 
                        title="Cannot delete Query #${history.historyId} because it is used by other queries: ${history.dependencyString}"
                        onclick="alert('Cannot delete Query #${history.historyId} because it is used by \nother queries: ${history.dependencyString}');">
                       delete</a> 
                  </c:otherwise>
               </c:choose>
         </td>
      
        </tr>
        <c:set var="i" value="${i+1}"/>
       </c:forEach>
       <!-- end of forEach history in the category -->
       
         <tr>
           <c:choose>
             <c:when test="${isGeneRec}">
               <td colspan="9" onmouseover="hideAnyName()" align="left">
             </c:when>
             <c:otherwise>
               <td colspan="8" onmouseover="hideAnyName()" align="left">
             </c:otherwise>
           </c:choose>
                  <input type="button"
                         value="Delete All Histories" 
                         onclick="deleteAllHistories()"/>
               </td>
         <tr>
       </table>
       </html:form> <!-- end of the html:form for rename query -->
      </td>
      </tr>
      <tr>
        <c:choose>
          <c:when test="${isGeneRec && showOrthoLink}"><td colspan="9" align="left"></c:when>
          <c:otherwise><td colspan="8" align="left"></c:otherwise>
	</c:choose>
          <html:form method="get" action="/processBooleanExpression.do">
              <span id="comb_title_${type}">Combine results</span>:
              <span id="comb_input_${type}">
                 <html:text property="booleanExpression" value=""/>
              </span>
              <html:hidden property="historySectionId" value="${type}"/>
              <html:submit property="submit" value="Get Combined Result"/>
              <font size="-1">[eg: 1 or ((4 and 3) not 2)]</font>
          </html:form>
        </td>
      </tr>

  </table>

</c:forEach>

<table>
<tr><td><font face="Arial,Helvetica" size="-1">
<b>Understanding AND, OR and NOT</b>:</font>
<table border='0' cellspacing='3' cellpadding='0'>
  <tr>
    <td width='100'><font face="Arial,Helvetica" size="-1"><b>1 and 2</b></font></td>
    <td><font face="Arial,Helvetica" size="-1">Genes that 1 and 2 have in common. You can also use "1 intersect 2".</font></td>
  </tr>
  <tr>
    <td width='100'><font face="Arial,Helvetica" size="-1"><b>1 or 2</b></font></td>
    <td><font face="Arial,Helvetica" size="-1">Genes present in 1 or 2, or both. You can also use "1 union 2".</font></td>
  </tr>
  <tr>
    <td width='100'><font face="Arial,Helvetica" size="-1"><b>1 not 2</b></font></td>
    <td><font face="Arial,Helvetica" size="-1">Genes in 1 but not in 2. You can also use "1 minus 2".</font></td>
  </tr>
</table>
</td></tr>
<tr><td>
  <font face="Arial,Helvetica" size="-1">
  <a name='nodelete'><b>*</b></a> If you want to delete a query, you must first delete all other boolean queries that uses this one as a component.
  </font>
</td></tr>
</table>


  </c:otherwise>
</c:choose> <!-- end of deciding history emptiness -->


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
