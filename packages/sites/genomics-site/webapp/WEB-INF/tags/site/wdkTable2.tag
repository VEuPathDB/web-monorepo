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

<%-- ===== IF ERROR IT MEANS TABLE IS NOT DEFINED IN THE MODEL, handled at the bottom (we do nothing) ========== --%>
<%-- breaks if table does not exist
RecordBean.java, line 475: instead of throwing error we could just return null there

<c:if test="${wdkRecord.tables[tblName] == null}" >
<br>table does NOT EXIST in model <br>
</c:if>
--%>

<c:catch var="tableError">
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>


<%-- =========== DO not show if TABLE is not DEFINED IN A DATASET FOR THIS ORGANISM ======--%>
<c:set var="tableList" value="${wdkRecord.attributes['tablesForOrg'].value}"/>

<c:choose>
<c:when test="${tblName ne 'MetaTable' && 
                tblName ne 'UserComments' &&
                tblName ne 'CommunityExpComments' && 
                tblName ne 'Strains' && 
                tblName ne 'Ssgcid' && 
                tblName ne 'SNPsAlignment' && 
                !fn:containsIgnoreCase(tableList,tblName)}" >

<%-- DEBUG
<br>
***** Attention:  WE SKIP TABLE ${tblName} --NOT DEFINED IN A DATASET FOR THIS ORGANISM
<br>
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

<!-- ============ GENERATING CONTENT TO BE PASSED TO imp:toggle below ======== -->
<c:set var="tblContent">
  <div class="table-preamble">${preamble}</div>
  <div class="table-description">${tbl.tableField.description}</div>

<c:choose>
<c:when test="${tblName == 'SNPsAlignment'}">
<%-- =========  SNP ALIGNMENTS ======= temporary view ============ --%>
  <c:set var="attrs" value="${wdkRecord.attributes}"/>

  <form name="checkHandleForm" method="post" action="/dosomething.jsp" onsubmit="return false;">
  <c:set var="i" value="0"/>


 <table>

<c:forEach var="row" items="${tbl.iterator}">
  <c:set var="i" value="${i+1}"/>
  <c:if test="${i % 8 == 1}">
     <tr>
  </c:if>
  <c:forEach var="rColEntry" items="${row}">
    <c:set var="attributeValue" value="${rColEntry.value}"/>
    <c:if test="${attributeValue.attributeField.internal == false}"> 
      <td><imp:wdkAttribute attributeValue="${attributeValue}" truncate="false" /></td>
    </c:if> 
  </c:forEach>
  <c:if test="${i % 8 == 0}">
    </tr>
  </c:if>
</c:forEach>
</table>

<c:choose>
<c:when test="${i == 1}">
  <br>Sorry, we only have one SNP dataset.<br>
</c:when>
<c:otherwise>
  <table width="100%">
  <tr>
    <td align=center>
      <br>We have ${i} Isolate strains for alignment.<br>
      <input type="button" value="Show Alignment on Checked Strains" onClick="goToHTSStrain(this,'htsSNP','${attrs['sequence_id']}','${attrs['start_min']}','${attrs['end_max']}')" /> 
      <input type="button" name="CheckAll" value="Check All"  onClick="wdk.api.checkboxAll(jQuery('input:checkbox[name=selectedFields]'))">
      <input type="button" name="UnCheckAll" value="Uncheck All" onClick="wdk.api.checkboxNone(jQuery('input:checkbox[name=selectedFields]'))">
    </td>
  </tr> 
  </table>
</c:otherwise>
</c:choose>


  </form>
</c:when>
<c:otherwise>


  <c:choose>
<%-- =========  USER COMMENTS======================== --%>
  <c:when test="${tblName == 'UserComments'}">
    <c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
    <c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
    <c:set var="pkValues" value="${primaryKey.values}" />
    <c:set var="projectId" value="${pkValues['project_id']}" />
    <c:set var="id" value="${pkValues['source_id']}" />

	  <table id="dt_${tblName}" 
           class="${tableClassName}" 
           title="Click to go to the comments page"  
           style="cursor:pointer" 
           onclick="window.location='<c:url value="/showComment.do?projectId=${projectId}&stableId=${id}&commentTargetId=gene"/>';">
  </c:when>

<%-- =========  OTHER TABLES ======================= --%>
  <c:otherwise>

	  <table id="dt_${tblName}"
           class="${tableClassName}">
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
    <c:forEach var="row" items="${tbl.iterator}">
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


  <%-- ====== make datatables, working on header width issue ==== --%>
  <%--
  <script type="text/javascript">
  setTimeout(function(){
    jQuery('#dt_${tblName}').dataTable(
      {
		    "sScrollY": "200px",
		    "bPaginate": false,
        "aaSorting": [[ 1, 'asc']]
	      }
     );
  },500);
  </script>
--%>

</c:otherwise> <%-- tables other than SNPsAlignment --%>
</c:choose>


<!--  CASE WHERE THE TABLE IS DEFINED BUT THERE IS NO DATA -->
  <c:if test="${i == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

<!-- SHOW extra content after table, if any. It must reset to empty on every call. -->
  ${postscript}
</c:set>


<!--  CASE WHERE THE TABLE IS NOT DEFINED AND 
      we want to show the empty table with an error message -->
<%--
</c:catch>
<c:if test="${tableError != null}">
    <c:set var="exception" value="${tableError}" scope="request"/>
    <c:set var="tblContent" value="<i>Error. Data is temporarily unavailable</i>"/>
    <c:set var="tableDisplayName" value="${tblName}"/>
</c:if>
--%>


<!----  FINALLY GO SHOW THE TABLE!!! ------------->
<imp:toggle name="${tblName}" displayName="${tableDisplayName}"
             content="${tblContent}" isOpen="${isOpen}" noData="${noData}"
             attribution="${attribution}"/>


</c:otherwise>
</c:choose>


</c:catch>
<%-- ========= REACT TO TABLE NOT IN MODEL or nothing ============= --%>
<c:if test="${tableError != null}">
  <%--
  <br>
  WE SKIP TABLE ${tblName} THAT IS NOT IN THE MODEL
  <br>
  --%>
</c:if>
