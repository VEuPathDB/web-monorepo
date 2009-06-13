<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<!-- get wdkAnswer from requestScope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="strategy" value="${requestScope.wdkStrategy}"/>
<c:set var="step" value="${requestScope.wdkHistory}"/>
<c:set var="stepId" value="${step.stepId}"/>
<c:set var="wdkAnswer" value="${requestScope.wdkAnswer}"/>
<c:set var="qName" value="${wdkAnswer.question.fullName}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="summaryUrl" value="${wdk_summary_url}" />
<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>


<c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />

<c:set var="global" value="${wdkUser.globalPreferences}"/>
<c:set var="showParam" value="${global['preference_global_show_param']}"/>
<c:set value="${wdkAnswer.recordClass.type}" var="wdkAnswerType"/>

<c:choose>
  <c:when test='${wdkAnswer.resultSize == 0}'>
    <pre>${wdkAnswer.resultMessage}</pre>
  </c:when>
  <c:otherwise>


<h2><table width="100%"><tr><td><span id="text_strategy_number">${strategy.name}</span> 
    (step <span id="text_step_number">${strategy.length}</span>) 
    - ${wdkAnswer.resultSize} <span id="text_data_type">Files</span></td></tr></table>
</h2>

<pg:pager isOffset="true"
          scope="request"
          items="${wdk_paging_total}"
          maxItems="${wdk_paging_total}"
          url="${wdk_paging_url}"
          maxPageItems="${wdk_paging_pageSize}"
          export="currentPageNumber=pageNumber">



<table cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr><td valign="top" width="75px" style="background-color: #DDDDDD">  
    <table width="100%" border="0" cellpadding="3" cellspacing="0">
      <tr class="subheaderrow">
        <th nowrap> 
          <wdk:pager pager_id="top"/> 
        </th>
        <th nowrap align="right">
           <%-- display a list of sortable attributes --%>
           <c:set var="addAttributes" value="${wdkAnswer.displayableAttributes}" />
           <select id="addAttributes" onChange="addAttr('${commandUrl}')">
               <option value="">--- Add Column ---</option>
               <c:forEach items="${addAttributes}" var="attribute">
                 <option value="${attribute.name}">${attribute.displayName}</option>
               </c:forEach>
           </select>
        </th>
        <th nowrap align="right" width="5%">
             &nbsp;
             <input type="button" value="Reset Columns" onClick="resetAttr('${commandUrl}')" />
        </th>
      </tr>
    </table>	
  </td></tr>
</table>

<c:set var="sortingAttrNames" value="${wdkAnswer.sortingAttributeNames}" />
<c:set var="sortingAttrOrders" value="${wdkAnswer.sortingAttributeOrders}" />
<table id="Results_Table" width="100%" border="0" cellpadding="3" cellspacing="0">
<thead>
<tr class="headerrow">
  <c:set var="j" value="0"/>
  <c:forEach items="${wdkAnswer.summaryAttributes}" var="sumAttrib">

    <c:if test="${j != 0}">
    
    <c:set var="attrName" value="${sumAttrib.name}" />
    <th id="${attrName}" align="left" valign="middle">

        <div style="float:left; min-height:20px; width:20px;">
          <c:choose>
            <c:when test="${!sumAttrib.sortable}">
              <img style="float:left;" src="/assets/images/results_arrw_up_blk.png" border="0" alt="Sort up"/>
            </c:when>
            <c:when test="${attrName == sortingAttrNames[0] && sortingAttrOrders[0]}">
              <img style="float:left;" src="/assets/images/results_arrw_up_gr.png"  alt="Sort up" 
                  title="Result is sorted by ${sumAttrib}" />
            </c:when>
            <c:otherwise>
              <%-- display sorting buttons --%>
              <a style="float:left;" href="javascript:GetResultsPage('${commandUrl}&command=sort&attribute=${attrName}&sortOrder=asc', true)"
                  title="Sort by ${sumAttrib}">
                  <img src="/assets/images/results_arrw_up.png" alt="Sort up" border="0" /></a>
            </c:otherwise>
          </c:choose>
	  <c:choose>
            <c:when test="${!sumAttrib.sortable}">
	      <img style="float:left;" src="/assets/images/results_arrw_dwn_blk.png" border="0" />
	    </c:when>
            <c:when test="${attrName == sortingAttrNames[0] && !sortingAttrOrders[0]}">
              <img style="float:left;" src="/assets/images/results_arrw_dwn_gr.png" alt="Sort down" 
	                    title="Result is sorted by ${sumAttrib}" />
            </c:when>
            <c:otherwise>
              <%-- display sorting buttons --%>
              <a style="float:left;" href="javascript:GetResultsPage('${commandUrl}&command=sort&attribute=${attrName}&sortOrder=desc', true)"
	                    title="Sort by ${sumAttrib}">
              <img src="/assets/images/results_arrw_dwn.png" alt="Sort down" border="0" /></a>
            </c:otherwise>
          </c:choose>
        </div>
        <div style="float:left;">${sumAttrib.displayName}</div>
        <c:if test="${j != 0}">
          <div style="float:left;">
            <%-- display remove attribute button --%>
            <a href="javascript:GetResultsPage('${commandUrl}&command=remove&attribute=${attrName}', true)"
                        title="Remove ${sumAttrib} column">
              <img src="/assets/images/results_x.png" alt="Remove" border="0" /></a>
          </div>
        </c:if>

    </th>

    </c:if>

  <c:set var="j" value="${j+1}"/>
  </c:forEach>
