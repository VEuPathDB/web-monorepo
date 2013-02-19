<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="recordName" value="${wdkQuestion.recordClass.displayName}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>



<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<c:set var="attrId" value="attributions-section"/>
<c:set var="descripId" value="query-description-section"/>
<c:if test="${wdkQuestion.fullName == 'IsolateQuestions.IsolateByCountry'}">
	<c:set var="descripId" value="query-description-noShowOnForm"/>
</c:if>

<%-- display description for wdkQuestion --%>
<a name="${descripId}"></a>

<!--
<div class="truncate" style="color:black;padding:0.5em 1em 0em 1em;margin:0.5em;" id="${descripId}">
-->
<div class="content-pane notcollapsible" id="${descripId}">
        <div class="group-title h3left" style="padding-bottom: .4em;">Description</div>
<!--
    <div>
-->
        <div class="group-detail" style="display:block"> 

    				<jsp:getProperty name="wdkQuestion" property="description"/>
    </div>
</div>

<hr>

<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB' && project != 'FungiDB'}">
  <c:set var="ds_ref_questions" value="${requestScope.ds_ref_questions}" />
  <c:choose>
    <c:when test="${fn:length(ds_ref_questions) == 0}">
      <c:set var="attributions" value="${wdkQuestion.propertyLists['specificAttribution']}"/>
      <c:if test="${fn:length(attributions) gt 0}">
        <a name="${attrId}"></a>
        <div class="content-pane snippet" style="color:black;padding:0.5em 1em;" id="${attrId}">
          <div>
            <imp:attributions attributions="${attributions}" caption="Data Sets used by this search" />
          </div>
        </div>
      </c:if>
    </c:when>
    <c:otherwise>
    <a name="${attrId}"></a>

<!--
      <div class="content-pane snippet" style="color:black;padding:0.5em 1em;" id="${attrId}">
-->
      <div class="content-pane notcollapsible" id="${attrId}">
<!--
       <div>
-->
        <div class="group-title h3left" style="padding-bottom: .4em;">Data Sets used by this search</div>

        <div class="group-detail" style="display:block">
	    
          <ul>
          <c:forEach items="${ds_ref_questions}" var="dsRecord">
            <li class="data-source">
              <c:set var="ds_attributes" value="${dsRecord.attributes}" />
              <c:set var="ds_id" value="${ds_attributes['dataset_id']}" />
              <c:set var="ds_display" value="${ds_attributes['display_name']}" />
              <c:set var="ds_tables" value="${dsRecord.tables}" />
              <c:set var="ds_publications" value="${ds_tables['Publications']}" />
              <a class="title" 
                 href="<c:url value='/getDataset.do?question=${wdkQuestion.fullName}&display=detail#${ds_id}'/>">${ds_display}</a>
              <div class="detail">
                <div class="summary">${ds_attributes['summary']}</div>
                <c:if test="${fn:length(ds_publications) > 0}">
                    <ul class="publications">
                      <c:forEach items="${ds_publications}" var="publication">
                        <li>
                        <a href="${publication['pubmed_link'].url}">${publication['citation'].value}</a>
                        </li>
                      </c:forEach>
                    </ul>
                </c:if>
              </div>
            </li>
          </c:forEach>
          </ul>
        </div>
      </div>

    </c:otherwise>
  </c:choose>
</c:if>


