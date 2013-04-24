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
<c:set value="${wdkRecord.recordClass.displayName}" var="recordName"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<imp:pageFrame title="TriTrypDB : gene ${id} (${prd})"
             divisionName="Gene Record"
		         refer="recordPage" 
             division="queries_tools">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
  </imp:pageFrame>
</c:when>
<c:otherwise>
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

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>


<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>


<c:set var="esmeraldoDatabaseName" value="TcruziEsmeraldoLike_chromosomes_RSRC"/>
<c:set var="nonEsmeraldoDatabaseName" value="TcruziNonEsmeraldoLike_genome_RSRC"/>


<%-- display page header with recordClass type in banner --%>
<imp:pageFrame title="TriTrypDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
		         refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools">

<br>
<%--#############################################################--%>


<c:choose>
  <c:when test='${binomial eq "Trypanosoma cruzi" && sequenceDatabaseName ne esmeraldoDatabaseName && sequenceDatabaseName ne nonEsmeraldoDatabaseName}'>
    <c:set var="append" value=" - (this contig could not be assigned to Esmeraldo or Non-Esmeraldo)" />
  </c:when>
  <c:otherwise>
    <c:set var="append" value="" />
  </c:otherwise>
</c:choose>


<%-- this block moves here so we can set a link to add a comment on the apge title --%>
<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${externalDbName.value}" />
  <c:param name="externalDbVersion" value="${externalDbVersion.value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${attrs['sequence_id'].value}" /> 
  <c:param name="strand" value="${strand}" />
  <c:param name="flag" value="0" /> 
  <c:param name="bulk" value="0" /> 
</c:url>



<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<c:set var="genedb_annot_link">
  ${attrs['GeneDB_updated'].value}
</c:set>

<div class="h2center" style="font-size:150%">
${id}
<c:if test="${attrs['genedb_new_id'].value != null}">
 / ${attrs['GeneDBNewLinkTemp'].value}
</c:if>
<br><span style="font-size:70%">${prd}</span><br/>

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

	<c:if test="${attrs['updated_annotation'].value != null}">
		<br>${genedb_annot_link}
	</c:if >
 <%-- Updated Product Name from GeneDB ------------------------------------------------------------%>
    <c:if test="${attrs['new_product_name'].value != null}">


       <br><br><span style="font-size:75%">${attrs['GeneDB_New_Product'].value}</span>
    </c:if>
</div>


<imp:panel displayName="Community Expert Annotation" content="" />

<c:catch var="e">
  <imp:dataTable tblName="CommunityExpComments"/>
</c:catch>
<c:if test="${e != null}">
  <table  width="100%" cellpadding="3">
    <tr><td><b>User Comments</b>
      <imp:embeddedError msg="<font size='-1'><i>temporarily unavailable.</i></font>" e="${e}" />
    </td></tr>
  </table>
</c:if>

<br/><br/>

<%-- OVERVIEW ---------------%>

<c:set var="attr" value="${attrs['overview']}" />
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}"
    attribute="${attr.name}"/>
<br>

<c:set var="content">
${organism}<br>
</c:set>

<c:set var="dna_gtracks" value="${attrs['dna_gtracks'].value}"/>

<c:set var="protein_gtracks" value="${attrs['protein_gtracks'].value}"/>


<%-- DNA CONTEXT ---------------------------------------------------%>


<c:if test="${dna_gtracks ne ''}">

  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${dna_gtracks};width=640;embed=1;h_feat=${fn:toLowerCase(id)}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};h_feat=${fn:toLowerCase(id)}@yellow
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
    attribution=""
  />

</c:if> <%-- {tracks ne ''} %-->

<%-- END DNA CONTEXT --------------------------------------------%>


<c:if test='${binomial eq "Trypanosoma cruzi"}'>

<imp:wdkTable tblName="Genbank" isOpen="true"
               attribution="" />
</c:if>

<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<c:if test='${organismFull ne "Trypanosoma cruzi strain CL Brener"}'>

<!-- Mercator / Mavid alignments -->
<c:set var="mercatorAlign">
<imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes=""/>
</c:set>

<imp:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>
</c:if>

<!-- snps between strains -->
<%-- TODO: NEED SNP OVERVIEW HERE --%>
<c:set var="htsSNPs" value="${attrs['snpoverview']}" />
<imp:panel attribute="${htsSNPs.name}"
     displayName="${htsSNPs.displayName}"
     content="${htsSNPs.value}${append}" />
<br> 
<imp:snpTable tblName="SNPsAlignment" isOpen="false" /> 

<!-- gene alias table -->
<imp:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>

<!-- External Links --> 
<imp:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>

<imp:pageDivider name="Annotation"/>

<%--- Comments -----------------------------------------------------%>
<a name="user-comment"/>

<%-- moved above
<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${externalDbName.value}" />
  <c:param name="externalDbVersion" value="${externalDbVersion.value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${attrs['sequence_id'].value}" /> 
  <c:param name="strand" value="${strand}" />
  <c:param name="flag" value="0" /> 
  <c:param name="bulk" value="0" /> 
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

<%--- Notes --------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Notes provided by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>

<imp:wdkTable tblName="Notes" isOpen="false"
               attribution="" postscript="${geneDbLink}"/>

