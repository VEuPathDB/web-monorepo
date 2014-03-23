<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ attribute name="tblName"
              description="name of table attribute"
%>

<%@ attribute name="isOpen"
              description="Is show/hide block initially open, by default?"
%>

<%@ attribute name="attribution"
              description="Dataset name, for attribution"
%>

<%@ attribute name="preamble"
              description="Text to go above the table and description"
%>

<%@ attribute name="postscript"
              description="Text to go below the table"
%>

<%@ attribute name="suppressColumnHeaders"
              description="Should the display of column headers be skipped?"
%>

<%@ attribute name="suppressDisplayName"
              description="Should the display name be skipped?"
%>

<%@ attribute name="dataTable"
              description="Should the table use dataTables?"
              type="java.lang.Boolean"
%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<%-- =========== IF ERROR IT MEANS TABLE IS NOT DEFINED IN THE MODEL ========== --%>
<c:catch var="tableError">
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>


<%-- =========== DO not show if TABLE is not DEFINED IN A DATASET FOR THIS ORGANISM ======--%>
<c:set var="tableList" value="${wdkRecord.attributes['tablesForOrg'].value}"/>

<c:choose>
<c:when test="${tblName ne 'MetaTable' && tblName ne 'UserComments' && !fn:containsIgnoreCase(tableList,tblName)}" >
<br>
***** Attention:  WE SKIP TABLE ${tblName} THAT IS NOT DEFINED IN A DATASET
<br>
<%--
${tableList}
<br>
--%>
</c:when>
<c:otherwise>


<%-- =========== TABLE IS DEFINED IN A DATASET FOR THIS ORGANISM ========== --%>

<c:if test="${suppressDisplayName == null || !suppressDisplayName}">
  <c:set value="${tbl.tableField.displayName}" var="tableDisplayName"/>
</c:if>
<c:set var="noData" value="false"/>

<c:set var="tableClassName">
  <c:choose>
    <c:when test="${dataTable eq true}">recordTable wdk-data-table</c:when> 
    <c:otherwise>recordTable</c:otherwise> 
  </c:choose>
</c:set>

<!-- GENERATING CONTENT TO BE PASSED TO imp:toggle below -->
<c:set var="tblContent">
  <div class="table-preamble">${preamble}</div>
  <div class="table-description">${tbl.tableField.description}</div>

  <c:choose>
  <c:when test="${tblName == 'UserComments'}">
    <c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
    <c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
    <c:set var="pkValues" value="${primaryKey.values}" />
    <c:set var="projectId" value="${pkValues['project_id']}" />
    <c:set var="id" value="${pkValues['source_id']}" />

	  <table class="${tableClassName}" title="Click to go to the comments page"  style="cursor:pointer" onclick="window.location='<c:url value="/showComment.do?projectId=${projectId}&stableId=${id}&commentTargetId=gene"/>';">
  </c:when>
  <c:otherwise>
	  <table class="${tableClassName}">
  </c:otherwise>
  </c:choose>

  <c:if test="${suppressColumnHeaders == null || !suppressColumnHeaders}">
    <thead>
    <c:set var="h" value="0"/>
    <tr class="headerRow">
        <c:forEach var="hCol" items="${tbl.tableField.attributeFields}">
           <c:if test="${hCol.internal == false}">
             <c:set var="h" value="${h+1}"/>
             <th align="left">${hCol.displayName}</th>
           </c:if>
        </c:forEach>
    </tr>
    </thead>
  </c:if>

  <tbody>
    <%-- table rows --%>
    <c:set var="i" value="0"/>
    <c:forEach var="row" items="${tbl}">
        <c:set var="hasRow" value="true" />
        <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>

        <c:set var="j" value="0"/>
        <c:forEach var="rColEntry" items="${row}">
          <c:set var="attributeValue" value="${rColEntry.value}"/>
          <c:if test="${attributeValue.attributeField.internal == false}">
            <c:set var="j" value="${j+1}"/>
            <imp:wdkAttribute attributeValue="${attributeValue}" truncate="false" />
          </c:if>
        </c:forEach>

        </tr>
        <c:set var="i" value="${i + 1}"/>
    </c:forEach>
  </tbody>
  </table>


<!--  CASE WHERE THE TABLE IS DEFINED BUT THERE IS NO DATA -->
  <c:if test="${i == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  ${postscript}

</c:set>


<!--  CASE WHERE THE TABLE IS NOT DEFINED -->


<%--
<c:if test="${tableError != null}">
    <c:set var="exception" value="${tableError}" scope="request"/>
    <c:set var="tblContent" value="<i>Error. Data is temporarily unavailable</i>"/>
    <c:set var="tableDisplayName" value="${tblName}"/>
</c:if>
--%>

<imp:toggle name="${tblName}" displayName="${tableDisplayName}"
             content="${tblContent}" isOpen="${isOpen}" noData="${noData}"
             attribution="${attribution}"/>



</c:otherwise>
</c:choose>

</c:catch>

<c:if test="${tableError != null}">
<%--
<br>
WE SKIP TABLE ${tblName} THAT IS NOT IN THE MODEL
<br>
--%>
</c:if>
