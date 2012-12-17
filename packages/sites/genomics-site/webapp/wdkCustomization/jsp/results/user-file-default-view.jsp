<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<!-- from old usr view jsp file -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="strategy" value="${requestScope.wdkStrategy}"/>
<c:set var="step" value="${requestScope.wdkStep}"/>
<c:set var="stepId" value="${step.stepId}"/>
<c:set var="wdkAnswer" value="${step.answerValue}"/>
<c:set var="qName" value="${wdkAnswer.question.fullName}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="summaryUrl" value="${wdk_summary_url}" />


<!-- rest copied from wdk resultTable.tag -->
<!--   removed sections for basket (though they could stay now that we set the record tyoe with no basket in teh model)  -->
<!--   removed also some blocks within the wdkAttribute tag code, that were not needed -->
<!-- we should try that  this record type uses the wdk default to render the page -->
  <c:set var="wdkAnswer" value="${step.answerValue}"/>

  <c:set var="qName" value="${wdkAnswer.question.fullName}" />
  <c:set var="modelName" value="${applicationScope.wdkModel.name}" />
  <c:set var="recordName" value="${wdkAnswer.question.recordClass.fullName}" />
  <c:set var="recHasBasket" value="${wdkAnswer.question.recordClass.useBasket}" />
  <c:set var="dispModelName" value="${applicationScope.wdkModel.displayName}" />

  <c:catch var="answerValueRecords_exception">
    <c:set var="answerRecords" value="${wdkAnswer.records}" />
  </c:catch>

  <c:set var="wdkView" value="${requestScope.wdkView}" />

  <jsp:useBean id="typeMap" class="java.util.HashMap"/>
  <c:set target="${typeMap}" property="singular" value="${step.displayType}"/>
  <imp:getPlural pluralMap="${typeMap}"/>
  <c:set var="type" value="${typeMap['plural']}"/>

  <c:set var="isBasket" value="${fn:contains(step.questionName, 'ByRealtimeBasket')}"/>

  <c:choose>
    <c:when test='${answerValueRecords_exception ne null and isBasket}'>
      <div class="ui-widget">
        <div class="ui-state-error ui-corner-all" style="padding:8px;">
          <p>
            <span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
            <div><imp:verbiage key="answer-value-records-error-msg.basket.content"/></div>
          </p>
        </div>
      </div>
    </c:when>
    <c:when test='${answerValueRecords_exception ne null}'>
      <div class="ui-widget">
        <div class="ui-state-error ui-corner-all" style="padding:8px;">
          <p>
            <span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
              <div><imp:verbiage key="answer-value-records-error-msg.default.content"/></div>
          </p>
        </div>
      </div>
    </c:when>
 

   <c:when test='${wdkAnswer.resultSize == 0}'>
      No results are retrieved
