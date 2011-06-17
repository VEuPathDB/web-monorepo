<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
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

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<site:header title="${wdkRecord.primaryKey}" 
	     refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<a name="top"></a>

<c:set var="prd" value="${attrs['product'].value}"/>

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<c:set var="parvumOrganism" value="Cryptosporidium parvum Iowa II"/>
<c:set var="parvumChr6Organism" value="Cryptosporidium parvum"/>
<c:set var="hominisOrganism" value="Cryptosporidium hominis"/>
<c:set var="murisOrganism" value="Cryptosporidium muris"/>

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>

<c:set var="organism" value="${attrs['organism_full'].value}" />
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="genus_species" value="${attrs['genus_species'].value}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="strand" value="${attrs['strand_plus_minus'].value}"/>

<%-- display page header with recordClass type in banner --%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>


<%-- quick tool-box for the record --%>
  <site:recordToolbox /> 

<br>
<%--#############################################################--%>

<c:set var="append" value="" />

<%-- this block moves here so we can set a link to add a comment on the apge title --%>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${genus_species}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${contig}" />
  <c:param name="strand" value="${strand}" />
  <c:param name="flag" value="0" />
</c:url>

<div class="h2center" style="font-size:150%">
${id}<br><span style="font-size:70%">${prd}</span><br/>

<c:set var="count" value="0"/>
<c:forEach var="row" items="${wdkRecord.tables['UserComments']}">
        <c:set var="count" value="${count +  1}"/>
</c:forEach>
<c:choose>
<c:when test="${count == 0}">
	<a style="font-size:70%;font-weight:normal;cursor:hand" href="${commentsUrl}">Add the first user comment
</c:when>
<c:otherwise>
	<a style="font-size:70%;font-weight:normal;cursor:hand" href="#Annotation" onclick="showLayer('UserComments')">This gene has <span style='color:red'>${count}</span> user comments
</c:otherwise>
</c:choose>
<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

	<!-- the basket and favorites  -->
  	<wdk:recordPageBasketIcon />

</div>


<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>
<%-- DNA CONTEXT ---------------------------------------------------%>
<c:if test="${snps ne 'none'}">
    <c:set var="snptrack" value="SNPs+"/>
</c:if>

<c:choose>
<c:when test="${organism eq parvumOrganism}">
    <c:set var="gtracks">
    ${snptrack}Gene+SyntenySpanParvumChr6+SyntenyParvumChr6+SyntenySpanHominis+SyntenyHominis+SyntenySpanMuris+SyntenyMuris+UnifiedMassSpecPeptides+BLASTX+Cluster
    </c:set>

    <c:set var="attribution">
    C.muris_scaffoldsGB,C.hominis_scaffoldsGB,C.parvum_scaffoldsGB,
    C.parvumChr6_scaffoldsGB,Wastling2DGelLSMassSpec, NRDB,
    Wastling1DGelLSMassSpec,
    WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec,
    CryptoLoweryLCMSMSInsolExcystedMassSpec,
    CryptoLoweryLCMSMSInsolNonExcystedMassSpec,
    CryptoLoweryLCMSMSSolMassSpec,
    Ferrari_Proteomics_LTQ_Oocyst_walls,
    Ferrari_Proteomics_LTQ_intact_oocysts_merged,
    Ferrari_Proteomics_LTQ_Sporozoites_merged,
    Fiser_Proteomics_16May2006_1D_gel,
    Fiser_Proteomics_24Jun2006_1D_gel,
    Fiser_Proteomics_14Aug2006_1D_gel
    </c:set>

</c:when>
<c:when test="${organism eq hominisOrganism}">
    <c:set var="gtracks">
      BLASTX+Cluster+Gene+SyntenySpanParvum+SyntenyParvum+SyntenySpanMuris+SyntenyMuris    
    </c:set>

    <c:set var="attribution">
NRDB,C.muris_scaffoldsGB,C.hominis_scaffoldsGB,C.parvum_scaffoldsGB,C.parvumChr6_scaffoldsGB,dbEST
    </c:set>

