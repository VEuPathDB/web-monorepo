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
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<site:header title="TriTrypDB : gene ${id} (${prd})"
             divisionName="Gene Record"
		refer="recordPage" 
             division="queries_tools" />
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
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
<site:header title="TriTrypDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
		refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools" />

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
<site:recordToolbox />

<c:set var="genedb_annot_link">
  ${attrs['GeneDB_updated'].value}
</c:set>

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

	<c:if test="${attrs['updated_annotation'].value != null}">
		<br>${genedb_annot_link}
	</c:if>
 <%-- Updated Product Name from GeneDB ------------------------------------------------------------%>
    <c:if test="${attrs['new_product_name'].value != null}">
       <br><br><span style="font-size:75%">${attrs['GeneDB_New_Product'].value}</span>
    </c:if>
</div>


<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>

<c:set var="content">
${organism}<br>
</c:set>

<%-- DNA CONTEXT ---------------------------------------------------%>


<c:choose>
  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
    <c:set var="tracks">
      Gene+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansLMexicanaMC+SyntenyGenesLMexicanaMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+BLASTX+UnifiedMassSpecPeptides
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania major strain Friedlin"}'>
    <c:set var="tracks">
      Gene+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansLMexicanaMC+SyntenyGenesLMexicanaMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+BLASTX+UnifiedMassSpecPeptides
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania infantum"}'>
    <c:set var="tracks">
      Gene+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLMexicanaMC+SyntenyGenesLMexicanaMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organismFull eq "Leishmania mexicana"}'>
    <c:set var="tracks">
      Gene+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+SyntenySpansLBraziliensisMC+SyntenyGenesLBraziliensisMC+SyntenySpansLInfantumMC+SyntenyGenesLInfantumMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${binomial eq "Trypanosoma cruzi" && sequenceDatabaseName eq nonEsmeraldoDatabaseName}'>
    <c:set var="tracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${binomial eq "Trypanosoma cruzi" && sequenceDatabaseName eq esmeraldoDatabaseName}'>
    <c:set var="tracks">
      Gene+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${binomial eq "Trypanosoma cruzi" && sequenceDatabaseName ne esmeraldoDatabaseName && sequenceDatabaseName ne nonEsmeraldoDatabaseName}'>
    <c:set var="tracks">
      Gene+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansTCruziPMC+SyntenyGenesTCruziPMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei Lister strain 427"}'>
    <c:set var="tracks">
      Gene+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBruceiGambienseMC+SyntenyGenesTBruceiGambienseMC+SyntenySpansTCongolenseMC+SyntenyGenesTCongolenseMC+SyntenySpansTVivaxMC+SyntenyGenesTVivaxMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
    <c:set var="tracks">
      Gene+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansTCongolenseMC+SyntenyGenesTCongolenseMC+SyntenySpansTBruceiGambienseMC+SyntenyGenesTBruceiGambienseMC+SyntenySpansTVivaxMC+SyntenyGenesTVivaxMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma congolense"}'>
    <c:set var="tracks">
      Gene+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansTBruceiGambienseMC+SyntenyGenesTBruceiGambienseMC+SyntenySpansTVivaxMC+SyntenyGenesTVivaxMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma vivax"}'>
    <c:set var="tracks">
      Gene+SyntenySpansTCongolenseMC+SyntenyGenesTCongolenseMC+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansTBruceiGambienseMC+SyntenyGenesTBruceiGambienseMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei gambiense"}'>
    <c:set var="tracks">
      Gene+SyntenySpansTBruceiMC+SyntenyGenesTBruceiMC+SyntenySpansTBrucei427MC+SyntenyGenesTBrucei427MC+SyntenySpansTCongolenseMC+SyntenyGenesTCongolenseMC+SyntenySpansTVivaxMC+SyntenyGenesTVivaxMC+SyntenySpansTCruziSMC+SyntenyGenesTCruziSMC+SyntenySpansLMajorMC+SyntenyGenesLMajorMC+UnifiedMassSpecPeptides+BLASTX
    </c:set>
  </c:when>

  <c:otherwise>
    <c:set var="tracks">
      Gene+BLASTX
    </c:set>
  </c:otherwise>
</c:choose>


