<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />


<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="organism_full" value="${attrs['organism_full'].value}"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:choose>
<c:when test="${organism_full eq null || !wdkRecord.validRecord}">
<site:header title="${wdkModel.displayName} : gene ${id}"
             divisionName="Gene Record"
             division="queries_tools"/>
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>
<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="isCodingGene" value="${so_term_name eq 'protein_coding' || so_term_name eq 'pseudogene'}"/>
<c:set var="genus_species" value="${attrs['genus_species'].value}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="sequence_id" value="${attrs['sequence_id'].value}"/>
<c:set var="strand" value="${attrs['strand_plus_minus'].value}"/>
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<site:header title="${wdkModel.displayName} : gene ${id} (${prd})"
             banner="${id}<br>${prd}"
             divisionName="Gene Record"
             division="queries_tools"
             summary="${overview.value}"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white  class=thinTopBorders>

 <tr>
  <td bgcolor=white valign=top>



<table width="100%">
<tr>
  <td align="center"><a href="#Annotation">Annotation</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

  <td align="center"><a href="#Protein">Protein</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

  <td align="center"><a href="#Expression">Expression</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

  <td align="center"><a href="#Sequence">Sequence</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

</tr>
</table>


<hr>

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

<%-- DNA CONTEXT ---------------------------------------------------%>

<!-- deal with specific contexts depending on organism -->
<c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">
 <!--Alternate Gene Models are taking time are hence being currently avoided in the record page -->
 <!-- c:set var="tracks" value="Version4Genes+AnnotatedGenes+SyntenySpanGT1+SyntenyGT1+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora+ChIPEinsteinPLK+ChIPEinsteinRHPeaks+ChIPEinsteinPLKPeaks+ChIPEinsteinTypeIIIPeaks" -->
 <c:set var="tracks" value="AnnotatedGenes+SyntenySpanGT1+SyntenyGT1+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora+ChIPEinsteinPLK+ChIPEinsteinRHPeaks+ChIPEinsteinPLKPeaks+ChIPEinsteinTypeIIIPeaks"/>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii GT1'}">
     <c:set var="tracks" value="AnnotatedGenes+SyntenySpanME49+SyntenyME49+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora"/>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii VEG'}">
     <c:set var="tracks" value="AnnotatedGenes+SyntenySpanGT1+SyntenyGT1+SyntenySpanME49+SyntenyME49+SyntenySpanNeospora+SyntenyNeospora"/>
</c:if>
<c:if test="${organism_full eq 'Neospora caninum'}">
     <c:set var="tracks" value="AnnotatedGenes+SyntenySpanGT1+SyntenyGT1+SyntenySpanME49+SyntenyME49+SyntenySpanVEG+SyntenyVEG"/>
</c:if>

<c:set var="attribution">
Scaffolds,ChromosomeMap,ME49_Annotation,TgondiiGT1Scaffolds,TgondiiVegScaffolds,TgondiiRHChromosome1,TgondiiApicoplast,TIGRGeneIndices_Tgondii,dbEST,ESTAlignments_Tgondii,NeosporaChromosomesSanger,NeosporaUnassignedContigsSanger,TIGRGeneIndices_NeosporaCaninum
</c:set>


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${id}@yellow
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>
    
    <c:set var="labels" value="${fn:replace(tracks, '+', ';label=')}" />
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <site:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />

<%-- END DNA CONTEXT --------------------------------------------%>

<!-- strains comparison table -->
<site:wdkTable tblName="Strains" isOpen="true"
               attribution="T.gondiiGT1_contigsGB,T.gondiiME49_contigsGB,T.gondiiVEG_contigsGB"/>

<!-- snps between strains -->
<site:wdkTable tblName="SNPs" isOpen="false"
                   attribution="ME49_SNPs,AmitAlignmentSnps,Lindstrom454Snps"/>

<!-- locations -->
<site:wdkTable tblName="Genbank" isOpen="true"
               attribution="T.gondiiGT1_contigsGB,T.gondiiME49_contigsGB,T.gondiiVEG_contigsGB" />
<!-- version 4 genes -->
<site:wdkTable tblName="ToxoVer4Genes" isOpen="true"
               attribution="" />


<c:if test="${externalDbName.value ne 'Roos Lab T. gondii apicoplast'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

  <site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                      contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="secondary2" cellPadding="0"/>
</c:if>

<site:pageDivider name="Annotation"/>

<c:url var="commentsUrl" value="addComment.do">
    <c:param name="stableId" value="${id}"/>
    <c:param name="commentTargetId" value="gene"/>
    <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
    <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" /> 
    <c:param name="organism" value="${genus_species}" />
    <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
    <c:param name="contig" value="${attrs['sequence_id'].value}" />
    <c:param name="strand" value="${strand}" />
    <c:param name="flag" value="0" /> 
</c:url>

<a href="${commentsUrl}">Add a comment on ${id}</a>


