<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>
<c:set var="sequenceDatabaseName" value="${attrs['sequence_database_name'].value}"/>
<c:set var="binomial" value="${attrs['genus_species'].value}"/>

<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="sequence_id" value="${attrs['sequence_id'].value}"/>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<c:set var="esmeraldoDatabaseName" value="Tcruzi Esmeraldo-like Chromosome Map - Rick Tarleton"/>
<c:set var="nonEsmeraldoDatabaseName" value="Tcruzi NonEsmeraldo-like Chromosome Map - Rick Tarleton"/>


<%-- display page header with recordClass type in banner --%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+3">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+3" face="Arial,Helvetica">
          <b>${id}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="TriTrypDB : gene ${id} (${prd})"
             banner="${id}<br>${prd}"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             division="queries_tools" />

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${id} was not found.
  <br>
  <hr>
</c:when>
<c:otherwise>

<br>
<%--#############################################################--%>


<c:choose>
  <c:when test='${sequenceDatabaseName eq nonEsmeraldoDatabaseName}'>
    <c:set var="append" value=" - (non-esmeraldo)" />
  </c:when>
  <c:when test='${sequenceDatabaseName eq esmeraldoDatabaseName}'>
    <c:set var="append" value=" - (esmeraldo)" />
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName ne esmeraldoDatabaseName && sequenceDatabaseName ne nonEsmeraldoDatabaseName}'>
    <c:set var="append" value=" - (this contig could not be assigned to esmeraldo or non-esmeraldo)" />
  </c:when>


  <c:otherwise>
    <c:set var="append" value="" />
  </c:otherwise>
</c:choose>

<%-- quick tool-box for the record --%>
<div id="record-toolbox">
  <ul>
    <li>
        <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=GeneQuestions.GeneBySingleLocusTag&skip_to_download=1&myProp(single_gene_id)=${id}" />
        <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>    
    </li>
    <li>
        <a class="show-all" href="" title="Show all sections">Show All</a>
    </li>
    <li>
        <a class="hide-all" href="" title="Hide all sections">Hide All</a>
    </li>
  </ul>
</div>

<h2>
<center>
${id} <br /> ${prd}
</center>
</h2>

<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>

<c:set var="content">
${organism}<br>
</c:set>

<!--
<c:if test="${attrs['cyc_gene_id'].value ne 'null'}">
  <c:set var="content">
    ${content}<br>
    ${attrs['cyc_db'].value}
  </c:set>
</c:if>

<site:panel 
    displayName="Links to Other Web Pages"
    content="${content}" />
<br>
-->

<%-- DNA CONTEXT ---------------------------------------------------%>




<c:choose>
  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania major"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania infantum"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName eq nonEsmeraldoDatabaseName}'>
    <c:set var="gtracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName eq esmeraldoDatabaseName}'>
    <c:set var="gtracks">
      Gene+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener" && sequenceDatabaseName ne esmeraldoDatabaseName && sequenceDatabaseName ne nonEsmeraldoDatabaseName}'>
    <c:set var="gtracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+EST+BLASTX
    </c:set>
  </c:when>


  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansLmajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+EST+BLASTX
    </c:set>
  </c:when>
  <c:otherwise>
    <c:set var="gtracks">
      Gene+EST+BLASTX
    </c:set>
  </c:otherwise>
</c:choose>



<c:set var="attribution">
LmajorChromosomesAndAnnotations,Tbrucei927ChromosomesAndAnnotations,TcruziContigsAndAnnotations,LbraziliensisChromosomesAndAnnotations,LbraziliensisNonProteinCodingAnnotations,LinfantumChromosomesAndAnnotations,LinfantumNonProteinCodingAnnotations,TcruziEsmeraldo_likeChromosomeMap,TcruziNonEsmeraldo_likeChromosomeMap
</c:set>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow
    </c:set>
    <c:set var="genomeContextImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${genomeContextUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <site:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center>
        </noindex>
        
        <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
        <c:set var="gbrowseUrl">
            /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    </c:set>

    <site:toggle
        name="dnaContext"
        isOpen="true"
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}"/>
     <!-- ${genomeContextUrl} -->
    <br>
</c:if>

<c:if test='${organismFull eq "Trypanosoma cruzi strain CL Brener"}'>

<site:wdkTable tblName="Genbank" isOpen="true"
               attribution="TcruziContigsAndAnnotations,TcruziEsmeraldo_likeChromosomeMap,TcruziNonEsmeraldo_likeChromosomeMap" />
</c:if>

<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<!-- Mercator / Mavid alignments -->
<c:set var="mercatorAlign">
<site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes=""/>
</c:set>

<site:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>


<!-- External Links --> 
<site:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>