</c:when>
<c:when test="${organism eq murisOrganism}">
    <c:set var="gtracks">
      BLASTX+Cluster+Gene+SyntenySpanParvum+SyntenyParvum+SyntenySpanHominis+SyntenyHominis
    </c:set>

    <c:set var="attribution">
NRDB,C.muris_scaffoldsGB,C.hominis_scaffoldsGB,C.parvum_scaffoldsGB,C.parvumChr6_scaffoldsGB,dbEST
    </c:set>

</c:when>
<c:when test="${organism eq parvumChr6Organism}">
    <c:set var="gtracks">
    Gene+SyntenySpanParvum+SyntenyParvum+SyntenySpanHominis+SyntenyHominis+SyntenySpanMuris+SyntenyMuris+WastlingMassSpecPeptides+EinsteinMassSpecPeptides+FerrariMassSpecPeptides+BLASTX
    </c:set>

    <c:set var="attribution">
    C.muris_scaffoldsGB,C.hominis_scaffoldsGB,C.parvum_scaffoldsGB,
    C.parvumChr6_scaffoldsGB,dbEST,Wastling2DGelLSMassSpec, NRDB,
    Wastling1DGelLSMassSpec,
    WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec,
    CryptoLoweryLCMSMSInsolExcystedMassSpec,
    CryptoLoweryLCMSMSInsolNonExcystedMassSpec,
    CryptoLoweryLCMSMSSolMassSpec,
    Ferrari_Proteomics_LTQ_Oocyst_walls,
    Ferrari_Proteomics_LTQ_intact_oocysts_merged,
    Ferrari_Proteomics_LTQ_Sporozoites_merged,
    Fiser_Proteomics_16May2006_1D_gel,
    Fiser_Proteomics_24Jun2006_1D_gel,
    Fiser_Proteomics_14Aug2006_1D_gel
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="gtracks" value="" />
</c:otherwise>
</c:choose>

<c:if test="${gtracks ne ''}">


<site:gbrowse source_id="${id}" project_id="${projectId}" sequence_id="${contig}"
              context_start_range="${context_start_range}" context_end_range="${context_end_range}"
              tracks="${gtracks}" attribution="${attribution}" />


<%--
  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    <center><div id="${gnCtxDivId}"></div></center>
    
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
  </c:set>

  <wdk:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    displayLink="${has_model_comment}"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />
--%>


</c:if>

<%-- SNPs  ---------------------------------------------------%>

<%-- snps dataTable defined above --%>
<c:if test="${snps ne 'none'}">

<wdk:wdkTable tblName="SNPs" isOpen="true"
     attribution="Widmer_SNPs"/>
</c:if>

<!-- gene alias table -->
<%-- <wdk:wdkTable tblName="Alias" isOpen="true" attribution=""/> --%>

<!-- Mercator / Mavid alignments -->
<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<c:set var="mercatorAlign">
<site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${contig}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"/>
</c:set>

<wdk:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>



<site:pageDivider name="Annotation"/>

<%------------------------------------------------------------------%>
<%-- moved above
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${genus_species}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${contig}" />
  <c:param name="strand" value="${strand}" />
  <c:param name="flag" value="0" />
</c:url>
--%>
<b><a title="Click to go to the comments page" style="font-size:120%"href="${commentsUrl}"><font size='-2'>
	Add a comment on ${id}</font>
	<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a></b><br><br>

<c:set var='commentLegend'>
    <c:catch var="e">
      	<site:dataTable tblName="UserComments"/>
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

<%------------------------------------------------------------------%>
<c:url var="addPhenotypeUrl" value="addPhenotype.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="phenotype"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${genus_species}" />
  <c:param name="flag" value="0" />
</c:url>


<!-- External Links --> 
<wdk:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>


<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${organism ne parvumChr6Organism && attrs['so_term_name'].value eq 'protein_coding'}">


  <c:set var="orthomclLink">
    <div align="center">
      <a href="<site:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <wdk:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL_Phyletic,OrthoMCL"
                 postscript="${orthomclLink}"/>

  <c:set var="attribution">
  </c:set>
</c:if>

