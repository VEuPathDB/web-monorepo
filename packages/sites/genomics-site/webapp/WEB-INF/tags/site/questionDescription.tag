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
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${fn:contains(recordType, 'Assem') }">
        <c:set var="recordType" value="Transcript Assemblie" />
</c:if>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>



<c:set target="${helps}" property="${fromAnchorQ}" value="${helpQ}"/>

<hr>

<c:set var="attrId" value="attributions-section"/>
<c:set var="descripId" value="query-description-section"/>
<c:if test="${wdkQuestion.fullName == 'IsolateQuestions.IsolateByCountry'}">
	<c:set var="descripId" value="query-description-noShowOnForm"/>
</c:if>

<%-- display description for wdkQuestion --%>
<a name="${descripId}"></a>
<div style="color:black" id="${descripId}">
	<h2>Description</h2>
	<jsp:getProperty name="wdkQuestion" property="description"/>
</div>

<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB' && project != 'FungiDB'}">
<hr>
<a name="${attrId}"></a>
<div style="color:black" id="${attrId}">
  <c:set var="ds_ref_questions" value="${requestScope.ds_ref_questions}" />
  <c:choose>
    <c:when test="${fn:length(ds_ref_questions) == 0}">
      <c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>
      <imp:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />
    </c:when>
    <c:otherwise>
      <h2>Data Sources:</h2>
      <ul>
      <c:forEach items="${ds_ref_questions}" var="dsRecord">
        <li class="data-source">
          <c:set var="ds_attributes" value="${dsRecord.attributes}" />
          <c:set var="ds_name" value="${ds_attributes['data_source_name']}" />
          <c:set var="ds_display" value="${ds_attributes['display_name']}" />
          <c:set var="ds_tables" value="${dsRecord.tables}" />
          <c:set var="ds_publications" value="${ds_tables['Publications']}" />
          <a class="title" 
             href="<c:url value='/getDataSource.do?question=${wdkQuestion.fullName}&display=detail#target=${ds_name}'/>">${ds_display}</a>
          <div class="detail">
            <div class="summary">${ds_attributes['summary']}</div>
            <c:if test="${fn:length(ds_publications) > 0}">
              <c:set var="pubContent"><imp:table table="${ds_publications}" sortable="false" /></c:set>
              <imp:simpleToggle name="${ds_publications.displayName}" content="${pubContent}" show="false" />
            </c:if>
          </div>
        </li>
      </c:forEach>
      </ul>
    </c:otherwise>
  </c:choose>
</div>
</c:if>


