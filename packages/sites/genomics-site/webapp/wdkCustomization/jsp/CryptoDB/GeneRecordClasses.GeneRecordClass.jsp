<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>

<imp:pageFrame title="${wdkRecord.primaryKey}" 
	     refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
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


<%-- quick tool-box for the record --%>
  <imp:recordToolbox /> 

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
	<a style="font-size:70%;font-weight:normal;cursor:hand" href="#Annotation" onclick="wdk.api.showLayer('UserComments')">This gene has <span style='color:red'>${count}</span> user comments
</c:otherwise>
</c:choose>
<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

	<!-- the basket and favorites  -->
  	<imp:recordPageBasketIcon />

</div>


<c:set var="attr" value="${attrs['overview']}" />
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" 
    attribute="${attr.name}"/>
<br>
<%-- DNA CONTEXT ---------------------------------------------------%>
<c:if test="${snps ne 'none'}">
    <c:set var="snptrack" value="SNPs+"/>
</c:if>

<c:set var="gtracks" value="${attrs['gtracks'].value}"/>


<c:if test="${gtracks ne ''}">


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${gtracks};width=640;embed=1;h_feat=${fn:toLowerCase(id)}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};h_feat=${fn:toLowerCase(id)}@yellow
    </c:set>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
    <center><div id="${gnCtxDivId}"></div></center>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
  </c:set>

  <imp:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    displayLink="${has_model_comment}"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution=""
  />


</c:if>

<%-- SNPs  ---------------------------------------------------%>

<%-- snps dataTable defined above --%>
<c:if test="${snps ne 'none'}">
<%-- TODO: NEED SNP OVERVIEW HERE --%>
<%-- TODO: WHAT ABOUT THE ALIGNMENTS? --%>
</c:if>

<!-- gene alias table -->
<%-- <imp:wdkTable tblName="Alias" isOpen="true" attribution=""/> --%>

<!-- Mercator / Mavid alignments -->
<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<c:set var="mercatorAlign">
<imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${contig}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"/>
</c:set>

<imp:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>



<imp:pageDivider name="Annotation"/>

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
      	<imp:dataTable tblName="UserComments"/>
    </c:catch>
    <c:if test="${e != null}">
     	<imp:embeddedError 
         	msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
         	e="${e}" 
     		/>
    </c:if>
</c:set>

<imp:panel 
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
<imp:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>


<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${organism ne parvumChr6Organism && attrs['so_term_name'].value eq 'protein_coding'}">


  <c:set var="orthomclLink">
    <div align="center">
      <a target="_blank" href="<imp:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <imp:wdkTable tblName="Orthologs" isOpen="true" attribution=""
                 postscript="${orthomclLink}"/>

  <c:set var="attribution">
  </c:set>
</c:if>

<%-- EC ------------------------------------------------------------%>
<c:if test="${organism ne parvumChr6Organism && attrs['so_term_name'].value eq 'protein_coding'}">


<imp:wdkTable tblName="EcNumber" isOpen="true"
     attribution=""/>

</c:if>

<%-- PFAM ----------------------------------------------------------%>
<%--<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<imp:wdkTable tblName="PfamDomains" isOpen="true"
     attribution=""/>
</c:if>--%>

<%-- GO ------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">


<imp:wdkTable tblName="GoTerms" isOpen="true"
     attribution=""/>
</c:if>


<!-- gene alias table -->
<imp:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>


<imp:wdkTable tblName="Notes" isOpen="true" />


<%------------------------------------------------------------------%>
<c:set var="content">
<c:if test="${extdbname eq CPARVUMCONTIGS || extdbname eq CHOMINISCONTIGS}">
<a href="http://apicyc.apidb.org/${attrs['cyc_db'].value}/new-image?type=GENE-IN-CHROM-BROWSER&object=${wdkRecord.primaryKey}">CryptoCyc Metabolic Pathway Database</a>
<br>
</c:if>
${attrs['linkout'].value}
</c:set>

<imp:panel 
    displayName="Links to Other Web Pages"
    content="${content}" />
<br>

<%-- Protein Features ---------------------------------------------------%>

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
  <imp:pageDivider name="Protein"/>
</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+WastlingMassSpecPeptides+LoweryMassSpecPeptides+EinsteinMassSpecPeptides+FerrariMassSpecPeptides+PutignaniMassSpecPeptides+HydropathyPlot+SecondaryStructure+BLASTP
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
            <imp:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center></noindex>
    </c:set>

    <imp:toggle name="proteinContext"  displayName="Protein Features"
             content="${proteinFeaturesImg}"
             attribution=""/>

</c:if>


<!-- Molecular weight -->

<c:set var="mw" value="${attrs['molecular_weight'].value}"/>
<c:set var="min_mw" value="${attrs['min_molecular_weight'].value}"/>
<c:set var="max_mw" value="${attrs['max_molecular_weight'].value}"/>

 <c:choose>
  <c:when test="${min_mw != null && max_mw != null && min_mw != max_mw}">
   <imp:panel 
      displayName="Predicted Molecular Weight"
      content="${min_mw} to ${max_mw} Da" />
    </c:when>
    <c:otherwise>
   <imp:panel 
      displayName="Predicted Molecular Weight"
      content="${mw} Da" />
    </c:otherwise>
  </c:choose>

<!-- Isoelectric Point -->
<c:set var="ip" value="${attrs['isoelectric_point']}"/>

        <c:choose>
            <c:when test="${ip.value != null}">
             <imp:panel 
                displayName="${ip.displayName}"
                 content="${ip.value}" />
            </c:when>
            <c:otherwise>
             <imp:panel 
                displayName="${ip.displayName}"
                 content="N/A" />
            </c:otherwise>
        </c:choose>

<%-- EPITOPES ------------------------------------------------------%>
<c:if test="${parvumChr6Organism ne hominisOrganism && attrs['so_term_name'].value eq 'protein_coding'}">

<imp:wdkTable tblName="Epitopes" isOpen="true"
     attribution=""/>

</c:if>

<%-- Isolate Overlap  ------------------------------------------------------%>
<%-- <c:if test="${organism ne hominisOrganism && attrs['so_term_name'].value eq 'protein_coding'}">


<imp:wdkTable tblName="IsolateOverlap" isOpen="true"
     attribution=""/>

</c:if>
--%>
<c:if test="${organism eq parvumOrganism}">
<imp:wdkTable tblName="MassSpec" isOpen="true"
               attribution=""/>
</c:if>

<imp:wdkTable tblName="PdbSimilarities" postscript="${attrs['pdb_blast_form'].value}" attribution=""/>

<imp:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>

<imp:wdkTable tblName="Antibody" attribution=""/>

</c:if>


<c:if test="${attrs['hasExpression'].value eq '1'}">
  <imp:pageDivider name="Expression"/>

  <imp:expressionGraphs species="${genus_species}"/>

</c:if>


<imp:pageDivider name="Sequences"/>

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
<imp:toggle
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
<imp:toggle
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

<imp:toggle
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
<imp:toggle
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

<c:set value="${wdkRecord.tables['GenomeSequencingAndAnnotationAttribution']}" var="referenceTable"/>

<c:set value="Error:  No Attribution Available for This Genome!!" var="reference"/>
<c:forEach var="row" items="${referenceTable}">
  <c:if test="${extdbname eq row['name'].value}">
    <c:set var="reference" value="${row['description'].value}"/>
  </c:if>
</c:forEach>

<imp:panel
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%-- if wdkRecord.attributes['organism'].value --%>


</imp:pageFrame>


<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

<imp:pageLogger name="gene page" />
