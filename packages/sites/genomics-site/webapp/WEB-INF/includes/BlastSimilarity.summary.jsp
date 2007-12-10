<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<!-- get wdkAnswer from requestScope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="history" value="${requestScope.wdkHistory}"/>
<c:set var="historyId" value="${history.historyId}"/>
<c:set var="wdkAnswer" value="${requestScope.wdkAnswer}"/>
<c:set var="qName" value="${wdkAnswer.question.fullName}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="summaryUrl" value="${wdk_summary_url}" />
<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>


<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />
<c:set var="showOrthoLink" value="${fn:containsIgnoreCase(modelName, 'plasmodb') || fn:containsIgnoreCase(modelName, 'apidb')}" />

<c:set var="global" value="${wdkUser.globalPreferences}"/>
<c:set var="showParam" value="${global['preference_global_show_param']}"/>

<!-- display page header with wdkAnswer's recordClass's type as banner -->
<c:set value="${wdkAnswer.recordClass.type}" var="wdkAnswerType"/>


<site:header title="Queries & Tools :: BLAST Result"
                 banner="${wdkAnswerType} Result [BLAST]"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="BLAST Result"
                 division="queries_tools"/>

<script language="JavaScript" type="text/javascript">
<!--

var showParam = "${showParam}";

function enableRename() {
   var nameText = document.getElementById('nameText');
   nameText.style.display = 'none';
   
   var nameInput = document.getElementById('nameInput');
   nameInput.style.display='block';
   
   var nameBox = document.getElementById('customHistoryName');
   nameBox.value = '${history.customName}';
   nameBox.select();
   nameBox.focus();
}

function disableRename() {
   var nameInput = document.getElementById('nameInput');
   nameInput.style.display='none';
   
   var nameText = document.getElementById('nameText');
   nameText.style.display = 'block';
}

function savePreference()
{
    // construct url
    var url = "<c:url value='/savePreference.do'/>";
    url = url + "?preference_global_show_param=" + showParam;
    
    // commit the preference
    var xmlObj = null;

	if(window.XMLHttpRequest){
		xmlObj = new XMLHttpRequest();
	} else if(window.ActiveXObject){
		xmlObj = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
        // ajax is not supported??
		return;
	}
	
	xmlObj.open( 'GET', url, true );
	xmlObj.send('');

}

function showParameter(isShow) 
{
    var showLink = document.getElementById("showParamLink");
    var showArea = document.getElementById("showParamArea");

    showParam = isShow;
      
    if (isShow == "yes") {
        showLink.innerHTML = "<a href=\"#\" onclick=\"return showParameter('no');\">Hide</a>";
        showArea.style.display = "block";
    } else {
        showLink.innerHTML = "<a href=\"#\" onclick=\"return showParameter('yes');\">Show</a>";
        showArea.style.display = "none";
    }
    
    // save preference via ajax
    savePreference();
    
    return false;
}


function addAttr() {
    var attributeSelect = document.getElementById("addAttributes");
    var index = attributeSelect.selectedIndex;
    var attribute = attributeSelect.options[index].value;
    
    if (attribute.length == 0) return;

    var url = "${commandUrl}&command=add&attribute=" + attribute;
    window.location.href = url;
}


function resetAttr() {
    if (confirm("Are you sure to reset the column layout?")) {
        var url = "${commandUrl}&command=add&attribute=" + attribute;
        invokeAction(url, false, summaryCallback);
        window.location.href = url;
    }
}