<%--- Comments -----------------------------------------------------%>
<c:url var="commentsUrl" value="addComment.do">
<c:param name="stableId" value="${id}"/>
<c:param name="commentTargetId" value="gene"/>
<c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
<c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
<c:param name="organism" value="${binomial}" />
<c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
<c:param name="contig" value="${contig}" />
<c:param name="strand" value="${strand}" />
<c:param name="flag" value="0" />
</c:url>

<c:set var='commentLegend'>
    <c:catch var="e">
      <site:dataTable tblName="UserComments"/>
      <a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
    </c:catch>
    <c:if test="${e != null}">
     <site:embeddedError 
         msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
         e="${e}" 
     />
    </c:if>
    
</c:set>
<site:panel 
    displayName="User Comments"
    content="${commentLegend}" />
<br>

<%--- Notes --------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Notes provided by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>

<site:wdkTable tblName="Notes" isOpen="true"
               attribution="" postscript="${geneDbLink}"/>

<%-- Phenotype ------------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Phentypes curated from the literature by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>
<site:wdkTable tblName="Phenotype" isOpen="true"
               attribution="" postscript="${geneDbLink}"/>

<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">
  <c:set var="orthomclLink">
    <div align="left">
    <br><small>While the <a href="http://orthomcl.org">OrthoMCL</a>
     algorithm was 
used to identify ortholgy groups in the different TriTrypDB organisms, 
the current version of OrthoMCL does not include these groups. </small></div>
  </c:set>
  <site:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL_TrypDB"
                 postscript="${orthomclLink}"/>
</c:if>


<%-- EC ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<c:set var="attribution">
enzymeDB
</c:set>

<site:wdkTable tblName="EcNumber" isOpen="true"
               attribution="${attribution}"/>

</c:if>

<%-- GO ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<c:set var="attribution">
GO,InterproscanData
</c:set>

<site:wdkTable tblName="GoTerms" isOpen="true"
               attribution="${attribution}"/>

<br>
</c:if>


<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<p>
<table border='0' width='100%'><tr class="secondary3">
  <th align="center"><font face="Arial,Helvetica" size="+1">
  Protein Features
</font></th></tr></table>
<p>
</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

 <c:choose>
  <c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener"}'>
    <c:set var="ptracks">
    TarletonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Tcruzi_Proteomics_Amastigote
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
    <c:set var="ptracks">
    StuartMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Tbrucei_Proteomics_Procyclic_Form
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania infantum"}'>
    <c:set var="ptracks">
    ZilbersteinMassSpecPeptides+BrothertonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Linfantum_Proteomics_SDS_Amastigote,Linfantum_Proteomics_glycosylation
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania major"}'>
    <c:set var="ptracks">
    BrothertonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Linfantum_Proteomics_SDS_Amastigote
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
    <c:set var="ptracks">
    BrothertonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Linfantum_Proteomics_SDS_Amastigote
    </c:set>
	</c:when>

 </c:choose>
    
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/tritrypdbaa/?name=${id};type=${ptracks};width=640;embed=1
</c:set>

<c:if test="${ptracks ne ''}">
    <c:set var="proteinFeaturesImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${proteinFeaturesUrl}"/>
        </c:catch>
        <c:if test="${e!=null}">
            <site:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center></noindex>
    </c:set>

    <site:toggle
        name="proteinContext" 
        displayName="Protein Features"
        content="${proteinFeaturesImg}"
        attribution="${attribution}"/>
   <br>
</c:if>
</c:if>

<!-- Molecular weight -->
<c:set var="mw" value="${attrs['molecular_weight'].value}"/>
<c:set var="min_mw" value="${attrs['min_molecular_weight'].value}"/>
<c:set var="max_mw" value="${attrs['max_molecular_weight'].value}"/>

 <c:choose>
  <c:when test="${min_mw != null && max_mw != null && min_mw != max_mw}">
   <site:panel 
      displayName="Predicted Molecular Weight"
      content="${min_mw} to ${max_mw} Da" />
    </c:when>
    <c:otherwise>
   <site:panel 
      displayName="Predicted Molecular Weight"
      content="${mw} Da" />
    </c:otherwise>
  </c:choose>

<!-- Isoelectric Point -->
<c:set var="ip" value="${attrs['isoelectric_point']}"/>

        <c:choose>
            <c:when test="${ip.value != null}">
             <site:panel 
                displayName="${ip.displayName}"
                 content="${ip.value}" />
            </c:when>
            <c:otherwise>
             <site:panel 
                displayName="${ip.displayName}"
                 content="N/A" />
            </c:otherwise>
        </c:choose>

<c:set var="pdbLink">
  <br><a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
</c:set>

<site:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

<site:wdkTable tblName="Epitopes" isOpen="true" attribution="IEDB_Epitopes"/>