<c:set var="attribution">
L.braziliensis_Annotation,L.infantum_Annotation,L.major_Annotation,T.brucei927_Annotation_chromosomes,T.bruceigambiense_Annotation,T.congolense_Annotation_chromosomes,T.cruziEsmeraldo_Annotation_Chromosomes,T.cruziNonEsmeraldo_chromosomes,T.cruziNonEsmeraldo_Annotation_Chromosomes,T.vivax_chromosomes,T.vivax_Annotation_chromosomes
</c:set>

<c:if test="${tracks ne ''}">
  <c:set var="baseTracks">
  Gene+UnifiedMassSpecPeptides+BLASTX
  </c:set>


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/tritrypdb/?name=${contig}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

    <center><div id="${gnCtxDivId}"></div></center>
    
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <wdk:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />

</c:if> <%-- {tracks ne ''} %-->

<%-- END DNA CONTEXT --------------------------------------------%>


<c:if test='${binomial eq "Trypanosoma cruzi"}'>

<wdk:wdkTable tblName="Genbank" isOpen="true"
               attribution="TcruziContigsAndAnnotations,TcruziEsmeraldo_likeChromosomeMap,TcruziNonEsmeraldo_likeChromosomeMap" />
</c:if>

<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<c:if test='${organismFull ne "Trypanosoma cruzi strain CL Brener"}'>

<!-- Mercator / Mavid alignments -->
<c:set var="mercatorAlign">
<site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes=""/>
</c:set>

<wdk:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>
</c:if>

<!-- gene alias table -->
<wdk:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>

<!-- External Links --> 
<wdk:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>

<site:pageDivider name="Annotation"/>

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

<wdk:wdkTable tblName="UserComments"  isOpen="true"/>


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

<%--- Notes --------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Notes provided by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>

<wdk:wdkTable tblName="Notes" isOpen="false"
               attribution="" postscript="${geneDbLink}"/>

<%-- Phenotype ------------------------------------------------------------%>
  <c:set var="geneDbLink">
    <div align="left">
    <br><small>Phenotypes curated from the literature by <a href="http://www.genedb.org/">Gene<b>DB</b></a>
</small></div>
  </c:set>
<wdk:wdkTable tblName="Phenotype" isOpen="true"
               attribution="" postscript="${geneDbLink}"/>


<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="<site:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>

  <wdk:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL_TrypDB"
                 postscript="${orthomclLink}"/>
</c:if>


<%-- EC ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<c:set var="attribution">
enzymeDB_RSRC
</c:set>

<wdk:wdkTable tblName="EcNumber" isOpen="true"
               attribution="${attribution}"/>

</c:if>

<%-- GO ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding')}">

<c:set var="attribution">
GO,InterproscanData
</c:set>

<wdk:wdkTable tblName="GoTerms" isOpen="true"
               attribution="${attribution}"/>

</c:if>

<wdk:wdkTable tblName="AnnotationChanges"/>


<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<site:pageDivider name="Protein"/>

 <c:choose>
  <c:when test='${binomial eq "Trypanosoma cruzi"}'>
    <c:set var="ptracks">
    TarletonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    Tcruzi_Proteomics_Amastigote,InterproscanData,Tcruzi_Proteomics_Amastigote
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
    <c:set var="ptracks">
    StuartMassSpecPeptides+FergusonMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Tbrucei_Proteomics_Procyclic_Form,Tbrucei_Ferguson_Phospho_Proteome_RSRC
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania infantum"}'>
    <c:set var="ptracks">
    LinfantumMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    InterproscanData,Linfantum_Proteomics_SDS_Amastigote,Linfantum_Proteomics_glycosylation
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania major strain Friedlin"}'>
    <c:set var="ptracks">
    SilvermanMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    Lmajor_Proteomics_Exosomes,InterproscanData,Linfantum_Proteomics_SDS_Amastigote
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
    <c:set var="ptracks">
    CuervoMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    Lbraziliensis_Proteomics_Promastigotes, InterproscanData,Linfantum_Proteomics_SDS_Amastigote
    </c:set>
	</c:when>

  <c:when test='${organismFull eq "Leishmania mexicana"}'>
    <c:set var="ptracks">
    AebischerMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+SecondaryStructure+BLASTP
    </c:set>
    <c:set var="attribution">
    Lmexicana_Proteomics_Aebischer_GelFree_RSRC,InterproscanData,Linfantum_Proteomics_SDS_Amastigote
    </c:set>
  </c:when> 

 </c:choose>
    
