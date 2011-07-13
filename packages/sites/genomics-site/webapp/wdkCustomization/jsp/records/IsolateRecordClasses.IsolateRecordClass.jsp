<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<site:header title="${wdkRecord.primaryKey}"
             divisionName="${recordType} Record"
             refer="recordPage"
             division="queries_tools"/>


<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">
  The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>

<c:otherwise>
<c:set var="data_type" value="${attrs['data_type']}" />

<%-- quick tool-box for the record --%>
<site:recordToolbox />

<div class="h2center" style="font-size:160%">
 	Isolate
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<wdk:recordPageBasketIcon />
</div>

<%--#############################################################--%>

<c:set var="attr" value="${attrs['overview']}" />

<site:panel
    displayName="${attr.displayName}"
        content="${attr.value}" />
<br>

<%--#############################################################--%>

<%-- References ------------------------------------------------%>

<wdk:wdkTable tblName="Reference" isOpen="true"
     attribution=""/>

<br>

<%--#############################################################--%>

<%-- User Comments ------------------------------------------------%>

<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
	<c:param name="commentTargetId" value="isolate"/>
	<c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
	<c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
	<c:param name="organism" value="${attrs['organism'].value}" />
	<c:param name="flag" value="0" />
</c:url>

<c:catch var="e">
	   <site:dataTable tblName="IsolateComments"/>
	   <a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
</c:catch>
<c:if test="${e != null}">
		  <site:embeddedError
		    msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
		    e="${e}"
		/>
</c:if>
<br>

<%--#############################################################--%>
<%-- Link to SNPs ------------------------------------------------%>

<c:if test="${data_type eq '3kChip' || data_type eq 'HD_Array' || data_type eq 'Barcode'}">

<br><b><a href="processQuestion.do?questionFullName=SnpQuestions.SnpsByIsolateId&value(isolate_id)=${id}">Click here to retrieve SNPs</a></b> that were assayed in this isolate.<br><br>

</c:if>

<%-- RFLP tables ------------------------------------------------%>
<c:if test="${data_type eq 'RFLP Typed'}">

<wdk:wdkTable tblName="RFLPgenotype" isOpen="true"
     attribution=""/>

<wdk:wdkTable tblName="RFLPdata" isOpen="true"
     attribution=""/>
<br>


  <c:if test="${wdkRecord.attributes['external_db_name'].value eq 'Toxoplasma_RFLP_Su_RSRC'}">
  <a href="/Standards_gel_pics.pdf"><b>Click here for associated RFLP images</b></a> in PDF format.
  
  <br/>
  </c:if>

</c:if>

<%--#############################################################--%>

<%-- Alignments and Genes ------------------------------------------------%>

<c:if test="${data_type eq 'Sequencing Typed'}">

<wdk:wdkTable tblName="GeneOverlap" isOpen="true"
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

<c:if test="${data_type eq 'Sequencing Typed' || data_type eq 'Barcode'}">

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

