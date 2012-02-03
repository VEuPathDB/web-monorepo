<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="recordType" value="${wdkRecord.recordClass.type}"/> 

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<imp:header title="GiardiaDB: gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
	     refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools" />
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/> 
<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<c:set var="sequence_id" value="${attrs['sequence_id'].value}"/>
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="binomial" value="${attrs['genus_species'].value}"/>
<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>
<c:set var="tree_source_id" value="${attrs['phyTreeId'].value}"/>
<c:set var="tree_applet" value="${attrs['tree_applet_link'].value}"/>
<%-- display page header with recordClass type in banner --%>

<c:set var="async" value="${param.sync != '1'}"/>

<imp:header title="GiardiaDB: gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             refer="recordPage" 
             division="queries_tools" />

<br>
<%--#############################################################--%>
<a name="top"></a>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<%-- this block moves here so we can set a link to add a comment on the page title --%>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${sequence_id}" />
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
  	<imp:recordPageBasketIcon />

</div>



<imp:panel 
    displayName="Community Expert Annotation"
    content="" />

<c:catch var="e">
  <imp:dataTable tblName="CommunityExpComments"/>
</c:catch>
<c:if test="${e != null}">
  <table  width="100%" cellpadding="3">
    <tr><td><b>User Comments</b>
    <imp:embeddedError
    msg="<font size='-1'><i>temporarily unavailable.</i></font>"
    e="${e}"
    />
    </td></tr>
  </table>
</c:if>
<br/><br/>

<%-- OVERVIEW ---------------%>


<c:set var="append" value="" />


<c:set var="attr" value="${attrs['overview']}" />

<c:set var="gtracks" value="${attrs['gtracks'].value}"/>

<c:choose>
  <c:when test='${organismFull eq "Giardia Assemblage A isolate WB"}'>
     <c:set var="assemblage" value="<b>Assemblage A isolate WB</b>"/>
     <c:set var="ptracks" value="RatnerMassSpecPeptides+TachezyMassSpecPeptides+InterproDomains+SignalP+TMHMM+BLASTP"/>
  </c:when>
  <c:when test='${organismFull eq "Giardia Assemblage B isolate GS"}'>
     <c:set var="assemblage" value="<b>Assemblage B isolate GS</b>" />
     <c:set var="ptracks" value="InterproDomains+SignalP+TMHMM+BLASTP"/> 
  </c:when>
  <c:when test='${organismFull eq "Giardia Assemblage E isolate P15"}'>
     <c:set var="assemblage" value="<b>Giardia Assemblage E isolate P15</b>" /> 
     <c:set var="ptracks" value="InterproDomains+SignalP+TMHMM+BLASTP" /> 
  </c:when>
</c:choose>


<c:if test="${attrs['is_deprecated'].value eq 'Yes'}">
   <c:set var="isdeprecated">
     **<b>Deprecated</b>**
   </c:set>
</c:if>

<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}   ${assemblage} ${isdeprecated}" />
<br>

<c:set var="content">
${attrs['organism'].value}<br>
</c:set>

<%-- DNA CONTEXT ---------------------------------------------------%>