<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/tritrypdbaa/?name=${id}:1..${proteinLength};type=${ptracks};width=640;embed=1;genepage=1
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

</c:if> <%-- ptracks ne '' --%>
</c:if> <%-- so_term_name eq 'protein_coding --%>

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


<c:choose>
  <c:when test='${organismFull eq "Leishmania infantum"}'>
     <wdk:wdkTable tblName="MassSpec" isOpen="true" 
          attribution="Linfantum_Proteomics_glycosylation,Linfantum_Proteomics_SDS_Amastigote,Linfantum_Proteomics_OuelletteM"/>
  </c:when>

  <c:when test='${organismFull eq "Leishmania major strain Friedlin"}'>
     <wdk:wdkTable tblName="MassSpec" isOpen="true" attribution="Lmajor_Proteomics_Exosomes"/>
  </c:when>

  <c:when test='${organismFull eq "Leishmania braziliensis"}'>
     <wdk:wdkTable tblName="MassSpec" isOpen="true" attribution="Lbraziliensis_Proteomics_Promastigotes"/>
  </c:when>

  <c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
     <wdk:wdkTable tblName="MassSpec" isOpen="true" attribution="Tbrucei_Proteomics_Procyclic_Form"/>
  </c:when>

  <c:when test='${binomial eq "Trypanosoma cruzi"}'>
     <wdk:wdkTable tblName="MassSpec" isOpen="true" 
          attribution="Tcruzi_Proteomics_Amastigote,Tcruzi_Proteomics_Membrane_Protein,Tcruzi_Proteomics_Reservosomes_B1TU"/>
  </c:when>
</c:choose>

<c:set var="pdbLink">
  <br><a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
</c:set>

<wdk:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

<wdk:wdkTable tblName="Epitopes" isOpen="true" attribution="IEDB_Epitopes"/>


<br />

<%-- Phenotype section ------------------------------------------------------%>

<c:if test="${binomial eq 'Trypanosoma brucei'}">
<site:pageDivider name="Phenotype"/>


<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>
<c:set var="secName" value="Horn::TbRNAiRNASeq"/>
<c:set var="imgId" value="img${secName}"/>
<c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=tritryp&fmt=png&id=${id}"/>

<c:set var="isOpen" value="true"/>

<c:set var="coverageContent">


<table>
<tr>
 <td rowspan="2" class="centered">
   <c:choose>
    <c:when test="${!async}">
       <img id="${imgId}"  src="${imgSrc}">
    </c:when>
   <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
   </c:otherwise>
   </c:choose>
 </td>
 <td>
     <table>
          <tr>
             <td  class="top">
               <wdk:wdkTable tblName="RNAiPhenotypingCoverage" isOpen="false"/>
             </td>
          </tr>
          <tr> 
             <td><div class="small">
<b>Description</b><br>RNAi target sequencing coverage at different life cycle stages. <br><br>In this experiment RNAi plasmid library, containing randomly sheared genomic fragments was used to create an inducible library in bloodstream form T. brucei . After transfection, the library was grown under non-inducing and inducing conditions and genomic DNA was isolated from surviving populations.<br><br>Cells carrying RNAi target fragments that negatively impact fitness through dsRNA expression and RNAi-mediated ablation are relatively depleted as the population expands and these changes are reported by the depth of sequence coverage relative to the uninduced control (No Tet).<br><br><b>x-axis</b><br>Stage/Sample<br><br><b>y-axis</b><br>Coverage - log 2 (RPKM)<br> </div>
            </td>
         </tr>
     </table>
</td>
</tr></table>


</c:set>

<c:set var="noData" value="false"/>

<wdk:toggle name="${secName}" isOpen="${isOpen}"
       content="${coverageContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="RNAi Target Sequencing - Induced vs Uninduced"
       attribution="Tbrucei_RNAiSeq_Horn_RSRC"/>
  

</c:if>  <%-- if Tb , add phenotype section  --%>

<%-- Expression Graphs ------------------------------------------------------%>

<c:if test="${binomial eq 'Leishmania infantum' || binomial eq 'Trypanosoma brucei' || binomial eq 'Trypanosoma cruzi' || binomial eq 'Leishmania major' }">
<site:pageDivider name="Expression"/>
  <site:expressionGraphs species="${binomial}" model="tritryp"/>
</c:if>

