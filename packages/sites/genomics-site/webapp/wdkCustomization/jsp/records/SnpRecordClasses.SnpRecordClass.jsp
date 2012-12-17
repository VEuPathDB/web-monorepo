<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
  <c:set var="snp_position" value="${attrs['start_min'].value}"/>
  <c:set var="start" value="${snp_position-25}"/>
  <c:set var="end"   value="${snp_position+25}"/>
   <c:if test="${attrs['gene_strand'].value == 'reverse'}">
    <c:set var="revCompOn" value="1"/>
   </c:if>
  <c:set var="sequence_id" value="${attrs['seq_source_id'].value}"/>
  <c:set var="dataset_internal" value="${attrs['dataset_internal'].value}"/>
</c:catch>

<imp:pageFrame title="${wdkModel.displayName} : SNP ${id}"
             banner="SNP ${id}"
             refer="recordPage"
             divisionName="SNP Record"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The SNP '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />


<div class="h2center" style="font-size:160%">
   SNP
</div>

<div class="h3center" style="font-size:130%">
  ${primaryKey}<br>
  <imp:recordPageBasketIcon />
</div>


<table width="90%" align="center" cellspacing="5">
<tr><td>

<!-- Overview -->
<c:set var="attr" value="${attrs['snp_overview']}" />

<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" 
    attribute="${attr.name}"/>

<!-- Gene context -->
<c:set var="attr" value="${attrs['gene_context']}" />

<imp:panel
    displayName="${attr.displayName}" 
    content="${attr.value}" 
    attribute="${attr.name}"/>

<!-- strains table: one for HTS SNPs and one for sequencing SNPs -->
<c:choose>
  <c:when  test="${attrs['type'].value == 'HTS'}">

<c:set var="start" value="${attrs['start_min_text']}"/>
<c:set var="startm" value="${fn:replace(start,',','') - 39}" /> </h4>
<c:set var="end" value="${fn:replace(start,',','') + 40}" /> </h4>

<form name="checkHandleForm" method="post" action="/dosomething.jsp" onsubmit="return false;">

    <imp:wdkTable tblName="HTSStrains" isOpen="true"/>

<table width="100%">
  <tr align=center>        
    <td><b>Please select at least two isolates strains to run ClustalW.</b></td>
  </tr>   
  <tr>
    <td align=center>
      <input type="button" value="Run Clustalw on Checked Strains" 
           onClick="goToIsolate(this,'htsSNP','${attrs['seq_source_id']}','${startm}', '${end}')" />
      <input type="button" name="CheckAll" value="Check All" 
           onClick="wdk.api.checkboxAll($('input:checkbox[name=selectedFields]'))">
      <input type="button" name="UnCheckAll" value="Uncheck All" 
          onClick="wdk.api.checkboxNone($('input:checkbox[name=selectedFields]'))">
    </td>
  </tr> 
</table>
</form>

  </c:when>
  <c:otherwise>
    <imp:wdkTable tblName="Strains" isOpen="true"/>
  </c:otherwise>
</c:choose>

<c:if test="${projectId eq 'PlasmoDB'}">

<imp:pageDivider name="Isolate Chip Assays"/>

<imp:wdkTable tblName="Isolates" isOpen="false"/>
<imp:wdkTable tblName="IsolatesAlleleFrequency" isOpen="true"/>


<imp:pageDivider name="Sequence Context"/>

<br/>
</c:if>


<imp:wdkTable tblName="Providers_other_SNPs" isOpen="true"/>




</td></tr>
</table>

</c:otherwise>
</c:choose>

</imp:pageFrame>

<imp:pageLogger name="snp page" />