<c:catch var="e">
<site:wdkTable tblName="UserComments"/>
</c:catch>

<c:if test="${e != null}">
 <table  width="100%" cellpadding="3">
      <tr><td><b>User Comments</b>
     <site:embeddedError
         msg="<font size='-1'><i>temporarily unavailable.</i></font>"
         e="${e}"
     />
      </td></tr>
 </table>
</c:if>

<c:if test="${e != null}">
 <table  width="100%" cellpadding="3">
      <tr><td><b>User Comments</b>
     <site:embeddedError
         msg="<font size='-1'><i>temporarily unavailable.</i></font>"
         e="${e}"
     />
      </td></tr>
 </table>
</c:if>

<c:catch var="e">
  <site:wdkTable tblName="TaskComments" isOpen="true"
                 attribution="TASKAnnotation" suppressColumnHeaders="true"/>
</c:catch>
<c:if test="${e != null}">
 <table  width="100%" cellpadding="3">
      <tr><td><b>Toxoplasma Genome Sequencing Project Annotation </b>
     <site:embeddedError 
         msg="<font size='-1'><i>temporarily unavailable.</i></font>"
         e="${e}" 
     />
     </td></tr>
 </table>
</c:if>


<!-- External Links --> 
<site:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>


<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="http://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=${orthomcl_name}">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <site:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL"
                 postscript="${orthomclLink}"/>
</c:if>

  <site:wdkTable tblName="EcNumber" isOpen="true"
                 attribution="ME49_Annotation,enzymeDB"/>

  <site:wdkTable tblName="GoTerms" isOpen="true"
                 attribution="GO,GOAssociations,InterproscanData"/>

<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>

<c:if test="${externalDbName.value eq 'Roos Lab T. gondii apicoplast'}">
  <site:wdkTable tblName="Notes" isOpen="true"
	 	 attribution="TgondiiApicoplast"/>
</c:if>                 

  <site:wdkTable tblName="MetabolicPathways" isOpen="true"
                 attribution="MetabolicDbXRefs_Feng"/>

<site:wdkTable tblName="Antibody" attribution="Antibody"/>
<c:set var="toxocyc" value="${attrs['ToxoCyc']}"/>

<!--
<site:panel 
    displayName="ToxoCyc <a href='${toxocyc.url}'>View</a>"
    content="" />
-->

<c:if test="${isCodingGene}">
  <site:pageDivider name="Protein"/>

  <c:set var="proteinFeatures" value="${attrs['proteinFeatures'].value}"/>
  <c:if test="${! fn:startsWith(proteinFeatures, 'http')}">
    <c:set var="proteinFeatures">
      ${pageContext.request.scheme}://${pageContext.request.serverName}/${proteinFeatures}
    </c:set>
  </c:if>

  <c:catch var="e">
    <c:set var="proteinFeaturesContent">
      <c:import url="${proteinFeatures}"/>
    </c:set>
  </c:catch>
  <c:if test="${e!=null}"> 
    <c:set var="proteinFeaturesContent">
    <site:embeddedError 
        msg="<font size='-2'>temporarily unavailable</font>" 
        e="${e}" 
    />
    </c:set>
  </c:if>
  <!-- ${proteinFeatures} -->


<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
   <c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">
    <c:set var="ptracks">
     WastlingMassSpecPeptides+MurrayMassSpecPeptides+EinsteinMassSpecPeptides+CarruthersMassSpecPeptides+MorenoMassSpecPeptides+InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
    </c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii GT1'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii VEG'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
</c:if>
<c:if test="${organism_full eq 'Neospora caninum'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
</c:if>
    <c:set var="attribution">
    NRDB,InterproscanData,Wastling-Rhoptry,Wastling1D_SDSPage,Wastling-1D_SDSPage-Soluble,Wastling-1D_SDSPage-Insoluble,Wastling-MudPIT-Soluble,Wastling-MudPIT-Insoluble,Murray-Roos_Proteomics_Conoid-enriched,Murray-Roos_Proteomics_Conoid-depleted,1D_tg_35bands_022706_Proteomics,Dec2006_Tg_membrane_Fayun_Proteomics,March2007Tg_Cyto_Proteins_Proteomics,Oct2006_Tg_membrane_Fayun_Proteomics,massspec_may02-03_2006_Proteomics,massspec_june30_2006_Proteomics,massspec_Oct2006_Tg_membrane_Fayun_Proteomics,massspec_may10_2006_Proteomics,massspec_1D_tg_1frac_020306_Proteomics,massspec_Carruthers_2destinct_peptides,massspec_MudPIT_Twinscan_hits,Moreno-1-annotated,Moreno-6-annotated,Moreno-p3-annotated
    </c:set>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/toxodbaa/?name=${wdkRecord.primaryKey};type=${ptracks};width=600;embed=1
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

    <site:toggle name="proteinFeatures" 
        displayName="Protein Features"
        content="${proteinFeaturesImg}"
        attribution="${attribution}"/>
      <!--${proteinFeaturesUrl} -->
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
      displayName="Molecular Weight"
      content="${min_mw} to ${max_mw} Da" />
    </c:when>
    <c:otherwise>
   <site:panel 
      displayName="Molecular Weight"
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

    <site:wdkTable tblName="Epitopes"/>