//-->
</script>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<!-- display question and param values and result size for wdkAnswer -->
<table border="0" cellspacing="1" cellpadding="1">
    <c:set var="paddingStyle" value="" />
    <c:if test="${history.boolean}">
       <c:set var="paddingStyle" value="style='padding-left:40px;'" />
    </c:if>
    
    <!-- display query name -->
    <tr>
       <td valign="top" align="right" width="10" nowrap><b>Query:&nbsp; </b></td>
          <html:form method="get" action="/renameHistory.do">
       <td valign="top" align="left" ${paddingStyle}>
             <div id="nameText" onclick="enableRename()">
                <table border='0' cellspacing='2' cellpadding='0'>
                   <tr>
                      <td align="left">${history.customName}</td>
                      <td align="right"><input type="button" value="Rename" onclick="enableRename()" /></td>
                   </tr>
                </table>
             </div>
             <div id="nameInput" style="display:none">
                <table border='0' cellspacing='2' cellpadding='0'>
                   <tr>
                      <td><input name='wdk_history_id' type='hidden' value="${history.historyId}"/></td>
                      <td><input id='customHistoryName' name='customHistoryName' type='text' size='50' 
                                maxLength='2000' value="${history.customName}"/></td>
                      <td><input type='submit' value='Update'></td>
                      <td><input type='reset' value='Cancel' onclick="disableRename()"/></td>
                   </tr>
                </table>
             </div>
       </td>
          </html:form>
    </tr>



    <!-- display parameters -->
    <tr>
       <td valign="top" align="right" width="10" nowrap><b>Details:&nbsp; </b></td>
       <td align="left" valign="bottom">
          <div ${paddingStyle} id="showParamLink">
                <c:choose>
                   <c:when test="${showParam == 'yes'}">
                      <a href="#" onclick="return showParameter('no');">Hide</a>
                   </c:when>
                   <c:otherwise>
                      <a href="#" onclick="return showParameter('yes');">Show</a>
                   </c:otherwise>
                </c:choose>
            </div>
       </td>
    </tr>

    <tr>
       <td></td>
       <td ${paddingStyle}>
          <!-- a section to display/hide params -->
          <c:choose>
             <c:when test="${showParam == 'yes'}">
                <div id="showParamArea" style="background:#EEEEEE;">
             </c:when>
             <c:otherwise>
                <div id="showParamArea" style="display:none; background:#EEEEEE;">
             </c:otherwise>
          </c:choose>
                    <c:choose>
                        <c:when test="${wdkAnswer.isBoolean}">
                            <div>
                                <%-- boolean question --%>
                                <nested:root name="wdkAnswer">
                                    <jsp:include page="/WEB-INF/includes/bqShowNode.jsp"/>
                                </nested:root>
	                        </div>
                        </c:when>
                        <c:otherwise>
                            <wdk:showParams wdkAnswer="${wdkAnswer}" />
                        </c:otherwise>
                    </c:choose>
                </div>
       </td>
    </tr>



    
    <!-- display result size -->
    <tr>
       <td valign="top" align="right" width="10" nowrap><b>Results:&nbsp; </b></td>
       <td valign="top" align="left" ${paddingStyle}>
          ${wdkAnswer.resultSize}
          <c:if test="${wdkAnswer.resultSize > 0}">
             (showing ${wdk_paging_start} to ${wdk_paging_end})
<%--
              <c:if test="${fn:containsIgnoreCase(dispModelName, 'ApiDB')}">
                 <site:apidbSummary/>
             </c:if>
--%>

          </c:if>
       </td>
    </tr>
    <tr>
       <td colspan="2" align="left">
           <a href="downloadHistoryAnswer.do?wdk_history_id=${historyId}">
               Download</a>&nbsp;|&nbsp;
           <a href="<c:url value="/showQueryHistory.do"/>">Combine with other results</a>
	       
           <c:set value="${wdkAnswer.recordClass.fullName}" var="rsName"/>
           <c:set var="isGeneRec" value="${fn:containsIgnoreCase(rsName, 'GeneRecordClass')}"/>
           <c:set var="isContigRec" value="${fn:containsIgnoreCase(rsName, 'ContigRecordClass')}"/>
	       <c:if test="${isGeneRec && showOrthoLink}">
	           &nbsp;|&nbsp;
               <c:set var="datasetId" value="${wdkAnswer.datasetId}"/>
               <c:set var="dsColUrl" value="showQuestion.do?questionFullName=InternalQuestions.GenesByOrthologs&historyId=${wdkUser.signature}:${historyId}&plasmodb_dataset=${datasetId}&questionSubmit=Get+Answer&goto_summary=0"/>
               <a href='<c:url value="${dsColUrl}"/>'>Orthologs</a>
           </c:if>
	       
               <c:set value="${wdkAnswer.question.fullName}" var="qName" />
	       <c:if test="${history.boolean == false}">
	           &nbsp;|&nbsp;
                   <c:set value="${wdkAnswer.questionUrlParams}" var="qurlParams"/>
	           <c:set var="questionUrl" value="" />
                   <a href="showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">
                   <%--<a href="showQuestion.do?questionFullName=${qName}${qurlParams}&questionSubmit=Get+Answer&goto_summary=0">--%>
	           Revise query</a>
	       </c:if>
       </td>
    </tr>
