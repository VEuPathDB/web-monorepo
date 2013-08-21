<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />

<c:set var="organism" value="${attrs['organism'].value}" />
<c:set var="genecount" value="${attrs['genecount'].value}" />
<c:set var="codinggenecount" value="${attrs['codinggenecount'].value}" />
<c:set var="pseudogenecount" value="${attrs['pseudogenecount'].value}" />
<c:set var="othergenecount" value="${attrs['othergenecount'].value}" />


<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${id}"
             divisionName="Organism Record"
             refer="recordPage"
             division="queries_tools">

<br/>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	Organism
</div>

<div class="h3center" style="font-size:130%">
	${organism}<br>
	<imp:recordPageBasketIcon />
</div>

<%------------------------------------------------------------------%>
 <c:if test="${projectId ne 'TrichDB' && attrs['is_annotated'].value == 0}">
  <c:choose>
    <c:when test="${attrs['release_policy'].value  != null}">
<b>NOTE: ${attrs['release_policy'].value }</b>
    </c:when>
    <c:otherwise>
<b>NOTE: The data for this genome is unpublished. You should consult with the Principal Investigators before undertaking large scale analyses of the annotation or underlying sequence.</b>
    </c:otherwise>
  </c:choose>
</c:if>

<%------------------------------------------------------------------%>

<c:set var="attr" value="${attrs['overview']}"/>
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}"
    attribute="${attr.name}" />
<br>



<imp:wdkTable tblName="SequenceCounts" isOpen="true"/>

<imp:wdkTable tblName="GeneCounts" isOpen="true"/>


<c:set var="geneStats">
<br />
<table>
 <tr>
   <th></th>
   <th>Data Source</th>
   <th>Gene Count</th>
 </tr>
 <tr>
   <th>EC Numbers</th>
   <td><a href="${attrs['hasEC'].url}">${attrs['hasEC'].displayText}</a></td>
   <td>${attrs['ecnumbercount'].value}</td>
 </tr>
 <tr>
   <th>Gene Ontology Assignments</th>
   <td><a href="${attrs['hasGO'].url}">${attrs['hasGO'].displayText}</a></td>
   <td>${attrs['gocount'].value}</td>
 </tr>

 <tr>
   <th>SAGE Tags Alignments</th>
   <td><a href="${attrs['hasSageTag'].url}">${attrs['hasSageTag'].displayText}</a></td>
   <td>${attrs['sagetagcount'].value}</td>
 </tr>

 <tr>
   <th>RNASeq Reads</th>
   <td><a href="${attrs['hasRNASeq'].url}">${attrs['hasRNASeq'].displayText}</a></td>
   <td>${attrs['rnaseqcount'].value}</td>
 </tr>
 <tr>
   <th>ChIP-Chip Probes</th>
   <td><a href="${attrs['hasChipChip'].url}">${attrs['hasChipChip'].displayText}</a></td>
   <td>${attrs['chipchipgenecount'].value}</td>
 </tr>
 <tr>
   <th>RT-PCR Data</th>
   <td><a href="${attrs['hasRTPCR'].url}">${attrs['hasRTPCR'].displayText}</a></td>
   <td>${attrs['rtpcrcount'].value}</td>
 </tr>
 <tr>
   <th>EST Alignments</th>
   <td><a href="${attrs['hasEST'].url}">${attrs['hasEST'].displayText}</a></td>
   <td>${attrs['estcount'].value}</td>
 </tr>
 <tr>
   <th>SNPs</th>
   <td><a href="${attrs['hasSNP'].url}">${attrs['hasSNP'].displayText}</a></td>
   <td>${attrs['snpcount'].value}</td>
 </tr>
 <tr>
   <th>Orthologs</th>
   <td></td>
   <td>${attrs['orthologcount'].value}</td>
 </tr>
 <tr>
   <th>Expression Array Probes</th>
   <td><a href="${attrs['hasArray'].url}">${attrs['hasArray'].displayText}</a></td>
   <td>${attrs['arraygenecount'].value}</td>
 </tr>
 <tr>
   <th>Proteomics Data</th>
   <td><a href="${attrs['hasProteomics'].url}">${attrs['hasProteomics'].displayText}</a></td>
   <td>${attrs['proteomicscount'].value}</td>
 </tr>
 <tr>
   <th>Trascription Factor Binding Site Data</th>
   <td><a href="${attrs['hasTFBS'].url}">${attrs['hasTFBS'].displayText}</a></td>
   <td>${attrs['tfbscount'].value}</td>
 </tr>
 <tr>
   <th>Community Annotations</th>
   <td></td>
   <td>${attrs['communitycount'].value}</td>
 </tr>
 <tr>
   <th>Isolates</th>
   <td><a href="${attrs['hasIsolate'].url}">${attrs['hasIsolate'].displayText}</a></td>
   <td>TODO</td>
 </tr>

</table>
</c:set>


<imp:panel 
    displayName="Data Sources and Gene Metrics"
    content="${geneStats}"
 />
<br>


</imp:pageFrame>