<p>
<table border='0' width='100%'><tr class="secondary3">
  <th align="center"><font face="Arial,Helvetica" size="+1">
  Sequences
</font></th></tr>

<tr><td><font size ="-1">Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</font></td></tr>

</table>
<p>

<%------------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${attrs['protein_sequence']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font><br/><br/>
	<font size="-1">Sequence Length: ${fn:length(attr.value)} aa</font><br/>
    </noindex>
</c:set>
<site:toggle name="proteinSequence" isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
</c:if>
<%------------------------------------------------------------------%>
<c:set var="attr" value="${attrs['transcript_sequence']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font><br/><br/>
	<font size="-1">Sequence Length: ${fn:length(attr.value)} bp</font><br/>
    </noindex>
</c:set>
<site:toggle name="transcriptSequence" isOpen="false"
    displayName="${attr.displayName}"
    content="${seq}" />
<br>


<c:set value="${wdkRecord.tables['GeneModel']}" var="geneModelTable"/>
<c:set var="i" value="0"/>
<c:forEach var="row" items="${geneModelTable}">
  <c:set var="totSeq" value="${totSeq}${row['sequence'].value}"/>
  <c:set var="i" value="${i +  1}"/>
</c:forEach>

<c:set var="seq">
 <pre><w:wrap size="60" break="<br>">${totSeq}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(totSeq)} bp</font><br/>
</c:set>
<site:toggle name="genomicSequence" isOpen="false"
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />

<br>

<%------------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${attrs['cds']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap><br/><br/>
    </font>
	<font size="-1">Sequence Length: ${fn:length(attr.value)} bp</font><br/>
    </noindex>
</c:set>
<site:toggle name="codingSequence" isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
</c:if>
<%------------------------------------------------------------------%> 


<c:choose>

<c:when test='${organismFull eq "Trypanosoma cruzi strain CL Brener"}'>
  <c:set var="reference">
      Sequence data for <i>Trypanosoma cruzi</i> strain CL Brener contigs were downloaded from Genbank (sequence and annotated features).<br>  Sequencing of <i>T. cruzi</i> was conducted by the <i>Trypanosoma cruzi</i> sequencing consortium (<a href="http://www.tigr.org/tdb/e2k1/tca1/">TIGR</a>, <a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a> and <a href="http://ki.se/ki/jsp/polopoly.jsp?d=130&l=en">Karolinska Institute</a>).
<br>Mapping of gene coordinates from contigs to chromosomes for <i>${organism}</i> chromosomes, generated by Rick Tarleton lab (UGA).
  </c:set>
</c:when>
<c:when test='${organismFull eq "Leishmania infantum"}'>
  <c:set var="reference">
   Sequence data for <i>Leishmania infantum</i> clone JPCM5 (MCAN/ES/98/LLM-877) were downloaded from <a href="http://www.genedb.org/genedb/linfantum/">GeneDB</a> (sequence and annotated features).<br> 
Sequencing of <i>L. infantum</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_infantum/">The Sanger Institute pathogen sequencing unit</a>. 
  </c:set>
</c:when>
<c:when test='${organismFull eq "Leishmania major"}'>
  <c:set var="reference">
   Sequence data for <i>Leishmania major</i> Friedlin (reference strain - MHOM/IL/80/Friedlin, zymodeme MON-103) were downloaded from <a href="http://www.genedb.org/genedb/leish/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>L. major</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_major/">The Sanger Institute pathogen sequencing unit</a>, <a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a> and <a href="http://www.sanger.ac.uk/Projects/L_major/EUseqlabs.shtml">The European Leishmania major Friedlin Genome Sequencing Consortium</a>.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Leishmania braziliensis"}'>
  <c:set var="reference">
   Sequence data for <i>Leishmania braziliensis</i> clone M2904 (MHOM/BR/75M2904) were downloaded from <a href="http://www.genedb.org/genedb/lbraziliensis/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>L. braziliensis</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_braziliensis/">The Sanger Institute pathogen sequencing unit</a>.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
  <c:set var="reference">
   Sequence data for <i>Trypanosome brucei</i> strain TREU (Trypanosomiasis Research Edinburgh University) 927/4 were downloaded from <a href="http://www.genedb.org/genedb/tryp/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>T. brucei</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/T_brucei/">The Sanger Institute pathogen sequencing unit</a> and <a href="http://www.tigr.org/tdb/e2k1/tba1/">TIGR</a>.
  </c:set>
</c:when>
<c:otherwise>
  <c:set var="reference">
Sequence data from GeneDB for <i>${organism}</i> chromosomes in EMBL format were generated at the Wellcome Trust Sanger Institute Pathogen Sequencing Unit. 
  </c:set>
</c:otherwise>
</c:choose>





<site:panel 
    displayName="Genome Sequencing and Annotation"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>
<hr>


<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>


<site:footer/>