</table>

<hr>

<!-- handle empty result set situation -->
<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    <pre>${wdkAnswer.resultMessage}</pre>
  </c:when>
  <c:otherwise>

<!-- content of blast result -->
<table width="100%" border="0" cellpadding="8" cellspacing="0">

<tr><td>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="headerI" value="${record.summaryAttributes['Header'].value}"/>
  <c:set var="footerI" value="${record.summaryAttributes['Footer'].value}"/>
  <c:if test="${ headerI != '' }">
     <c:set var="headerStr" value="${headerI}"/>
  </c:if>
  <c:if test="${ footerI != '' }">
     <c:set var="footerStr" value="${footerI}"/>
  </c:if>
</c:forEach>

<c:set var="junk" value="${wdkAnswer.resetAnswerRowCursor}"/>

<c:set var="sumSect" value=""/>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="tabRow" value="${record.summaryAttributes['TabularRow'].value}"/>
  <c:set var="tabRow" value="${fn:trim(tabRow)}"/>

  <%-- as required in federated context, the blast webservice plugin will do the record linking instead --%>
  <%--
  <c:set var="tabRowFields" value="${fn:split(tabRow, ' ')}"/>
  <c:set var="f1" value="${tabRowFields[0]}"/>
  <c:set var="f2" value="${fn:substringAfter(tabRow, f1)}"/>
  <c:set var="recNam" value="${record.recordClass.fullName}"/>
  <c:set var="projId" value="${record.primaryKey.projectId}"/>
  <c:set var="recUrl" value="showRecord.do?name=${recNam}&project_id=${projId}&primary_key=${f1}"/>
  <c:set var="sumSect" value="${sumSect}<br><a href='${recUrl}'>${f1}</a>${f2}"/>
  --%>

  <c:set var="sumSect" value="${sumSect}<br>${tabRow}"/>
</c:forEach>
<PRE>${headerStr}${sumSect}</PRE>

<c:set var="junk" value="${wdkAnswer.resetAnswerRowCursor}"/>

<c:set var="algnSect" value=""/>
<c:forEach items="${wdkAnswer.records}" var="record">
  <c:set var="algn" value="${record.summaryAttributes['Alignment'].value}"/>

  <%-- as required in federated context, the blast webservice plugin will do the record linking instead --%>
  <%--
  <c:set var="recNam" value="${record.recordClass.fullName}"/>
  <c:set var="recId" value="${record.primaryKey.recordId}"/>
  <c:set var="projId" value="${record.primaryKey.projectId}"/>
  <c:set var="recUrl" value="showRecord.do?name=${recNam}&project_id=${projId}&primary_key=${recId}"/>
  <c:set var="recLink" value="<a href='${recUrl}'>${recId}</a>"/>
  <c:set var="algnSect" value="${algnSect}${fn:replace(algn, recId, recLink)}"/>
  --%>

  <c:set var="algnSect" value="${algnSect}${algn}"/>
</c:forEach>
<PRE>${algnSect}${footerStr}</PRE>


</td></tr>
</table>

  </c:otherwise>
</c:choose>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