<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">
  <c:set var="orthomclLink">
    <div align="center">
      <a target="_blank" href="<imp:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>

  <imp:wdkTable tblName="Orthologs" isOpen="true" attribution=""
                 postscript="${orthomclLink}"/>
</c:if>


<%-- EC ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<imp:wdkTable tblName="EcNumber" isOpen="true"
               attribution=""/>

</c:if>

<%-- GO ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<imp:wdkTable tblName="GoTerms" isOpen="true"
               attribution=""/>

</c:if>

<%--
<imp:wdkTable tblName="AnnotationChanges"/>
--%>


<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<imp:pageDivider name="Protein"/>

<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/tritrypdbaa/?name=${id}:1..${proteinLength};l=${protein_gtracks};width=640;embed=1;genepage=1
</c:set>
<c:if test="${protein_gtracks ne ''}">
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

</c:if> <%-- protein_gtracks ne '' --%>
</c:if> <%-- so_term_name eq 'protein_coding --%>

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


<c:choose>
  <c:when test='${organismFull eq "Leishmania infantum"}'>
     <imp:wdkTable tblName="MassSpec" isOpen="true" 
          attribution=""/>
  </c:when>

  <c:when test='${organismFull eq "Leishmania major strain Friedlin"}'>
     <imp:wdkTable tblName="MassSpec" isOpen="true" attribution=""/>
  </c:when>

  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
     <imp:wdkTable tblName="MassSpec" isOpen="true" attribution=""/>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
     <imp:wdkTable tblName="MassSpec" isOpen="true" attribution=""/>

     <imp:wdkTable tblName="MassSpecMod" isOpen="true" attribution=""/> 
  </c:when>

  <c:when test='${binomial eq "Trypanosoma cruzi"}'>
     <imp:wdkTable tblName="MassSpec" isOpen="true" 
          attribution=""/>
  </c:when>
</c:choose>

<imp:wdkTable tblName="PdbSimilarities" postscript="${attrs['pdb_blast_form'].value}" attribution=""/>

<imp:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>



<imp:wdkTable tblName="Epitopes" isOpen="true" attribution=""/>


<br />

<%-- Phenotype section ------------------------------------------------------%>


<c:if test="${attrs['hasPhenotype'].value eq '1'}">
<imp:pageDivider name="Phenotype"/>

<%-- Phenotype ------------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Phenotypes curated from the literature by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>

<imp:wdkTable tblName="Phenotype" isOpen="true"
               attribution="" postscript="${geneDbLink}"/>


<imp:profileGraphs species="${binomial}" tableName="PhenotypeGraphs"/>

</c:if>

<%-- Expression Graphs ------------------------------------------------------%>

<c:if test="${attrs['hasExpression'].value eq '1'}">
<imp:pageDivider name="Expression"/>

  <imp:expressionGraphs species="${binomial}"/>


<%---- Splice Sites table ---------------------------------------------%>
<c:if test="${binomial eq 'Leishmania infantum'}">
     <imp:wdkTable tblName="SpliceSites" isOpen="false" attribution=""/>
</c:if>
<c:if test="${binomial eq 'Leishmania major'}">
     <imp:wdkTable tblName="SpliceSites" isOpen="false" attribution=""/>
</c:if>
<c:if test="${binomial eq 'Trypanosoma brucei'}">
     <imp:wdkTable tblName="SpliceSites" isOpen="false" attribution=""/>
</c:if>
<%--- Not ready for build 14
<c:if test="${binomial eq 'Trypanosoma cruzi'}">
     <imp:wdkTable tblName="SpliceSites" isOpen="false" attribution=""/>
</c:if>
----%>

<%---- Poly A Sites table ---------------------------------------------%>
<c:if test="${binomial eq 'Leishmania major' }">
     <imp:wdkTable tblName="PolyASites" isOpen="false" attribution=""/>
</c:if>
<c:if test="${binomial eq 'Trypanosoma brucei'}">
     <imp:wdkTable tblName="PolyASites" isOpen="false" attribution=""/>
</c:if>

<%-- SAGE Tag table ------------------------------------------------------%>
<c:if test="${binomial eq 'Trypanosoma brucei' }">
<imp:wdkTable tblName="SageTags" attribution=""/>
</c:if>


</c:if>

<%-- Sequence Data ------------------------------------------------------%>

<imp:pageDivider name="Sequence"/>

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
<imp:toggle name="proteinSequence" isOpen="true"
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
<imp:toggle name="transcriptSequence" isOpen="false"
    displayName="${attr.displayName}"
    content="${seq}" />


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

<imp:toggle name="genomicSequence" isOpen="false"
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
<imp:toggle name="codingSequence" isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />

</c:if>

<!-- attribution -->

<hr>

<c:set value="${wdkRecord.tables['GenomeSequencingAndAnnotationAttribution']}" var="referenceTable"/>

<c:set value="Error:  No Attribution Available for This Genome!!" var="reference"/>
<c:forEach var="row" items="${referenceTable}">
    <c:set var="reference" value="${row['description'].value}"/>
</c:forEach>


<imp:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />

<br>
<%------------------------------------------------------------------%>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>
</imp:pageFrame>
</c:otherwise>
</c:choose>

<imp:pageLogger name="gene page" />
