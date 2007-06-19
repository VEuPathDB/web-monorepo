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
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apiModel') || fn:containsIgnoreCase(modelName, 'cryptodb')}" />
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

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

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


<c:set var="typeC" value="0"/>
<!-- begin of showing user answers grouped by RecordTypes -->
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
        <!-- begin of the html:form for rename query -->
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
         <c:set var="historyId" value="${history.historyId}"/>
         <jsp:setProperty name="history" property="nameTruncateTo" value="${NAME_TRUNC}"/>

         <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
         </c:choose>

         <td>${historyId}
	        <!-- begin of floating info box -->
            <div id="div_${historyId}" 
	             class="medium"
                 style="display:none;font-size:8pt;width:610px;position:absolute;left:0;top:0;"
                 onmouseover="hideAnyName()">
                <table cellpadding="2" cellspacing="0" border="0"bgcolor="#ffffCC">
                    <c:set var="wdkAnswer" value="${history.answer}"/>
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
        <td align='right' onmouseover="hideAnyName()" nowrap>${history.estimateSize}</td>
        <c:if test="${isGeneRec && showOrthoLink}">
           
           <td nowrap>
                <c:set var="dsColUrl" 
                       value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${wdkUser.signature}:${historyId}&questionSubmit=Get+Answer&goto_summary=0"/>
                <a href='<c:url value="${dsColUrl}"/>'>${dsColVal}</a>
           </td>	    
        </c:if>
		
        <c:set value="${history.answer.question.fullName}" var="qName" />
        
        <td nowrap>
            <c:set var="surlParams">
                <c:choose>
                    <c:when test="${history.boolean == false}">
                        showSummary.do?questionFullName=${qName}${history.answer.summaryUrlParams}
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
		          <c:set var="qurlParams" value="${history.answer.questionUrlParams}"/>
                  <a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">revise</a>
	           </c:when>
	           <c:otherwise>
	          <c:set value="${history.booleanExpression}" var="expression"/>
	             <a href="#" onclick="return reviseBooleanQuery('${type}', '${expression}')">revise</a>
	          </c:otherwise>
	        </c:choose>
         </td>

         <td nowrap>
             <a href="deleteHistory.do?wdk_history_id=${historyId}"
                title="delete saved query #${historyId}"
                onclick="return deleteHistory('${historyId}', '${history.customName}');">delete</a>
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
           </td>
        <tr>
       </table>
       </html:form> 
       <!-- end of the html:form for rename query -->
       
      </td>
      </tr>
      <tr>
         <td>
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
<!-- end of showing user answers grouped by RecordTypes -->

<c:if test="${typeC != 1}"><hr></c:if>

<table>
   <tr>
      <td class="medium">
         <div>&nbsp;</div>
         <!-- display "delete all button" -->
         <input type="button" value="Delete All Queries" onclick="deleteAllHistories()"/><br>
         <div style="padding-left: 20px">
            <i>Be careful: This will delete all your queries on ${wdkModel.displayName}.</i>
         </div>
         &nbsp;
      </td>
   </tr>
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
   <tr>
      <td>
         <font class="medium">
            <a name='nodelete'><b>*</b></a> 
            If you want to delete a query, you must first delete all other boolean queries that uses this one as a component.
         </font>
      </td>
   </tr>
</table>


  </c:otherwise>
</c:choose> 
<!-- end of deciding history emptiness -->

<!-- display invalid history list -->
<c:set var="invalidHistories" value="${wdkUser.invalidHistories}" />
<c:if test="${fn:length(invalidHistories) > 0}">

    <hr>

    <a name="incompatible"></a><h3>Incompatible Queries</h3>

    <p>This section lists your queries from previous versions of ${wdkModel.displayName} that
        are no longer compatible with the current version of ${wdkModel.displayName}.  In most
        cases, you will be able to work around the incompatibility by finding an
        equivalent query in this version, and running it with similar parameter
        values.</p>
    <p>If you have problems <a href="<c:url value="help.jsp" />">drop us a line</a>.</p>

    <table>

        <tr class="headerRow">
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

                <td nowrap>
                    <a href="deleteHistory.do?wdk_history_id=${historyId}"
                       title="delete saved query #${historyId}"
                       onclick="return deleteHistory('${historyId}', '${history.customName}');">delete</a>
                </td>

            </tr>
            <c:set var="i" value="${i+1}"/>
        </c:forEach>

        <!-- delete all invalid histories -->
        <tr>
          <td colspan="5" class="medium">
             <div>&nbsp;</div>
             <%-- display delete all invalid histories button --%>
             <input type="button" value="Delete All Incompatible Queries" onclick="deleteAllInvHists()"/><br>
             <div style="padding-left: 20px">
                <i>Be careful: This will delete all your incompatible queries on ${wdkModel.displayName}.</i>
             </div>
             &nbsp;
          </td>
       </tr>
    </table>
</c:if>

<!-- end of display invalid history list -->


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