</tr>
</thead>

<c:forEach items="${wdkAnswer.records}" var="r">
    <c:set value="${r.summaryAttributes['filename']}" var="filename"/>
</c:forEach>

<c:set var="i" value="0"/>

<c:forEach items="${wdkAnswer.records}" var="record">


<c:choose>
  <c:when test="${i % 2 == 0}"><tr class="lines"></c:when>
  <c:otherwise><tr class="linesalt"></c:otherwise>
</c:choose>

  <c:set var="j" value="0"/>

  <c:forEach items="${wdkAnswer.summaryAttributeNames}" var="sumAttrName">

    <c:if test="${j != 0}">

    <c:set value="${record.summaryAttributes[sumAttrName]}" var="recAttr"/>
    <c:set var="align" value="align='${recAttr.attributeField.align}'" />
    <c:set var="nowrap">
        <c:if test="${recAttr.attributeField.nowrap}">nowrap</c:if>
    </c:set>

    <c:set value="${record.primaryKey}" var="primaryKey"/>
    <c:set var="pkValues" value="${primaryKey.values}" />
    <c:set var="projectId" value="${pkValues['project_id']}" />
    <c:set var="id" value="${pkValues['source_id']}" />

    <td ${align} ${nowrap}>
      <c:set var="recNam" value="${record.recordClass.fullName}"/>
      <c:set var="fieldVal" value="${recAttr.briefValue}"/>
      <c:choose>

        <c:when test="${recAttr.name eq 'filename'}">
          <a href="<c:url value="/communityDownload.do?fname=${fieldVal}" />">${fieldVal}</a><br>
          
        </c:when>

        <c:otherwise>
          <!-- need to know if fieldVal should be hot linked -->
          <c:choose>
			<c:when test="${fieldVal == null || fn:length(fieldVal) == 0}">
               <span style="color:gray;">N/A</span>
            </c:when>
            <c:when test="${recAttr.class.name eq 'org.gusdb.wdk.model.LinkAttributeValue'}">
               <c:choose>
		  <c:when test="${fn:containsIgnoreCase(dispModelName, 'EuPathDB')}">
		    <a href="javascript:create_Portal_Record_Url('','${projectId}','','${recAttr.url}')">
                      ${recAttr.displayText}</a>
	          </c:when>
	          <c:otherwise>
		    <a href="${recAttr.url}">${recAttr.displayText}</a>
		  </c:otherwise>
	       </c:choose>
            </c:when>
            <c:otherwise>
              ${fieldVal}
            </c:otherwise>
          </c:choose>

        </c:otherwise>
      </c:choose>
    </td>

    </c:if>
    
    <c:set var="j" value="${j+1}"/>
  </c:forEach>
</tr>
<c:set var="i" value="${i+1}"/>
</c:forEach>


  <wdk:pager pager_id="bottom"/>
</pg:pager>



  </c:otherwise>
</c:choose>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table>
