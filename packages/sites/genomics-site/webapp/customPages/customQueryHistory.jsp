<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<c:set var="NAME_TRUNC" value="60" />

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="histories" value="${wdkUser.historiesByCategory}"/>
<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>
<c:if test="${dsCol == null}"><c:set var="dsCol" value=""/></c:if>
<c:if test="${dsColVal == null}"><c:set var="dsColVal" value="orthologs"/></c:if>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.name}"/>
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb') || fn:containsIgnoreCase(modelName, 'cryptodb')}" />
<c:set var="invalidHistories" value="${wdkUser.invalidHistories}" />

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
                   + "<input id='customHistoryName' name='customHistoryName' type='text' size='42' maxLength='2000' value='" + customName + "'></td>" 
                   + "<td><input type='submit' value='Update'></td>"
                   + "<td><input type='reset' value='Cancel' onclick='disableRename()'>"
                   + "</td></tr></table>";
   input.style.display='block';
   var nameBox = document.getElementById('customHistoryName');
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

function deleteHistory(historyId, customName) {
    var agree=confirm("Are you sure you want to delete the query history:\n[#"
                      + historyId + "] \"" + customName + "\"?");
    return (agree)? true : false ;
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

function deleteAllInvHists() {
    var agree=confirm("Are you sure you want to delete all your query histories?");
    if (agree) {
       window.location.href = "<c:url value='/deleteAllHistories.do?invalid=true'/>";
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
<script type='text/javascript' src='<c:url value="/js/lib/jquery-1.2.6.js"/>'></script>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- show error messages, if any -->
<wdk:errors/>

<!-- display a link to incompatible histories -->
<c:if test="${fn:length(invalidHistories) > 0}">
    <p><i>Note</i>: some of your saved queries are not compatible with the current
        version of ${wdkModel.displayName}.  See <a href="#incompatible">Incompatible Queries</a>.</p>
</c:if>

<!-- decide whether history is empty -->
<c:choose>
  <c:when test="${wdkUser == null || wdkUser.historyCount == 0}">

<table align="center"><tr><td> *** Your history is empty *** </td></tr></table>

  </c:when>
  <c:otherwise>
  <c:set var="typeC" value="0"/>  <!-- begin creating tabs for history sections -->
  <ul id="history_tabs">
  <c:forEach items="${histories}" var="historyEntry">
  <c:set var="type" value="${historyEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
  <c:set var="histList" value="${historyEntry.value}"/>
  <c:set var="recordClass" value="${histList[0].answer.question.recordClass}"/>
  <c:set var="recDispName" value="${recordClass.type}"/>
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>

  <c:set var="typeC" value="${typeC+1}"/>
  <c:choose>
    <c:when test="${typeC == 1}">
      <li id="selected">
    </c:when>
    <c:otherwise>
      <li>
    </c:otherwise>
  </c:choose>
  <a id="tab_${recTabName}" onclick="displayHist('${recTabName}')"
  href="javascript:void(0)">${recDispName}&nbsp;Queries</a></li>
  </c:forEach>
  <c:if test="${fn:length(invalidHistories) > 0}">
    <li><a id="tab_incompatible" onclick="displayHist('incompatible')" href="javascript:void(0)">Incompatible&nbsp;Queries</a></li>
  </c:if>
  </ul>
<!-- select/delete controls, dreaded table layout -->
<table class="clear_all">
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">clear all</a></td>
      <td></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteHistories('deleteHistory.do?wdk_history_id=')"/>
      </td>
   </tr>
</table>
<c:set var="typeC" value="0"/> 
<!-- begin creating divs to display history sections -->
<c:forEach items="${histories}" var="historyEntry">
  <c:set var="type" value="${historyEntry.key}"/>
  <c:set var="isGeneRec" value="${fn:containsIgnoreCase(type, 'GeneRecordClass')}"/>
  <c:set var="histList" value="${historyEntry.value}"/>
  <c:set var="recordClass" value="${histList[0].answer.question.recordClass}"/>
  <c:set var="recDispName" value="${recordClass.type}"/>
  <c:set var="recTabName" value="${fn:substring(recDispName, 0, fn:indexOf(recDispName, ' ')-1)}"/>
  
  <c:set var="showTransform" value="${isGeneRec && modelName eq 'ToxoDB'}" />

<c:set var="typeC" value="${typeC+1}"/>    <c:choose>
      <c:when test="${typeC == 1}">
        <div id="panel_${recTabName}" class="history_panel enabled">
      </c:when>
      <c:otherwise>
        <div id="panel_${recTabName}" class="history_panel">
      </c:otherwise> 
    </c:choose>

    <!-- begin of the html:form for rename query -->
    <html:form method="get" action="/renameHistory.do">
      <table border="0" cellpadding="5" cellspacing="0">
      <tr class="headerRow">
          <th onmouseover="hideAnyName()">&nbsp;</th>
          <th>ID</th> 
          <th onmouseover="hideAnyName()">&nbsp;</th>
          <th onmouseover="hideAnyName()">Query</th>
          <c:if test="${isGeneRec}"><th onmouseover="hideAnyName()">Filter</th></c:if>
          <th onmouseover="hideAnyName()">Created</th>
          <th onmouseover="hideAnyName()">Viewed</th>
          <th onmouseover="hideAnyName()">Version</th>
          <th onmouseover="hideAnyName()">Size</th>
          <c:if test="${isGeneRec && showOrthoLink}"><th>&nbsp;${dsCol}</th></c:if>
          <c:if test="${showTransform}">
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </c:if>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
       </tr>

      <c:set var="i" value="0"/>
      
      <!-- begin of forEach history in the category -->
      <c:forEach items="${histList}" var="history">
         <c:set var="historyId" value="${history.historyId}"/>
         <c:set var="wdkAnswer" value="${history.answer}"/>
         <jsp:setProperty name="history" property="nameTruncateTo" value="${NAME_TRUNC}"/>

         <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
         </c:choose>
         <td><input type=checkbox id="${historyId}" onclick="updateSelectedList()"/></td>
         <td>${historyId}
	        <!-- begin of floating info box -->
            <div id="div_${historyId}" 
	             class="medium"
                 style="display:none;font-size:8pt;width:610px;position:absolute;left:0;top:0;"
                 onmouseover="hideAnyName()">
                <table cellpadding="2" cellspacing="0" border="0"bgcolor="#ffffCC">
                    <c:choose>
                        <c:when test="${history.boolean}">
                            <!-- boolean question -->
                            <tr>
                               <td valign="top" align="right" width="10" class="medium" nowrap><b>Query&nbsp;:</b></td>
                               <td valign="top" align="left" class="medium">${wdkAnswer.question.displayName}</td>
                            </tr>
                            <tr>
                               <td align="right" valign="top" class="medium" nowrap><i>Expression</i> : </td>
                               <td class="medium">${history.booleanExpression}</td>
                            </tr>
                            
                            <c:set var="recordClass" value="${wdkAnswer.question.recordClass}"/>
                        </c:when>
                        <c:otherwise>
                            <tr>
                                <td>
                                    <%-- simple question --%>
                                    <wdk:showParams wdkAnswer="${wdkAnswer}" />
                                </td>
                            </tr>
                        </c:otherwise>
                    </c:choose>
              </table>
            </div> 
	        <!-- end of floating info box -->
         </td>
        <td onmouseover="hideAnyName()" nowrap>
           <input type='button' id="btn_${historyId}" value='Rename'
                  onclick="enableRename('${historyId}', '${history.customName}')">
        </td>
        <c:set var="dispNam" value="${history.truncatedName}"/>
        <td width=450 onmouseover="displayName('${historyId}')" onmouseout="hideAnyName()">
            <div id="text_${historyId}"
                 onclick="enableRename('${historyId}', '${history.customName}')">
                 ${dispNam}</div>
            <div id="input_${historyId}" style="display:none"></div>
        </td>
	<c:if test="${isGeneRec}"><td align='center' onmouseover="hideAnyName()" nowrap>${history.filterDisplayName}</td></c:if>
        <td align='center' onmouseover="hideAnyName()" nowrap>${history.displayCreatedTime}</td>
        <td align='center' onmouseover="hideAnyName()" nowrap>${history.displayLastRunTime}</td>
	<td align='right' onmouseover="hideAnyName()" nowrap>
	<c:choose>
	  <c:when test="${history.version == null || history.version eq ''}">${wdkModel.version}</c:when>
          <c:otherwise>${history.version}</c:otherwise>
        </c:choose>
        </td>
        <td align='right' onmouseover="hideAnyName()" nowrap>${history.estimateSize}</td>

<%--
        <c:if test="${isGeneRec && showOrthoLink}">
           
           <td nowrap>
                <c:set var="dsColUrl" 
                       value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${wdkUser.signature}:${historyId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a>
           </td>	    
        </c:if>
--%>		
        <c:set value="${wdkAnswer.question.fullName}" var="qName" />
        
        <td nowrap>
            <c:set var="surlParams">
                <c:choose>
                    <c:when test="${history.boolean == false}">
                        showSummary.do?questionFullName=${qName}${wdkAnswer.summaryUrlParams}&wdk_history_id=${historyId}
                    </c:when>
                    <c:otherwise>
                        showSummary.do?wdk_history_id=${historyId}
                    </c:otherwise>
                </c:choose>
            </c:set>
            <a href="${surlParams}">view</a>
        </td>
        <td nowrap><a href="downloadHistoryAnswer.do?wdk_history_id=${historyId}">download</a></td>

         <td nowrap>
            <c:choose>
               <c:when test="${history.boolean == false}">
		          <c:set var="qurlParams" value="${wdkAnswer.questionUrlParams}"/>
                  <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">revise</a>
	           </c:when>
	           <c:otherwise>
	          <c:set value="${history.booleanExpression}" var="expression"/>
	             <a href="#" onclick="return reviseBooleanQuery('${type}', '${expression}')">revise</a>
	          </c:otherwise>
	        </c:choose>
         </td>

         <c:if test="${isGeneRec && showOrthoLink}">
           
           <td nowrap>
                <c:set var="dsColUrl" 
                       value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&geneHistoryId=${wdkUser.signature}:${historyId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a>
           </td>	    
         </c:if>

         <%-- display transform button for each history --%>
         <c:if test="${showTransform}">
           <c:set var="result">
             <c:set var="filter" value="${wdkAnswer.filter}" />
             <c:choose>
               <c:when test="${filter == null}">
                 ${wdkAnswer.checksum}
               </c:when>
               <c:otherwise>
                 ${wdkAnswer.checksum}:${filter.name}
               </c:otherwise>
             </c:choose>
           </c:set>
           <td nowrap>
               <c:set var="expandUrl" 
                      value="showSummary.do?questionFullName=InternalQuestions.GenesByExpandResult&myProp%28gene_result%29=${result}"/>
               <a href='<c:url value="${expandUrl}"/>'>Expand</a>
           </td>	    
           <td nowrap>
               <c:set var="transformUrl" 
                      value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologTransform&gene_result=${result}&questionSubmit=Get+Answer&goto_summary=0"/>
               <a href='<c:url value="${transformUrl}"/>'>Orthologs</a>
           </td>	    
         </c:if>
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
           </td>
        <tr>
       </table>
       </html:form> 
       <!-- end of the html:form for rename query -->
       </div>

</c:forEach>
<!-- end of showing user answers grouped by RecordTypes -->

       <div>
            <html:form method="get" action="/processBooleanExpression.do">
               <span id="comb_title_${type}">Combine results</span>:
               <span id="comb_input_${type}">
                  <html:text property="booleanExpression" value=""/>
               </span>

               <c:if test="${showTransform}">
                  <html:radio property="useBooleanFilter" value="true" >On gene level</html:radio>
                  <html:radio property="useBooleanFilter" value="false">On instance level</html:radio>
               </c:if>
               
               <html:hidden property="historySectionId" value="${type}"/>
               <html:submit property="submit" value="Get Combined Result"/>
               <font size="-1">[eg: 1 or ((4 and 3) not 2)]</font>
            </html:form>
       </div>

  </c:otherwise>
</c:choose> 
<!-- end of deciding history emptiness -->

<!-- display invalid history list -->
<c:set var="invalidHistories" value="${wdkUser.invalidHistories}" />
<c:if test="${fn:length(invalidHistories) > 0}">
  <c:choose>
  <c:when test="${wdkUser.historyCount == 0}">
    <ul id="history_tabs">
    <li><a id="tab_incompatible" onclick="displayHist('incompatible')" href="javascript:void(0)">Incompatible&nbsp;Queries</a></li>
    </ul>
<!-- select/delete controls, dreaded table layout -->
<table class="clear_all">
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">clear all</a></td>
      <td></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteHistories('deleteHistory.do?wdk_history_id=')"/>
      </td>
   </tr>
</table>
    <div id="panel_incompatible" class="history_panel enabled">
  </c:when>
  <c:otherwise>
    <div id="panel_incompatible" class="history_panel">
  </c:otherwise>
  </c:choose>
    <p>This section lists your queries from previous versions of ${wdkModel.displayName} that
        are no longer compatible with the current version of ${wdkModel.displayName}.  In most
        cases, you will be able to work around the incompatibility by finding an
        equivalent query in this version, and running it with similar parameter
        values.</p>
    <p>If you have problems <a href="<c:url value="help.jsp" />">drop us a line</a>.</p>

    <table>

        <tr class="headerRow">
            <th onmouseover="hideAnyName()">&nbsp;</th>
            <th>ID</th> 
            <th onmouseover="hideAnyName()">Query</th>
            <th onmouseover="hideAnyName()">Size</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
        </tr>

        <c:forEach items="${invalidHistories}" var="history">
            <tr>
                <c:set var="historyId" value="${history.historyId}"/>
                <jsp:setProperty name="history" property="nameTruncateTo" value="${NAME_TRUNC}"/>

                <c:choose>
                    <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
                    <c:otherwise><tr class="rowMedium"></c:otherwise>
                </c:choose>

                <td><input type=checkbox id="${historyId}" onclick="updateSelectedList()"/></td>
                <td class="medium">${historyId}
	               <!-- begin of floating info box -->
                   <div id="div_${historyId}" 
	                    class="medium"
                        style="display:none;font-size:8pt;width:610px;position:absolute;left:0;top:0;"
                        onmouseover="hideAnyName()">
                       <table cellpadding="2" cellspacing="0" border="0"bgcolor="#ffffCC">
                           <tr>
                              <td valign="top" align="right" width="10" class="medium" nowrap><b>Query&nbsp;:</b></td>
                              <td valign="top" align="left" class="medium">${history.customName}</td>
                           </tr>

                           <c:set var="params" value="${history.params}"/>
                           <c:set var="paramNames" value="${history.paramNames}"/>
                           <c:forEach items="${params}" var="item">
                               <c:set var="pName" value="${item.key}"/>
                               <tr>
                                  <td align="right" valign="top" class="medium" nowrap><i>${paramNames[pName]}</i> : </td>
                                  <td class="medium">${item.value}</td>
                               </tr>
                           </c:forEach>
                     </table>
                   </div> 
	               <!-- end of floating info box -->
                </td>
                <c:set var="dispNam" value="${history.truncatedName}"/>
                <td onmouseover="displayName('${historyId}')" onmouseout="hideAnyName()">
                    <div id="text_${historyId}">${dispNam}</div>
                    <div id="input_${historyId}" style="display:none"></div>
                </td>
                <td align='right' onmouseover="hideAnyName()" nowrap>${history.estimateSize}</td>

                <td nowrap>
                    <c:set var="surlParams" value="showSummary.do?wdk_history_id=${historyId}" />
                    <a href="${surlParams}">show</a>
                </td>
            </tr>
            <c:set var="i" value="${i+1}"/>
        </c:forEach>
    </table>
   </div>
</c:if>

<!-- end of display invalid history list -->

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 
<!-- <c:if test="${typeC != 1}"><hr></c:if> -->

<c:if test="${fn:length(invalidHistories) > 0 || (wdkUser != null && wdkUser.historyCount != 0)}">
<table>
   <tr>
      <td><a class="check_toggle" onclick="selectAllHist()" href="javascript:void(0)">select all</a>&nbsp|&nbsp;
          <a class="check_toggle" onclick="selectNoneHist()" href="javascript:void(0)">clear all</a></td>
      <td></td>
      <td class="medium">
         <!-- display "delete button" -->
         <input type="button" value="Delete" onclick="deleteHistories('deleteHistory.do?wdk_history_id=')"/>
      </td>
   </tr>
</table>
<table>
   <tr>
      <td>
         <!-- display helper information -->
         <font class="medium"><b>Understanding AND, OR and NOT</b>:</font>
         <table border='0' cellspacing='3' cellpadding='0'>
            <tr>
               <td width='100'><font class="medium"><b>1 and 2</b></font></td>
               <td><font class="medium">Genes that 1 and 2 have in common. You can also use "1 intersect 2".</font></td>
            </tr>
            <tr>
               <td width='100'><font class="medium"><b>1 or 2</b></font></td>
               <td><font class="medium">Genes present in 1 or 2, or both. You can also use "1 union 2".</font></td>
            </tr>
            <tr>
               <td width='100'><font class="medium"><b>1 not 2</b></font></td>
               <td><font class="medium">Genes in 1 but not in 2. You can also use "1 minus 2".</font></td>
            </tr>
         </table>
      </td>
   </tr>
</table>
</c:if>
<script type='text/javascript' src='<c:url value="/js/history.js"/>'></script>

<site:footer/>