<%-- EC ------------------------------------------------------------%>
<c:if test="${organism ne parvumChr6Organism && attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="attribution">
enzymeDB,CparvumEC-KEGG,ChominisEC-KEGG,CparvumEC-CryptoCyc,ChominisEC-CryptoCyc
</c:set>

<wdk:wdkTable tblName="EcNumber" isOpen="true"
     attribution="${attribution}"/>

</c:if>

<%-- PFAM ----------------------------------------------------------%>
<%--<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<wdk:wdkTable tblName="PfamDomains" isOpen="true"
     attribution=""/>
</c:if>--%>

<%-- GO ------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="attribution">
GO,InterproscanData,
CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs
</c:set>

<wdk:wdkTable tblName="GoTerms" isOpen="true"
     attribution="${attribution}"/>
</c:if>


<!-- gene alias table -->
<wdk:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>


<wdk:wdkTable tblName="Notes" isOpen="true" />


<%------------------------------------------------------------------%>
<c:set var="content">
<c:if test="${extdbname eq CPARVUMCONTIGS || extdbname eq CHOMINISCONTIGS}">
<a href="http://apicyc.apidb.org/${attrs['cyc_db'].value}/new-image?type=GENE-IN-CHROM-BROWSER&object=${wdkRecord.primaryKey}">CryptoCyc Metabolic Pathway Database</a>
<br>
</c:if>
${attrs['linkout'].value}
</c:set>

<site:panel 
    displayName="Links to Other Web Pages"
    content="${content}" />
<br>

<%-- Protein Features ---------------------------------------------------%>

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
  <site:pageDivider name="Protein"/>
</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+WastlingMassSpecPeptides+LoweryMassSpecPeptides+EinsteinMassSpecPeptides+FerrariMassSpecPeptides+PutignaniMassSpecPeptides+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    
    <c:set var="attribution">
     InterproscanData,NRDB
    </c:set>

<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/cryptodbaa/?name=${wdkRecord.primaryKey}:1..${proteinLength};type=${ptracks};width=640;embed=1;genepage=1
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

    <wdk:toggle name="proteinContext"  displayName="Protein Features"
             content="${proteinFeaturesImg}"
             attribution="${attribution}"/>

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

<%-- EPITOPES ------------------------------------------------------%>
<c:if test="${parvumChr6Organism ne hominisOrganism && attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="attribution">
</c:set>

<wdk:wdkTable tblName="Epitopes" isOpen="true"
     attribution="${attribution}"/>

</c:if>

<%-- Isolate Overlap  ------------------------------------------------------%>
<c:if test="${organism ne hominisOrganism && attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="attribution">
</c:set>

<wdk:wdkTable tblName="IsolateOverlap" isOpen="true"
     attribution="${attribution}"/>

</c:if>

<c:if test="${organism eq parvumOrganism}">
<wdk:wdkTable tblName="MassSpec" isOpen="true"
               attribution="Wastling1DGelLSMassSpec,Wastling2DGelLSMassSpec,WastlingMudPitSolMassSpec,WastlingMudPitInsolMassSpec,CryptoLoweryLCMSMSInsolExcystedMassSpec,CryptoLoweryLCMSMSInsolNonExcystedMassSpec,CryptoLoweryLCMSMSSolMassSpec,Ferrari_Proteomics_LTQ_Oocyst_walls,Ferrari_Proteomics_LTQ_intact_oocysts_merged,Ferrari_Proteomics_LTQ_Sporozoites_merged,Fiser_Proteomics_16May2006_1D_gel,Fiser_Proteomics_24Jun2006_1D_gel,Fiser_Proteomics_14Aug2006_1D_gel,Crypto_Proteomics_from_Lorenza_Putignani"/>
</c:if>

<c:set var="pdbLink">
  <br><a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
</c:set>

<wdk:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

<wdk:wdkTable tblName="Antibody" attribution="Antibody"/>

</c:if>

<site:pageDivider name="Sequences"/>

<p>
<table border='0' width='100%'>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>

<p>