<c:set var="attribution">
G.lamblia_contigsGB,G.intestinalisAssemblageB_contigsGB,G.intestinalisAssemblageE_contigsGB
</c:set>


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/giardiadb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${gtracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/giardiadb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    <center><div id="${gnCtxDivId}"></div></center>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <imp:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />


<%-- END DNA CONTEXT --------------------------------------------%>

<%-- Gene Location ------------------------------------------------------%>
<imp:wdkTable tblName="Genbank" isOpen="true"
               attribution=""/>


  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

<!-- Gene Deprecation --> 
<imp:wdkTable tblName="GeneDeprecation" isOpen="true" attribution=""/>

<!-- External Links --> 
<imp:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>

<!-- gene alias table -->
<imp:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>

<!-- Mercator / Mavid alignments -->
<c:set var="mercatorAlign">
<imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes=""/>
</c:set>

<imp:toggle isOpen="true"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>





<imp:pageDivider name="Annotation"/>
<%--- Notes --------------------------------------------------------%>

<imp:wdkTable tblName="Notes" isOpen="true" />

<%--- Comments -----------------------------------------------------%>
<%-- moved above 
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${sequence_id}" />
  <c:param name="flag" value="0" /> 
</c:url>
--%>
<b><a title="Click to go to the comments page" style="font-size:120%" href="${commentsUrl}">Add a comment on ${id}
<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a></b><br><br>


<c:catch var="e">
<imp:wdkTable tblName="UserComments"  isOpen="true"/>
</c:catch>
<c:if test="${e != null}">
 <table  width="100%" cellpadding="3">
      <tr><td><b>User Comments</b>
     <imp:embeddedError 
         msg="<font size='-1'><i>temporarily unavailable.</i></font>"
         e="${e}" 
     />
     </td></tr>
 </table>
</c:if>


<c:if test="${tree_source_id ne null}">
  <c:set var='treeLink'>
    ${tree_applet} against RefEuks database
  </c:set>
  <imp:panel 
      displayName="Phylogenetic Tree"
      content="${treeLink}" />
</c:if>
<br>

<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

  <c:set var="orthomclLink">
    <div align="center">
      <a href="<imp:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <imp:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL"
                 postscript="${orthomclLink}"/>

</c:if>

<%-- Microarray Data ------------------------------------------------------%>

<c:if test="${attrs['hasExpression'].value eq '1'}">
  <imp:pageDivider name="Expression"/>


<imp:expressionGraphs organism="${organismFull}"/>

<%-- SAGE tags ------------------------------------------------------%>

<imp:wdkTable tblName="SageTags" isOpen="FALSE"
               attribution="GiardiaSageTagArrayDesign,GiardiaSageTagFreqs"/>

</c:if>


<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<imp:pageDivider name="Protein Features"/>
   
    <c:set var="attribution">
    InterproscanData
    </c:set>

<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/giardiadbaa/?name=${wdkRecord.primaryKey}:1..${proteinLength};type=${ptracks};width=640;embed=1;genepage=1
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

    <imp:toggle 
        displayName="Predicted Protein Features"
        content="${proteinFeaturesImg}"
        isOpen="true"
        name="Protein Context"
        attribution="${attribution}"/>
      <!--${proteinFeaturesUrl} -->
   <br>
</c:if>

<%-- EC ------------------------------------------------------------%>

  <imp:wdkTable tblName="EcNumber" isOpen="true"
               attribution="enzymeDB,G.lamblia_contigs"/>

<%-- GO ------------------------------------------------------------%>
  <imp:wdkTable tblName="GoTerms" isOpen="true"
               attribution="GO,InterproscanData,G.lamblia_contigs"/>


<!-- Molecular weight -->

<c:set var="mw" value="${attrs['molecular_weight'].value}"/>
<c:set var="min_mw" value="${attrs['min_molecular_weight'].value}"/>
<c:set var="max_mw" value="${attrs['max_molecular_weight'].value}"/>

 <c:choose>
  <c:when test="${min_mw != null && max_mw != null && min_mw != max_mw}">
   <imp:panel 
      displayName="Molecular Weight"
      content="${min_mw} to ${max_mw} Da" />
    </c:when>
    <c:otherwise>
   <imp:panel 
      displayName="Molecular Weight"
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
  <imp:wdkTable tblName="Epitopes" isOpen="true"
                 attribution="IEDB_Epitopes"/>
</c:if>

<imp:wdkTable tblName="MassSpec" isOpen="true"
               attribution="DTASelect-filter_032108_Proteomics,Giardia_Proteomics_From_Tachezy"/>


<imp:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

<imp:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>




<imp:pageDivider name="Sequences"/>

<p>
<table border='0' width='100%'>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i

<p>

<%--- Sequence -----------------------------------------------------%>
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
<imp:toggle
    name="ProteinSequence"
    isOpen="true"
    displayName="${attr.displayName}"
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
    name="mRnaSequence"
    isOpen="false"
    displayName="${attr.displayName}"
    content="${seq}" />

<%------------------------------------------------------------------%>
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

<imp:toggle
    name="GenomicSequence"
    displayName="Genomic Sequence (introns shown in lower case)"
    isOpen="false"
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
    displayName="${attr.displayName}"
    content="${seq}" />
</c:if>
<%---- reference ---------------------------------------------------%> 
<%--
<c:set var="reference" value="${extdbname}" />
--%>

<hr>
<c:choose>
  <c:when test='${organismFull eq "Giardia Assemblage A isolate WB"}'>
     <c:set var="reference">
G. lamblia sequence, assembly, annotation from Mitchell Sogin (MBL).<br><b>Genomic minimalism in the early diverging intestinal parasite <i>Giardia lamblia</i>. </b> Hilary G. Morrison <i>et al</i> <a href="http://www.ncbi.nlm.nih.gov/pubmed/17901334">Science 28 September 2007, Volume 317, pp. 1921-1926.</a>
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Giardia Assemblage B isolate GS"}'>
     <c:set var="reference">
<b>Draft Genome Sequencing of <i>Giardia intestinalis</i> Assemblage B Isolate GS: Is Human Giardiasis Caused by Two Different Species?</b>  Franzen O, Jerlstrom-Hultqvist J, Castro E, Sherwood E, Ankarklev J, Reiner DS, Palm D, Andersson JO, Andersson B, Svard SG. <a href='http://www.ncbi.nlm.nih.gov/pubmed/19696920'>PLoS Pathog. 2009 Aug;5(8):e1000560</a>
     </c:set>
  </c:when>
  <c:when test='${organismFull eq "Giardia Assemblage E isolate P15"}'>
     <c:set var="reference">
Sequence and annotation of <i>Giardia</i> Assemblage E isolate P15 was provided by J. Jerlstrom-Hultqvist. O. Franzen, E.
Castro, J. Ankarklev, D. Palm, J. O. Andersson, S.G. Svard and B. Andersson (Karolinska Institutet, Stockholm, Sweden and Uppsala University, Uppsala, Sweden).  The genome sequence and annotation was provided to GiardiaDB prepublication and is expected to be published in a peer-reviewed journal as soon as possible. Permission should be obtained from the authors before publishing analyses of the sequence/open reading frames/genes on a chromosome or genome scale.
     </c:set>
  </c:when>
</c:choose>



<imp:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<%-- jsp:include page="/include/footer.html" --%>

<imp:footer/>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

<imp:pageLogger name="gene page" />
