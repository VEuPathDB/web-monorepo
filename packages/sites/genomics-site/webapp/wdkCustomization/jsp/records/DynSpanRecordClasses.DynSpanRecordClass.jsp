<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>
<c:set var="id" value="${pkValues['source_id']}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${wdkModel.displayName} : DynSpan ${id}"
             refer="recordPage"
             banner="DynSpan ${id}"
             divisionName="DynSpan Record"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The DynSpan '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />


<div class="h2center" style="font-size:160%">
 	Genomic Segment
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<imp:recordPageBasketIcon />
</div>


<!-- Overview -->
<c:set var="attr" value="${attrs['overview']}" />
<imp:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />


<br /><br />
<%-- DNA CONTEXT ---------------%>
<!-- deal with specific contexts depending on organism -->
    <c:set var="organism_full" value="${attrs['organism']}" />
<c:choose>
  <c:when test="${projectId eq 'ToxoDB'}">
    <c:set var="tracks" value="Gene+EST+ORF+AlignmentSNPs" />
  </c:when>
  <c:when test="${projectId eq 'PlasmoDB'}">
     <c:set var="tracks" value="Gene+EST+ORF+CombinedSNPs" />
  </c:when>
  <c:otherwise>
     <c:set var="tracks" value="Gene+EST+ORF" />
  </c:otherwise>
</c:choose>


<c:set var="attribution">
Scaffolds,ChromosomeMap,ME49_Annotation,TgondiiGT1Scaffolds,TgondiiVegScaffolds,TgondiiRHChromosome1,TgondiiApicoplast,TIGRGeneIndices_Tgondii,dbEST,ESTAlignments_Tgondii,N.caninum_chromosomes,NeosporaUnassignedContigsSanger,TIGRGeneIndices_NeosporaCaninum
</c:set>

  <c:set var="sequence_id" value="${attrs['seq_source_id']}" />
  <c:set var="context_start_range" value="${attrs['start_min']}" />
  <c:set var="context_end_range" value="${attrs['end_max']}" />


<c:set var="gnCtxUrl">
       /cgi-bin/gbrowse_img/${projectIdLowerCase}/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${tracks};width=640;embed=1;
</c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>

    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/${projectIdLowerCase}/?name=${sequence_id}:${context_start_range}..${context_end_range};type=${tracks}
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font> for additional information</a>
  </c:set>

  <imp:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />

<%-- END DNA CONTEXT --------------------------------------------%>



<br><br>
<!-- SRT -->
<c:set var="attr" value="${attrs['otherInfo']}" />
<imp:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />

<br>
<imp:wdkTable tblName="Genes" isOpen="true"
                 attribution=""/>

<br>
<imp:wdkTable tblName="ORFs" isOpen="false"
                 attribution=""/>

<br>


<c:if test="${wdkModel.displayName eq 'PlasmoDB' || 
              wdkModel.displayName eq 'ToxoDB' ||
              wdkModel.displayName eq 'TriTrypDB' ||
              wdkModel.displayName eq 'AmoebaDB' ||
              wdkModel.displayName eq 'CryptoDB' ||
              wdkModel.displayName eq 'EuPathDB'
              }">

    <c:if test="${attrs['length'].value <= 10000}">

  <imp:wdkTable tblName="SNPs" isOpen="false"
                 attribution=""/>

	<br>
    </c:if>
    <c:if test="${attrs['length'].value > 10000}">
       <p> <b>SNPs </b> not shown for regions above 10 KB</p>

	<br>
    </c:if>


	<br>
	<imp:wdkTable tblName="ESTs" isOpen="false"
                 attribution=""/>

</c:if>


</c:otherwise>
</c:choose>

</imp:pageFrame>