<!--  <pre>${wdkAnswer.resultMessage}</pre> -->
    </c:when>


    <c:otherwise>
  
      <!-- pager -->
      <pg:pager isOffset="true"
                scope="request"
                items="${wdk_paging_total}"
                maxItems="${wdk_paging_total}"
                url="${wdk_paging_url}"
                maxPageItems="${wdk_paging_pageSize}"
                export="currentPageNumber=pageNumber">
        <c:forEach var="paramName" items="${wdk_paging_params}">
          <pg:param name="${paramName}" id="pager" />
        </c:forEach>
        <c:if test="${wdk_summary_checksum != null}">
          <pg:param name="summary" id="pager" />
        </c:if>
        <c:if test="${wdk_sorting_checksum != null}">
          <pg:param name="sort" id="pager" />
        </c:if>

    
        <%--------- PAGING/Select columns  TOP BAR ----------%>
        <c:url var="commandUrl" value="/processSummaryView.do?step=${step.stepId}&view=${wdkView.name}" />
        <table  width="100%">
          <tr class="subheaderrow">
            <th style="text-align: left;white-space:nowrap;"> 
              <imp:pager wdkAnswer="${wdkAnswer}" pager_id="top"/> 
            </th>
            <th style="text-align: right;white-space:nowrap;">
              <imp:addAttributes wdkAnswer="${wdkAnswer}" commandUrl="${commandUrl}"/>
            </th>
          </tr>
        </table>
        <%--------- END OF PAGING TOP BAR ----------%>

        <!-- content of current page -->
        <c:set var="sortingAttrNames" value="${wdkAnswer.sortingAttributeNames}" />
        <c:set var="sortingAttrOrders" value="${wdkAnswer.sortingAttributeOrders}" />
        
        <%--------- RESULTS  ----------%>

       <div class="Results_Div flexigrid">
          <div class="bDiv">
            <div class="bDivBox">

              <table  width="100%" class="Results_Table" step="${step.stepId}">

                <thead>
                  <tr class="headerrow">

                    <c:set var="j" value="0"/>

                    <c:forEach items="${wdkAnswer.summaryAttributes}" var="sumAttrib">

 <c:if test="${j != 0}">
                      <c:set var="attrName" value="${sumAttrib.name}" />
                      <th id="${attrName}" align="left" valign="middle">
                        <table>
                          <tr>
                            <td>
                              <table>
                                <tr>
                                  <td style="padding:0;">
                                    <c:choose>
                                      <c:when test="${!sumAttrib.sortable}">
                                        <img src="<c:url value='/wdk/images/results_arrw_up_blk.png'/>" border="0" alt="Sort up"/>
                                      </c:when>
                                      <c:when test="${attrName eq sortingAttrNames[0] and sortingAttrOrders[0]}">
                                        <img src="<c:url value='/wdk/images/results_arrw_up_gr.png'/>"  alt="Sort up" title="Result is sorted by ${sumAttrib}" />
                                      </c:when>
                                      <c:otherwise>

                                        <c:set var="resultsAction" value="javascript:wdk.resultsPage.sortResult('${attrName}', 'asc')" />
                                        <a href="${resultsAction}" title="Sort by ${sumAttrib}">
                                          <img src="<c:url value='/wdk/images/results_arrw_up.png'/>" alt="Sort up" border="0" />
                                        </a>
                                      </c:otherwise>
                                    </c:choose>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:0;">
                                    <c:choose>
                                      <c:when test="${!sumAttrib.sortable}">
                                        <img src="<c:url value='/wdk/images/results_arrw_dwn_blk.png'/>" border="0" />
                                      </c:when>
                                      <c:when test="${attrName eq sortingAttrNames[0] and not sortingAttrOrders[0]}">
                                        <img src="<c:url value='/wdk/images/results_arrw_dwn_gr.png'/>" alt="Sort down" title="Result is sorted by ${sumAttrib}" />
                                      </c:when>
                                      <c:otherwise>

                                        <c:set var="resultsAction" value="javascript:wdk.resultsPage.sortResult('${attrName}', 'desc')" />
                                        <a href="${resultsAction}" title="Sort by ${sumAttrib}">
                                          <img src="<c:url value='/wdk/images/results_arrw_dwn.png'/>" alt="Sort down" border="0" />
                                        </a>
                                      </c:otherwise>
                                    </c:choose>
                                  </td>
                                </tr>
                              </table>
                            </td>

                            <td>
                              <span title="${sumAttrib.help}">${sumAttrib.displayName}</span>
                            </td>

                            <c:if test="${sumAttrib.removable}">
                              <td style="width:20px;">

                                <c:set var="resultsAction" value="javascript:wdk.resultsPage.removeAttribute('${attrName}')" />
                                <a href="${resultsAction}" title="Remove ${sumAttrib} column">
                                  <img src="<c:url value='/wdk/images/results_x.png'/>" alt="Remove" border="0" />
                                </a>
                              </td>
                            </c:if>
                            <td>
                              <imp:attributePlugin attribute="${sumAttrib}" />
                            </td>
                          </tr>
                        </table>
                      </th>
