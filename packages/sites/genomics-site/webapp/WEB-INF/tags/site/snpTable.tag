<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="tblName"
              required="true"
              description="name of table attribute"
%>

<%@ attribute name="isOpen"
              required="true"
              description="Is show/hide block initially open, by default?"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="project" value="${wdkModel.displayName}"/>

<%-- <c:set var="snpoverview" value="${attrs['snpoverview']}"/>	--%> 

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>
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

<c:set var="tblContent">

<div class="table-description">${tbl.tableField.description}</div>

<form name="checkHandleForm" method="post" action="/dosomething.jsp" onsubmit="return false;">

<!--
<table>
  <tr><td>
    ${snpoverview}
  </td></tr>
</table>
-->

<table >
<c:forEach var="row" items="${tbl}">
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

<table width="100%">
  <tr align=center>     
    <td><b>Please select at least two isolates strains to run ClustalW.</b> </td>
  </tr>   
  <tr>
    <td align=center>
    <c:choose>
      <c:when test = "${project == 'ToxoDB'}">
        <input type="button" value="Run Clustalw on Checked Strains" onClick="goToIsolate(this,'htsSNP','${attrs['isolate_sequence_id']}','${attrs['isolate_start_min']}','${attrs['isolate_end_max']}')" /> 
      </c:when>
      <c:otherwise>
        <input type="button" value="Run Clustalw on Checked Strains" onClick="goToIsolate(this,'htsSNP','${attrs['sequence_id']}','${attrs['start_min_text']}','${attrs['end_max_text']}')" />      
       </c:otherwise>
    </c:choose>

    <input type="button" name="CheckAll" value="Check All"  onClick="wdk.api.checkboxAll(jQuery('input:checkbox[name=selectedFields]'))">
    <input type="button" name="UnCheckAll" value="Uncheck All" onClick="wdk.api.checkboxNone(jQuery('input:checkbox[name=selectedFields]'))">
    </td>
  </tr> 
</table>

</form>

</c:set>

<c:if test="${tableError != null}">
    <c:set var="exception" value="${tableError}" scope="request"/>
        <c:set var="tblContent" value="<i>Error. Data is temporarily unavailable</i>"/>
</c:if>

<imp:toggle name="${tblName}" displayName="${tableDisplayName}"
             content="${tblContent}" isOpen="${isOpen}" noData="${noData}" />