<%---- Splice Sites table ---------------------------------------------%>
<c:if test="${binomial eq 'Leishmania infantum' || binomial eq 'Trypanosoma brucei' || binomial eq 'Leishmania major' }">
     <wdk:wdkTable tblName="SpliceSites" isOpen="false" attribution=""/>
</c:if>

<%---- Poly A Sites table ---------------------------------------------%>
<c:if test="${binomial eq 'Leishmania major' }">
     <wdk:wdkTable tblName="PolyASites" isOpen="false" attribution=""/>
</c:if>


<%-- SAGE Tag table ------------------------------------------------------%>
<c:if test="${binomial eq 'Trypanosoma brucei' }">
<wdk:wdkTable tblName="SageTags" attribution="TrypSageTagFreqs"/>
</c:if>

<%-- Sequence Data ------------------------------------------------------%>

<site:pageDivider name="Sequence"/>

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
<wdk:toggle name="proteinSequence" isOpen="true"
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
<wdk:toggle name="transcriptSequence" isOpen="false"
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

<wdk:toggle name="genomicSequence" isOpen="false"
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
<wdk:toggle name="codingSequence" isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />

</c:if>
<%------------------------------------------------------------------%> 


<c:choose>

<c:when test='${binomial eq "Trypanosoma cruzi"}'>
  <c:set var="reference">
      Sequence data for <i>Trypanosoma cruzi</i> strain CL Brener contigs were downloaded from Genbank (sequence and annotated features).<br>  Sequencing of <i>T. cruzi</i> was conducted by the <i>Trypanosoma cruzi</i> sequencing consortium (<a href="http://www.tigr.org/tdb/e2k1/tca1/">TIGR</a>, <a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a> and <a href="http://ki.se/ki/jsp/polopoly.jsp?d=130&l=en">Karolinska Institute</a>.
<br/>Mapping of gene coordinates from contigs to chromosomes for T. cruzi strain CL Brener chromosomes, generated by Rick Tarleton lab (UGA).
  </c:set>
</c:when>
<c:when test='${organismFull eq "Leishmania infantum"}'>
  <c:set var="reference">
   Sequence data for <i>Leishmania infantum</i> clone JPCM5 (MCAN/ES/98/LLM-877) were downloaded from <a href="http://www.genedb.org/genedb/linfantum/">GeneDB</a> (sequence and annotated features).<br> 
Sequencing of <i>L. infantum</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_infantum/">The Sanger Institute pathogen sequencing unit</a>. 
  </c:set>
</c:when>
<c:when test='${organismFull eq "Leishmania major strain Friedlin"}'>
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
<c:when test='${organismFull eq "Trypanosoma brucei gambiense"}'>
  <c:set var="reference">
  Chromosome sequences and annotations for <i>Trypanosoma brucei gambiense</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute. Please visit <a href="http://www.genedb.org/Homepage/Tbruceigambiense">GeneDB</a> for project details and data release policies.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Trypanosoma brucei TREU927"}'>
  <c:set var="reference">
   Sequence data for <i>Trypanosome brucei</i> strain TREU (Trypanosomiasis Research Edinburgh University) 927/4 were downloaded from <a href="http://www.genedb.org/genedb/tryp/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>T. brucei</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/T_brucei/">The Sanger Institute pathogen sequencing unit</a> and <a href="http://www.tigr.org/tdb/e2k1/tba1/">TIGR</a>.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Trypanosoma brucei Lister strain 427"}'>
  <c:set var="reference">
  <i>Trypanosoma brucei</i> strain Lister 427 genome sequence and assembly was provided prepublication by Dr. George Cross. For additional information please see information in the <a href="showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Tbrucei427_chromosomes_RSRC&title=Query#Tbrucei427_chromosomes_RSRC">data sources</a> page.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Trypanosoma congolense"}'>
  <c:set var="reference">
Chromosome and unassigned contig sequences and annotations for <i>Trypanosoma congolense</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute. Please visit <a href="http://www.genedb.org/Homepage/Tcongolense">GeneDB</a> for project details and data release policies.
  </c:set>
</c:when>
<c:when test='${organismFull eq "Trypanosoma vivax"}'>
  <c:set var="reference">
   Chromosome sequences for <i>T.vivax</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute. Please visit <a href="http://www.genedb.org/Homepage/Tvivax">GeneDB</a> for project details and data release policies.
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

<site:pageLogger name="gene page" />
