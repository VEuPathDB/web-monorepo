<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />


<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<site:header title="${wdkModel.displayName} : gene ${id}"
			 refer="recordPage"
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
<c:set var="organism_full" value="${attrs['organism_full'].value}"/>

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<site:header title="${wdkModel.displayName} : gene ${id} (${prd})"
			 refer="recordPage"
             banner="${id}<br>${prd}"
             divisionName="Gene Record"
             division="queries_tools"
             summary="${overview.value}"/>

<a name = "top"></a>

<table width="100%">
<tr>
  <td align="center" style="padding:6px;"><a href="#Annotation">Annotation</a>
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

<%--  TITLE  --------------------------%>
<%-- quick tool-box for the record --%>
<site:recordToolbox />
<h2><center>
        <wdk:recordPageBasketIcon desc="${prd}"/>
        <%--${fn:length(wdkRecord.tables['CommunityExpComments'])}--%>
</center></h2>


<%--- COMMUNITY EXPERT ANNOTATION -----------%>

<!--
<c:if test="${fn:length(wdkRecord.tables['CommunityExpComments']) gt 0}">
<div style="font-size:large; text-align:center; font-weight:bold"> 
<a href=<c:url value="showComment.do?projectId=${projectId}&stableId=${id}&commentTargetId=gene"/>>Community Annotation Available</a>
</div>
<br>
</c:if>
</a>
-->

<site:panel 
    displayName="Community Expert Annotation"
    content="" />

<c:catch var="e">
  <site:dataTable tblName="CommunityExpComments"/>
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

<br/><br/>

<%-- OVERVIEW ---------------%>

<c:set var="attr" value="${attrs['overview']}" />
<site:panel
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>


<%-- DNA CONTEXT ---------------%>

<!-- deal with specific contexts depending on organism -->
<c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">
 <!--Alternate Gene Models are taking time are hence being currently avoided in the record page -->
 <!-- c:set var="tracks" value="Version4Genes+Gene+SyntenySpanGT1+SyntenyGT1+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora+ChIPEinsteinPLK+ChIPEinsteinRHPeaks+ChIPEinsteinPLKPeaks+ChIPEinsteinTypeIIIPeaks" -->
 <c:set var="tracks" value="Gene+SyntenySpanGT1+SyntenyGT1+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora+ChIPEinsteinPLK+ChIPEinsteinME1"/>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii GT1'}">
     <c:set var="tracks" value="Gene+SyntenySpanME49+SyntenyME49+SyntenySpanVEG+SyntenyVEG+SyntenySpanNeospora+SyntenyNeospora"/>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii VEG'}">
     <c:set var="tracks" value="Gene+SyntenySpanGT1+SyntenyGT1+SyntenySpanME49+SyntenyME49+SyntenySpanNeospora+SyntenyNeospora"/>
</c:if>
<c:if test="${organism_full eq 'Neospora caninum'}">
     <c:set var="tracks" value="Gene+SyntenySpanGT1+SyntenyGT1+SyntenySpanME49+SyntenyME49+SyntenySpanVEG+SyntenyVEG"/>
</c:if>

<c:set var="attribution">
Scaffolds,ChromosomeMap,ME49_Annotation,TgondiiGT1Scaffolds,TgondiiVegScaffolds,TgondiiRHChromosome1,TgondiiApicoplast,TIGRGeneIndices_Tgondii,dbEST,ESTAlignments_Tgondii,N.caninum_chromosomes,NeosporaUnassignedContigsSanger,TIGRGeneIndices_NeosporaCaninum
</c:set>


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>
    
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <wdk:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />

<%-- END DNA CONTEXT --------------------------------------------%>

<!-- strains comparison table -->
<wdk:wdkTable tblName="Strains" isOpen="true"
               attribution="T.gondiiGT1_contigsGB,T.gondiiME49_contigsGB,T.gondiiVEG_contigsGB"/>

<!-- gene alias table -->
<wdk:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>

<!-- snps between strains -->
<wdk:wdkTable tblName="SNPs" isOpen="false"
                   attribution="ME49_SNPs,AmitAlignmentSnps,Lindstrom454Snps"/>

<!-- locations -->
<wdk:wdkTable tblName="Genbank" isOpen="true"
               attribution="T.gondiiGT1_contigsGB,T.gondiiME49_contigsGB,T.gondiiVEG_contigsGB" />
<!-- version 4 genes -->
<wdk:wdkTable tblName="ToxoVer4Genes" isOpen="true"
               attribution="" />


<c:if test="${externalDbName.value ne 'Roos Lab T. gondii apicoplast'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

<c:set var="mercatorAlign">
  <site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                      contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="secondary2" cellPadding="0"/>
</c:set>

<wdk:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment of ${sequence_id} across available genomes"
  content="${mercatorAlign}"
  attribution=""/>

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
<wdk:wdkTable tblName="UserComments"/>
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


<c:catch var="e">
  <wdk:wdkTable tblName="TaskComments" isOpen="true"
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
<wdk:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>


<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="http://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=${orthomcl_name}">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <wdk:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL"
                 postscript="${orthomclLink}"/>
</c:if>

  <wdk:wdkTable tblName="EcNumber" isOpen="true"
                 attribution="ME49_Annotation,enzymeDB"/>

  <wdk:wdkTable tblName="GoTerms" isOpen="true"
                 attribution="GO,GOAssociations,InterproscanData"/>

