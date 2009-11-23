<%-- development record stub --%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>GeneRecordStub</title>
<link rel="stylesheet" href="/assets/css/AllSites.css" type="text/css" />
<script type="text/javascript" src='/assets/js/lib/jquery-1.3.2.js'></script>
<script type="text/javascript" src="/assets/js/api.js"></script>
</head>
<body>

	<div id="contentwrapper">
	<div id="contentcolumn2">
	<div class="innertube">

<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>


<c:set var='source_id' value='Tb927.8.620'/>
<api:wdkRecord name="GeneRecordClasses.GeneRecordClass" 
    source_id="${param.source_id}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>

<blockquote>
Source ID: '<b>${wdkRecord.primaryKey.values.source_id}</b>'

<c:set var="organismFull" value="${attrs['organism_full'].value}"/>
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />

<c:choose>
  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
    <c:set var="synTracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania major"}'>
    <c:set var="synTracks">
      Gene+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania infantum"}'>
    <c:set var="synTracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName eq nonEsmeraldoDatabaseName}'>
    <c:set var="synTracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName eq esmeraldoDatabaseName}'>
    <c:set var="synTracks">
      Gene+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName ne esmeraldoDatabaseName && sequenceDatabaseName ne nonEsmeraldoDatabaseName}'>
    <c:set var="synTracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>


  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
    <c:set var="synTracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:otherwise>
    <c:set var="synTracks">
      Gene+EST+BLASTX
    </c:set>
  </c:otherwise>
</c:choose>

<c:set var="attribution">
L.braziliensis_Annotation,L.infantum_Annotation,L.major_Annotation,T.brucei927_Annotation_chromosomes,T.bruceigambiense_Annotation,T.congolense_Annotation_chromosomes,T.cruziEsmeraldo_Annotation_Chromosomes,T.cruziNonEsmeraldo_chromosomes,T.cruziNonEsmeraldo_Annotation_Chromosomes,T.vivax_chromosomes,T.vivax_Annotation_chromosomes
</c:set>

<c:if test="${synTracks ne ''}">
  <c:set var="gnCtxUrl">
    /cgi-bin/gbrowse_img/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=Gene+EST+BLASTX;width=640;embed=1;h_feat=${id}@yellow
  </c:set>

  <c:set var="labels" value="${fn:replace(synTracks, '+', ';label=')}" />
  <c:set var="gbrowseUrl">
    /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>
  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>
    <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <site:toggle 
    name="dnaContext" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" 
    imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />
 <!-- ${genomeContextUrl} -->

<%-- DNA CONTEXT with SYNTENY ------------------------------------------------%>

  <c:set var="gnCtxSynUrl">
     /cgi-bin/gbrowse_img/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${synTracks};width=640;embed=1;h_feat=${id}@yellow
  </c:set>

  <c:set var="gnCtxSynDivId" value="gnCtxSyn"/>

  <c:set var="gnCtxSynImg">
    <center><div id="${gnCtxSynDivId}"></div></center>
    
    <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <site:toggle 
    name="dnaContextSyn" displayName="Genomic Context with Synteny"
    content="${gnCtxSynImg}" isOpen="true" 
    imageMapDivId="${gnCtxSynDivId}" imageMapSource="${gnCtxSynUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />
  <!-- ${genomeContextUrl} -->

</c:if> <%-- {synTracks ne ''} --%>

</div>
</div>
</div>
</body>
</html>
