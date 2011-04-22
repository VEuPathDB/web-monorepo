<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

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

<site:header title="${wdkModel.displayName} : DynSpan ${id}"
             banner="DynSpan ${id}"
             divisionName="DynSpan Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The DynSpan '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<h2><center>
${id}
</center></h2>

<%-- download box  and title  ----%>
<site:recordToolbox />
<br><br>

<!-- Overview -->
<c:set var="attr" value="${attrs['overview']}" />
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />


<br /><br />

<%-- DNA CONTEXT ---------------%>

<!-- deal with specific contexts depending on organism -->
<c:set var="organism_full" value="${attrs['organism']}" />
<c:choose>
  <c:when test="${projectId eq 'ToxoDB'}">
    <c:set var="tracks" value="Gene+EST+SAGEtags+ORF+AlignmentSNPs" />
  </c:when>
  <c:when test="${projectId eq 'PlasmoDB'}">
    <c:set var="tracks" value="AnnotatedGenes+EST+SAGEtags+ORF+CombinedSNPs" />
  </c:when>
  <c:otherwise>
    <c:set var="tracks" value="Gene+EST+SAGEtags+ORF" />
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

  <wdk:toggle 
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
<wdk:toggle name="${attr.displayName}"
    displayName="${attr.displayName}" isOpen="true"
    content="${attr.value}" />

<br>
<wdk:wdkTable tblName="Genes" isOpen="true"
                 attribution=""/>

<br>
<wdk:wdkTable tblName="ORFs" isOpen="true"
                 attribution=""/>

<br>


<c:if test="${wdkModel.displayName ne 'PiroplasmaDB'}">

	<wdk:wdkTable tblName="SNPs" isOpen="true"
                 attribution=""/>

	<br>
	<wdk:wdkTable tblName="SageTags" isOpen="true"
                 attribution=""/>

	<br>
	<wdk:wdkTable tblName="ESTs" isOpen="true"
                 attribution=""/>

</c:if>


</c:otherwise>
</c:choose>

<site:footer/>