<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>

<c:if test="${externalDbName.value eq 'Roos Lab T. gondii apicoplast'}">
  <wdk:wdkTable tblName="Notes" isOpen="true"
	 	 attribution="TgondiiApicoplast"/>
</c:if>                 

  <wdk:wdkTable tblName="MetabolicPathways" isOpen="true"
                 attribution="MetabolicDbXRefs_Feng"/>

<wdk:wdkTable tblName="Antibody" attribution="Antibody"/>
<c:set var="toxocyc" value="${attrs['ToxoCyc']}"/>

<!--
<site:panel 
    displayName="ToxoCyc <a href='${toxocyc.url}'>View</a>"
    content="" />
-->

<c:if test="${isCodingGene}">
  <site:pageDivider name="Protein"/>

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

<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/toxodbaa/?name=${wdkRecord.primaryKey}:1..${proteinLength};type=${ptracks};width=600;embed=1;genepage=1
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

    <wdk:toggle name="proteinFeatures" 
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

    <wdk:wdkTable tblName="Epitopes"/>

</c:if>

<wdk:wdkTable tblName="MassSpec" isOpen="true"
               attribution="Wastling-Rhoptry,Wastling1D_SDSPage,Wastling-1D_SDSPage-Soluble,Wastling-1D_SDSPage-Insoluble,Wastling-MudPIT-Soluble,Wastling-MudPIT-Insoluble,Murray-Roos_Proteomics_Conoid-enriched,Murray-Roos_Proteomics_Conoid-depleted,Dec2006_Tg_membrane_Fayun_Proteomics,Oct2006_Tg_membrane_Fayun_Proteomics,massspec_1D_tg_1frac_020306_Proteomics,massspec_june30_2006_Proteomics,massspec_may02-03_2006_Proteomics,massspec_may10_2006_Proteomics,massspec_May2007_Proteomics,massspec_May22_2007_Proteomics,massspec_membrane_frac_frac_Proteomics,Moreno-1-annotated,massspec_Carruthers_2destinct_peptides,massspec_MudPIT_Twinscan_hits"/>


<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<site:pageDivider name="Expression"/>

<c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">

 <%-- ------------------------------------------------------------------ --%>

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
        <td>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
        </td>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>        

	<td class="top">  
          <wdk:wdkTable tblName="ToxoStrainsMicroarrayPercentile" isOpen="true"/>

        </td>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>        
        <td class="centered">
          <div class="small">
             	<!-- DESCRIPTION?? -->
The percentile graph on the right represents the percentiles of each expression value across the
dynamic range of the microarray log(2) intensities.
experimental condition.
          </div>
        </td>

      </tr>
    </table>


  </c:set>


  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Tachyzoite differential expression profiling of three archetypal T. gondii lineages"
               attribution="Tg_3_Archetypal_Lineages_ExpressionData"/>

</c:if>

 <%-- ------------------------------------------------------------------ --%>
  <site:expressionGraphs species="${organism_full}" model="toxo"/>
 <%-- ------------------------------------------------------------------ --%>


<c:if test="${organism_full eq 'Toxoplasma gondii GT1' || organism_full eq 'Toxoplasma gondii VEG'}">


<wdk:wdkTable tblName="ToxoExpandStrainsMicroarray" isOpen="true"
                   attribution="Tg_3_Archetypal_Lineages_ExpressionData"/>

</c:if>



<site:pageDivider name="Sequence"/>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${proteinSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<wdk:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
             content="${proteinSequenceContent}" isOpen="false"/>
</c:if>

<!-- transcript sequence -->
<c:set var="transcriptSequence" value="${attrs['transcript_sequence']}"/>
<c:set var="transcriptSequenceContent">
  <pre><w:wrap size="60">${transcriptSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(transcriptSequence.value)} bp</font><br/>
</c:set>
<wdk:toggle name="transcriptSequence"
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

<wdk:toggle name="genomicSequence" isOpen="false"
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />

<c:if test="${isCodingGene}">
<!-- CDS -->
<c:set var="cds" value="${attrs['cds']}"/>
<c:set var="cdsContent">
  <pre><w:wrap size="60">${cds.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(cds.value)} bp</font><br/>
</c:set>
<wdk:toggle name="cds" displayName="${cds.displayName}"
             content="${cdsContent}" isOpen="false"/>
</c:if>


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
Chromosome sequences and annotation for <i>Neospora caninum</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute.  Please visit <a href="http://www.genedb.org/Homepage/Ncaninum">GeneDB</a> for project details and data release policies. 
  </c:set>
</c:when>

<c:when test='${organism_full eq "Toxoplasma gondii RH" }'>
  <c:set var="reference">
Genome sequence and annotation for <i>T. gondii</i> apicoplast provided by David Roos (University of Pennsylvania), Jessica Kissinger (University of Georgia).The apicoplast genome of <i>T. gondii</i> RH (Type I) strain is 34996 bps long (GeneBank accession #: <a href="http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=NC_001799"TARGET="_blank">NC_001799</a>). Click <a href="http://roos.bio.upenn.edu/%7Erooslab/jkissing/plastidmap.html"TARGET="_blank">here</a> to view a map of the <i>T. gondii</i> apicoplast. 
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

<site:pageLogger name="gene page" />