</c:if>

<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>
<site:pageDivider name="Expression"/>

<c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">

  <c:set var="secName" value="Roos::ToxoLineages::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&id=${id}&model=toxo&fmt=png"/>
  <c:set var="isOpen" value="true"/>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_archetypal'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="2">
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
        </td>

        <c:if test="${attrs['graph_archetypal'].value != 0}">
        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="1"></td>

	<td valign=top><image src="<c:url value="/images/toxo_percentile_lineages.PNG"/>">  </td>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>        
        <td>
          <div class="small">
             	<!-- DESCRIPTION?? -->
The percentile graph on the right represents the percentiles of each expression value across the
dymanic range of the microarray log(2) intensities.
experimental condition.
          </div>
        </td>
        </c:if>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>
      </tr>
    </table>
  </c:set>


  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Expression profiling of three archetypal T. gondii lineages"
               attribution="Tg_3_Archetypal_Lineages_ExpressionData"/>

<site:wdkTable tblName="ToxoStrainsMicroarrayPercentile" isOpen="true"
                   attribution="Tg_3_Archetypal_Lineages_ExpressionData"/>

</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii GT1' || organism_full eq 'Toxoplasma gondii VEG'}">


<site:wdkTable tblName="ToxoExpandStrainsMicroarray" isOpen="true"
                   attribution="Tg_3_Archetypal_Lineages_ExpressionData"/>

</c:if>

<site:pageDivider name="Sequence"/>
<font size ="-1">Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</font>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${proteinSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<site:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
             content="${proteinSequenceContent}" isOpen="false"/>
</c:if>

<!-- transcript sequence -->
<c:set var="transcriptSequence" value="${attrs['transcript_sequence']}"/>
<c:set var="transcriptSequenceContent">
  <pre><w:wrap size="60">${transcriptSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(transcriptSequence.value)} bp</font><br/>
</c:set>
<site:toggle name="transcriptSequence"
             displayName="${transcriptSequence.displayName}"
             content="${transcriptSequenceContent}" isOpen="false"/>

<!-- genomic sequence -->
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

<c:if test="${isCodingGene}">
<!-- CDS -->
<c:set var="cds" value="${attrs['cds']}"/>
<c:set var="cdsContent">
  <pre><w:wrap size="60">${cds.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(cds.value)} bp</font><br/>
</c:set>
<site:toggle name="cds" displayName="${cds.displayName}"
             content="${cdsContent}" isOpen="false"/>
</c:if>


</td></tr></table>


<hr>
<br />


<c:choose>
<c:when test='${organism_full eq "Toxoplasma gondii VEG" }'>
  <c:set var="reference">
<b><i>Toxoplasma gondii</i> VEG sequence and annotation from Lis Caler at the J. Craig Venter Institute (<a href="http://msc.jcvi.org/t_gondii/index.shtml"Target="_blank">JCVI</a>).</b>
  </c:set>
</c:when>

<c:when test='${organism_full eq "Toxoplasma gondii GT1" }'>
  <c:set var="reference">
<b><i>Toxoplasma gondii</i> GT1  sequence and annotation from Lis Caler at the J. Craig Venter Institute (<a href="http://msc.jcvi.org/t_gondii/index.shtml"Target="_blank">JCVI</a>).</b>
  </c:set>
</c:when>

<c:when test='${organism_full eq "Toxoplasma gondii ME49" }'>
  <c:set var="reference">
<b><i>Toxoplasma gondii</i> ME49  sequence and annotation from Lis Caler at the J. Craig Venter Institute (<a href="http://msc.jcvi.org/t_gondii/index.shtml"Target="_blank">JCVI</a>).</b>
  </c:set>
</c:when>

<c:when test='${organism_full eq "Neospora caninum" }'>
  <c:set var="reference">
<b>Chromosome sequence and annotation for Neospora caninum provided by Arnab Pain (The Wellcome Trust Sanger Institute) and Jonathan Wastling (University of Liverpool, Faculty of Veterinary Science). The Welcome Trust Sanger Institute plans on publishing the completed and annotated sequences in a peer-reviewed journal as soon as possible. Permission should be obtained from Arnaub Pain before publishing analyses of the sequence/open reading frames/genes on a chromosome or genome scale.</b>
  </c:set>
</c:when>

<c:otherwise>
  <c:set var="reference">
  ERROR:  No reference found for this gene.
  </c:set>
</c:otherwise>
</c:choose>


<site:panel 
    displayName="Genome Sequencing and Annotation"
    content="${reference}" />

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

</c:otherwise>
</c:choose>

<site:footer/>