<%------------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${attrs['translation']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font><br/><br/>
  <font size="-1">Sequence Length: ${fn:length(attr.value)} aa</font><br/>
    </noindex>
</c:set>
<wdk:toggle
    name="Translation"
    isOpen="true"
    displayName="Translation"
    content="${seq}" />
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
<wdk:toggle
    name="TranscriptSequence"
    isOpen="false"
    displayName="Transcript Sequence"
    content="${seq}" />

<%------------------------------------------------------------------%>
<c:set value="${wdkRecord.tables['GeneModel']}" var="geneModelTable"/>

<c:set var="i" value="0"/>
<c:forEach var="row" items="${geneModelTable}">
  <c:set var="totSeq" value="${totSeq}${row['sequence'].value}"/>
  <c:set var="i" value="${i +  1}"/>
</c:forEach>

<c:set var="seq">
    <noindex>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${totSeq}</w:wrap>
    </font><br/><br/>
    <font size="-1">Sequence Length: ${fn:length(totSeq)} bp</font><br/>
    </noindex>
</c:set>

<wdk:toggle
    name="GenomicSequence" 
    isOpen="false"
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />

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
<wdk:toggle
    name="CodingSequence"
    isOpen="true"
    displayName="Coding Sequence"
    content="${seq}" />
</c:if>
<%------------------------------------------------------------------%> 


<hr>
<c:choose>
<c:when test="${organism eq parvumOrganism}">
    <c:set var="reference">
Abrahamsen MS, Templeton TJ, Enomoto S, Abrahante JE, Zhu G, Lancto CA, 
Deng M, Liu C, Widmer G, Tzipori S, Buck GA, Xu P, Bankier AT, Dear PH, 
Konfortov BA, Spriggs HF, Iyer L, Anantharaman V, Aravind L, Kapur V. 
<b>Complete genome sequence of the apicomplexan, <i>Cryptosporidium parvum</i>.</b> 
Science. 2004 Apr 16;<a href="http://www.sciencemag.org/cgi/content/full/304/5669/441"><b>304</b>(5669):441-5</a>.
    </c:set>
</c:when>
<c:when test="${organism eq hominisOrganism}">
    <c:set var="reference">
Xu P, Widmer G, Wang Y, Ozaki LS, Alves JM, Serrano MG, Puiu D, Manque P, 
Akiyoshi D, Mackey AJ, Pearson WR, Dear PH, Bankier AT, Peterson DL, 
Abrahamsen MS, Kapur V, Tzipori S, Buck GA. 
<b>The genome of <i>Cryptosporidium hominis</i>.</b> 
Nature. 2004 Oct 28;<a href="http://www.nature.com/nature/journal/v431/n7012/abs/nature02977.html"><b>431</b>(7012):1107-12</a>.
    </c:set>
</c:when>
<c:when test="${organism eq parvumChr6Organism}">
    <c:set var="reference">
Bankier AT, Spriggs HF, Fartmann B, Konfortov BA, Madera M, Vogel C, 
Teichmann SA, Ivens A, Dear PH. 
<b>Integrated mapping, chromosomal sequencing and sequence analysis of <i>Cryptosporidium parvum</i>. 
</b>Genome Res. 2003 Aug;<a href="http://www.genome.org/cgi/content/full/13/8/1787">13(8):1787-99</a>
    </c:set>

</c:when>
<c:when test="${organism eq murisOrganism}">
    <c:set var="reference">
       <i>Cryptosporidium muris</i> sequence and annotation from Lis Caler and Hernan A. Lorenzi at the J. Craig Venter Institute <a href="http://msc.jcvi.org/c_muris/index.shtml"Target="_blank">JCVI</a>.
   </c:set>
</c:when>
<c:otherwise>
    <c:set var="reference" value="${extdbname}" />
</c:otherwise>
</c:choose>

<c:if test="${fn:containsIgnoreCase(notes, 'cryptodb update')}">
    <c:set var="reference">
    ${reference}<br><br>Additional gene prediction/annotation by CryptoDB.
    </c:set>
</c:if>

<site:panel
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>


<site:footer/>


<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

<site:pageLogger name="gene page" />
