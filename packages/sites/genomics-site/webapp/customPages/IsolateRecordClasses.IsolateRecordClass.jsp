<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="data_type" value="${attrs['data_type']}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+2">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+2" face="Arial,Helvetica">
          <b>${wdkRecord.primaryKey}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="${wdkRecord.primaryKey}"
             bannerPreformatted="${bannerText}"
             divisionName="${recordType} Record"
             division="queries_tools"/>


<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${wdkRecord.primaryKey} was not found.
  <br>
  <hr>
</c:when>

<c:otherwise>

<%--#############################################################--%>

<c:set var="attr" value="${attrs['overview']}" />

<site:panel
    displayName="${attr.displayName}"
        content="${attr.value}" />
<br>

<%--#############################################################--%>

<%-- References ------------------------------------------------%>

<site:wdkTable tblName="Reference" isOpen="true"
     attribution=""/>

<br>

<%--#############################################################--%>
<%-- Link to SNPs ------------------------------------------------%>

<c:if test="${data_type eq '3kChip' || data_type eq 'HD_Array' || data_type eq 'Barcode'}">

<br><b><a href="processQuestion.do?questionFullName=SnpQuestions.SnpsByIsolateId&myProp(isolate_id)=${id}">Click here to retrieve SNPs</a></b> that were assayed in this isolate.<br><br>

</c:if>

<%-- RFLP table ------------------------------------------------%>
<c:if test="${data_type eq 'RFLP'}">

<site:wdkTable tblName="RFLPdata" isOpen="true"
     attribution=""/>
<br>
</c:if>

<%--#############################################################--%>

<%-- Alignments and Genes ------------------------------------------------%>

<c:if test="${data_type eq 'Genbank'}">

<site:wdkTable tblName="GeneOverlap" isOpen="true"
     attribution=""/>

<br>


<%--#############################################################--%>


<%-- Protein Sequence(s) ------------------------------------------------%>

<c:set value="${wdkRecord.tables['ProteinSequence']}" var="proteinSequenceTable" />

<c:forEach var="row" items="${proteinSequenceTable}">

<c:set var="proteinSeq">    
  <noindex> <%-- exclude htdig --%>    
  <font class="fixed">
    <w:wrap size="60" break="<br>">${row['protein_sequence'].value}</w:wrap>
  </font>
  </noindex>
</c:set>

<site:panel
  displayName="Protein"
  content="${proteinSeq}" />
<br>

</c:forEach>
</c:if>

<c:if test="${data_type eq 'Genbank' || data_type eq 'Barcode'}">

<%-- GENOME SEQUENCE ------------------------------------------------%>
<c:set var="attr" value="${attrs['sequence']}" />
<c:set var="seq">    
  <noindex> <%-- exclude htdig --%>    
  <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
  </font>
  </noindex>
</c:set>

<site:panel
  displayName="${attr.displayName}"
  content="${seq}" />
<br>
</c:if>


</c:otherwise>
</c:choose>

<hr>

<site:footer/>

<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>