</c:if>

                      <c:set var="j" value="${j+1}"/>
                    </c:forEach>
                  </tr>
                </thead>

                <tbody class="rootBody">

<c:forEach items="${wdkAnswer.records}" var="r">
    <c:set value="${r.summaryAttributes['filename']}" var="filename"/>
</c:forEach>
                  <c:set var="i" value="0"/>
									<!-- FOR EACH ROW -->
                  <c:forEach items="${answerRecords}" var="record">
                    <c:set value="${record.primaryKey}" var="primaryKey"/>
                    <c:set var="recNam" value="${record.recordClass.fullName}"/>
                    <tr class="${i % 2 eq 0 ? 'lines' : 'linesalt'}">

                      <c:set var="j" value="0"/>
											<!-- FOR EACH COLUMN -->
                      <c:forEach items="${wdkAnswer.summaryAttributeNames}" var="sumAttrName">

 <c:if test="${j != 0}">
                        <c:set value="${record.summaryAttributes[sumAttrName]}" var="recAttr"/>


<!-- ~~~~~~~~~~~~~ IN wdkAttribute.tag for data types using wdk default view ~~~~~~~~~~~~~~~~~ -->

<%--       <imp:wdkAttribute attributeValue="${recAttr}" truncate="true" recordName="${recNam}" />   
       do not make these html comments, the tag is called....
--%>
<c:set var="attributeValue" value="${recAttr}" />
<c:set var="truncate" value="false" />
<c:set var="recordName" value="${recNam}" />


<c:set var="toTruncate" value="${truncate != null && truncate == 'true'}" />
<c:set var="attributeField" value="${attributeValue.attributeField}" />
<c:set var="align" value="align='${attributeField.align}'" />
<c:set var="nowrap">
  <c:if test="${attributeField.nowrap}">white-space:nowrap;</c:if>
</c:set>
<c:set var="displayValue">
  <c:choose>
    <c:when test="${toTruncate}">${attributeValue.briefDisplay}</c:when>
    <c:otherwise>${attributeValue.value}</c:otherwise>
  </c:choose>
</c:set>

<td>
<div class="attribute-summary" ${align} style="${nowrap}padding:3px 2px">
      
 <c:set var="fieldVal" value="${recAttr.display}"/>
      <c:choose>
        <c:when test="${recAttr.name eq 'filename'}">
          <!-- this should be done in teh model with a link attribute -->
          <a href="<c:url value="/communityDownload.do?fname=${fieldVal}" />">${fieldVal}</a><br>
        </c:when>
        <c:otherwise>

  <!-- need to know if fieldVal should be hot linked -->
  <c:choose>
    <c:when test="${displayValue == null || fn:length(displayValue) == 0}">
      <span style="color:gray;">N/A</span>
    </c:when>
    <c:otherwise>
      ${displayValue}
    </c:otherwise>
  </c:choose>

 					</c:otherwise>
      	</c:choose>

</div>
</td>
<!-- ~~~~~~~~~~~~~ END OF  wdkAttribute.tag ~~~~~~~~~~~~~~~~~ -->

</c:if>
                        <c:set var="j" value="${j+1}"/>
                      </c:forEach>
                    </tr>
                    <c:set var="i" value="${i+1}"/>
                  </c:forEach>
                </tbody>


              </table>

            </div>
          </div>
        </div>

        <%--------- END OF RESULTS  ----------%>



        <%--------- PAGING BOTTOM BAR ----------%>
        <table width="100%">
          <tr class="subheaderrow">
            <th style="text-align:left;white-space:nowrap;"> 
              <imp:pager wdkAnswer="${wdkAnswer}" pager_id="bottom"/> 
            </th>
          </tr>
        </table>
        <%--------- END OF PAGING BOTTOM BAR ----------%>
      </pg:pager>
    </c:otherwise> <%-- end of resultSize != 0 --%>
  </c:choose>
