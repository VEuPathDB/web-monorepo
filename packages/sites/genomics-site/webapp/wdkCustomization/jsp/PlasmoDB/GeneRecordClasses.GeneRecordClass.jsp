<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
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

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<imp:pageFrame title="${wdkModel.displayName} : gene ${id}"
             divisionName="Gene Record"
		         refer="recordPage" 
             division="queries_tools">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</imp:pageFrame>
</c:when>
<c:otherwise>



<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>
<c:set var="binomial" value="${attrs['genus_species'].value}"/>
<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>
<c:set var="genedb_organism" value="${attrs['genedb_organism'].value}"/>
<%-- c:set var="isCodingGene" value="${so_term_name eq 'protein_coding_gene' || so_term_name eq 'pseudogene'}"/ --%>
<c:set var="isCodingGene" value="${so_term_name eq 'protein_coding'}"/>
<c:set var="async" value="${param.sync != '1'}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="sequence_id" value="${attrs['sequence_id'].value}"/>
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<c:set value="${wdkRecord.tables['CategoryLink']}" var="ctgLinks"/>

<c:forEach var="row" items="${ctgLinks}">
  <c:set var="ctgLink" value="${row['category_link'].value}"/>
  <c:set var="category" value="${fn:substringBefore(ctgLink, ':')}"/>
  <c:set var="num" value="${fn:substringAfter(ctgLink, ':')}"/>
  <!-- c:set var="cmtLink" value="<a href='#user-comment'>[Link to User Comment]</a>"/ -->
  <c:set var="cmtLink" value=""/>

  <c:choose>
    <c:when test="${category eq 'name/product' || category eq 'function'}">
      <c:set var="has_namefun_comment" value="${cmtLink}"/>
    </c:when>
    <c:when test="${category eq 'phenotype'}">
      <c:set var="has_phenotype_comment" value="${cmtLink}"/>
    </c:when>
    <c:when test="${category eq 'sequence'}">
      <c:set var="has_sequence_comment" value="${cmtLink}"/>
    </c:when>
    <c:when test="${category eq 'gene model'}">
      <c:set var="has_model_comment" value="${cmtLink}"/>
    </c:when>
    <c:when test="${category eq 'expression'}">
      <c:set var="has_expression_comment" value="${cmtLink}"/>
    </c:when>
  </c:choose>
</c:forEach> 

<c:choose>
  <c:when test="${fn:contains(organism,'vivax')}">
    <c:set var="species" value="vivax"/>
  </c:when>
  <c:when test="${fn:contains(organism,'yoelii 17XNL')}">
    <c:set var="species" value="yoelii"/>
  </c:when>
  <c:when test="${fn:contains(organism,'yoelii YM')}">
    <c:set var="species" value="yoeliiYM"/>
  </c:when>
  <c:when test="${fn:contains(organism,'falciparum 3D7')}">
    <c:set var="species" value="falciparum3D7"/>
  </c:when>
  <c:when test="${fn:contains(organism,'falciparum IT')}">
    <c:set var="species" value="falciparumIT"/>
  </c:when>
  <c:when test="${fn:contains(organism,'berghei')}">
    <c:set var="species" value="berghei"/>
  </c:when>
  <c:when test="${fn:contains(organism,'chabaudi')}">
    <c:set var="species" value="chabaudi"/>
  </c:when>
  <c:when test="${fn:contains(organism,'knowlesi')}">
    <c:set var="species" value="knowlesi"/>
  </c:when>
  <c:when test="${fn:contains(organism,'cynomolgi')}">
    <c:set var="species" value="cynomolgi"/>
  </c:when>
  <c:otherwise>
    <b>ERROR: setting species for organism "${organism}"</b>
  </c:otherwise>
</c:choose>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<imp:pageFrame title="${wdkModel.displayName} : gene ${id} (${prd})"
             divisionName="Gene Record"
		         refer="recordPage" 
             division="queries_tools"
             summary="${overview.value} (${length.value} bp)">

<a name="top"></a>

<table width="100%">
<tr>
  <td align="center" style="padding:6px"><a href="#Annotation">Annotation</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  <c:if test="${isCodingGene}">
  <td align="center"><a href="#Protein">Protein</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  </c:if>

  <c:if test="${species eq 'falciparum3D7' || species eq 'berghei' || species eq 'yoelii' || species eq 'vivax'}">
  <td align="center"><a href="#Expression">Expression</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  </c:if>

  <td align="center"><a href="#Sequence">Sequence</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

<%-- These links have become obsolete as these serivces have been discontinued --%>
<%-- <c:if test="${species eq 'falciparum'}">
    <td align="center"><a href="http://v4-4.plasmodb.org/plasmodb/servlet/sv?page=gene&source_id=${id}">${id} in PlasmoDB 4.4</a>
       <img src="<c:url value='/images/arrow.gif'/>">
    </td>
  </c:if>
  <c:if test="${species eq 'yoelii'}">
    <td align="center"><a href="http://v4-4.plasmodb.org/plasmodb/servlet/sv?page=pyGene&source_id=${id}">${id} in PlasmoDB 4.4</a>
       <img src="<c:url value='/images/arrow.gif'/>">
    </td>
  </c:if> --%>

</tr>
</table>

<hr>

<%-- this block moves here so we can set a link to add a comment on the page title --%>
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
<br><span style="font-size:70%">${prd} </span><br/> 

<c:if test="${attrs['old_ids'].value != null && attrs['old_ids'].value ne id }">
  <br><span style="font-size:70%">${attrs['OldIds'].value}</span><br>
</c:if>


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


    <c:if test="${attrs['updated_annotation'].value != null}">
       <br>${genedb_annot_link}
    </c:if>
 <%-- Updated Product Name from GeneDB ------------------------------------------------------------%>
    <c:if test="${attrs['new_product_name'].value != null}">
       <br><br><span style="font-size:75%">${attrs['GeneDB_New_Product'].value}</span>
    </c:if>


</div>


<%--- COMMUNITY EXPERT ANNOTATION -----------%>

<%--
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
--%>

<%-- OVERVIEW ------------%>

<c:set var="attr" value="${attrs['overview']}" />
<imp:panel attribute="${attr.name}"
    displayName="${attr.displayName} ${has_namefun_comment}"
    content="${attr.value}${append}" />
<br>


<%-- DNA CONTEXT ------------%>

<c:set var="gtracks" value="${attrs['gtracks'].value}"/>

<c:set var="attribution">
P.${species}.contigs,P.${species}_contigsGB,P.${species}_mitochondrial,P.${species}_chromosomes,P.${species}_wholeGenomeShotgunSequence,P.${species}_Annotation,${species}_falciparum_synteny
</c:set>

<c:if test="${gtracks ne ''}">


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${gtracks};width=640;embed=1;h_feat=${fn:toLowerCase(id)}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
 <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${fn:toLowerCase(id)}@yellow
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


<%-- END DNA CONTEXT --------------------------------------------%>


<%-- mouseOver does not function properly
     if dnaContext and proteinFeatures imageMap are dynamically set on the page 
 <c:set var="okDOMInnerHtml" value="${ fn:contains(header['User-Agent'], 'Firefox') ||
                                       fn:contains(header['User-Agent'], 'Netscape') }"/>
--%>



<c:if test="${species eq 'falciparum3D7_' || species eq 'vivax_'}">
    <!-- imp:wdkTable tblName="SNPs" isOpen="false"
               attribution="" -->
Disabled for Redmine 10225 
</c:if>


<%-- eQTL regions --%>
<c:if test="${species eq 'falciparum3D7'}">
<imp:wdkTable tblName="Plasmo_eQTL_Table" isOpen="true"
               attribution="" />

  <c:set var="queryURL">
        showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_HaploGrpSimilarity&value%28lod_score%29=1.5&value%28percentage_sim_haploblck%29=25&value%28pf_gene_id%29=${id}&weight=10
  </c:set>
  <a id="assocQueryLink" href="${queryURL}"><font size='-2'>Other genes that have similar associations based on eQTL experiments</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
</c:if>

<%-- version 8.2 genes --%>
<imp:wdkTable tblName="PreviousReleaseGenes" isOpen="true"
               attribution="" />

<c:if test="${externalDbName.value eq 'Pfalciparum_chromosomes_RSRC'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

</c:if>



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


<imp:pageDivider name="Annotation"/>

<a name="user-comment"/>

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




<c:if test="${species eq 'falciparum3D7'}">
  <div align="center">
      <i>The ${binomial} genome is not finished.  Please consult Plasmodium orthologs to support your conclusions.</i><br><br>
  </div>
</c:if> 

<br/>
<!-- test on plasmo phenotype user comment form -->

<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>
<c:url var="phenotypeCommentsUrl" value="addPhenotype.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="phenotype"/>
  <c:param name="externalDbName" value="${externalDbName.value}" />
  <c:param name="externalDbVersion" value="${externalDbVersion.value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${attrs['sequence_id'].value}" /> 
  <c:param name="strand" value="${strand}" />
  <c:param name="flag" value="0" /> 
  <c:param name="bulk" value="0" /> 
</c:url>

<!--
<b><a href="${phenotypeCommentsUrl}">Add a phenotype comment on ${id}</a></b><br><br>
-->

<%--
<c:catch var="e">

<imp:wdkTable tblName="PhenotypeComments"  isOpen="true"/> 

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
--%>

<!-- External Links --> 
<%-- "This if clause is redundant as the new (re) annotation has become the official annotation"
<c:if test="${species ne 'falciparum' || (species eq 'falciparum' && attrs['annotation_status'].value ne 'new' &&attrs['annotation_status'].value ne 'new_organellar')}">
--%>

<imp:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>

<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
    <div align="center">
      <a target="_blank" href="<imp:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <imp:wdkTable tblName="Orthologs" isOpen="true" attribution=""
                 postscript="${orthomclLink}"/>
</c:if>
<%--</c:if>--%>

<c:if test="${species eq 'falciparum3D7'}">
  <a name="ecNumber"></a>
  <c:if test="${isCodingGene}">
    <imp:wdkTable tblName="EcNumber" isOpen="false"
                   attribution=""/>
  </c:if>
</c:if>

<c:if test="${isCodingGene}">
  <a name="goTerm"></a>
  <imp:wdkTable tblName="GoTerms"
                 attribution=""/>
</c:if>


<%-- "This if clause is redundant as the new (re) annotation has become the official annotation"
<c:if test="${species ne 'falciparum' || (species eq 'falciparum' && attrs['annotation_status'].value ne 'new' &&attrs['annotation_status'].value ne 'new_organellar')}">
--%>


<!-- gene alias table -->
<imp:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>


  <imp:wdkTable tblName="Notes" attribution=""/>


<c:if test="${species eq 'falciparum3D7' || species eq 'berghei' || species eq 'yoelii'}">

<%-- Need to comment out Phenotype for build 11 --%>
<imp:wdkTable tblName="RodMalPhenotype" isOpen="false"  attribution=""/>
  
  <!-- publications -->

<%--  OUT OF DATE
  <a name="publications">
  <table width="100%" cellpadding="3">
    <tr><td>
      <b>Publications</b>
      <c:set var="publications" value="${attrs['Publications']}"/>
      <a href="${publications.url}">${publications}</a>
    </td></tr>
  </table>
--%>

  <c:if test="${isCodingGene}">
    <imp:wdkTable tblName="MetabolicPathways" attribution=""/>
  </c:if>

<c:set var="plasmocyc" value="${attrs['PlasmoCyc']}"/>  
<c:set var="plasmocycurl" value="${plasmocyc.url}"/>  

  <c:if test="${species eq 'berghei'}">
    <c:set var="plasmocycurl" value="http://apicyc.apidb.org/"/>  
  </c:if>

<imp:panel 
    displayName="PlasmoCyc <a href='${plasmocycurl}'>View</a>"
    content="" />

</c:if>

<imp:wdkTable tblName="Mr4Reagents" attribution=""/>

<%--
<imp:wdkTable tblName="AnnotationChanges"/>
--%>


<c:if test="${isCodingGene}">
  <imp:pageDivider name="Protein"/>

  <c:if test="${species eq 'falciparum3D7'}">
     <c:set var="ptracks"> 
       BoothroydPhosphoMassSpecPeptides+TobinPhosphoMassSpecPeptides+FlorensMassSpecPeptides+KhanMassSpecPeptides+LasonderMassSpecPeptides+LasonderMassSpecPeptidesBloodStage+PfClinicalMassSpecPeptides+PfBowyerMassSpecPeptides+VossMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
     </c:set>
  </c:if>
  <c:if test="${species eq 'berghei'}">
      <c:set var="ptracks"> 
        WatersMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
     </c:set>
  </c:if>
  <c:if test="${species eq 'yoelii'}">
      <c:set var="ptracks">
       LiverStageMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
    </c:set>
  </c:if>
  <c:if test="${species eq 'vivax'}">
      <c:set var="ptracks">
       PvClinicalMassSpecPeptides+CuiMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
    </c:set>
  </c:if>
  <c:if test="${species eq 'chabaudi' || species eq 'cynomolgi' || species eq 'falciparumIT' || species eq 'knowlesi' || species eq 'yoeliiYM'}">
      <c:set var="ptracks"> 
        InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
     </c:set>
  </c:if>


  <c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
  <c:set var="proteinFeaturesUrl">
   http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/plasmodbaa/?name=${id}:1..${proteinLength};type=${ptracks};hmap=pbrowse;width=640;embed=1;genepage=1
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
            e="${e}" />
    </c:if> 
    </center></noindex>
    </c:set>
    <imp:toggle name="proteinContext"  displayName="Protein Features" 
                content="${proteinFeaturesImg}" 
                attribution=""/>

    </c:if> <%-- ptracks ne '' --%>


  <c:if test="${species eq 'falciparum3D7'}">
  <imp:wdkTable tblName="Y2hInteractions" isOpen="true"
                 attribution=""/>
  </c:if>

<%--  <c:set var="pdbId" value="${attrs['pdb_id'].value}"/>
  <c:if test="${!empty pdbId}">
    <a href = "http://thesgc.com/SGC-WebPages/StructureDescription/${pdbId}.php"/>3D Crystal Structure of ${id}
  </c:if>
--%>

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

  <c:if test="${species eq 'falciparum3D7'}">
      <imp:wdkTable tblName="MassSpec" isOpen="true"
                    attribution=""/>
  </c:if>

  <c:if test="${species eq 'falciparum3D7'}">
      <imp:wdkTable tblName="MassSpecMod" isOpen="true"
          attribution=""/>
  </c:if> 

   <c:if test="${species eq 'vivax'}">
      <imp:wdkTable tblName="MassSpec" isOpen="true"
                    attribution=""/>
  </c:if>

  <c:if test="${species eq 'vivax'}">
      <imp:wdkTable tblName="MassSpecMod" isOpen="true"
          attribution=""/>
  </c:if> 

   <c:if test="${species eq 'berghei'}">
      <imp:wdkTable tblName="MassSpec" isOpen="true"
                    attribution=""/>
  </c:if>

  <c:if test="${species eq 'berghei'}">
      <imp:wdkTable tblName="MassSpecMod" isOpen="true"
          attribution=""/>
  </c:if> 

   <c:if test="${species eq 'yoelii'}">
      <imp:wdkTable tblName="MassSpec" isOpen="true"
                    attribution=""/>
  </c:if>

  <c:if test="${species eq 'yoelii'}">
      <imp:wdkTable tblName="MassSpecMod" isOpen="true"
          attribution=""/>
  </c:if> 

  <c:if test="${binomial eq 'Plasmodium berghei'}">
    <imp:wdkTable tblName="ProteinExpression" attribution=""/>
  </c:if>

  <imp:wdkTable tblName="ProteinDatabase"/>

  <c:set var="pdbLink">
    <a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
  </c:set>

<imp:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution=""/>

<imp:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>

  <c:if test="${species eq 'falciparum3D7'}">
    <imp:wdkTable tblName="3dPreds" attribution=""/>
  </c:if>

  <imp:wdkTable tblName="Epitopes"/>


</c:if> <%-- end if isCodingGene --%>


<c:if test="${attrs['hasExpression'].value eq '1'}">
  <imp:pageDivider name="Expression"/>

  <imp:expressionGraphs organism="${organismFull}" species="${binomial}"/>


<c:if test="${species eq 'falciparum3D7'}">
  <imp:wdkTable tblName="SageTags" attribution=""/>
</c:if>
</c:if>

 <%-- ------------------------------------------------------------------ --%>


<imp:pageDivider name="Sequence"/>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${attrs['protein_sequence'].value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<imp:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
             content="${proteinSequenceContent}" isOpen="false"/>

<%-- Workshop annotations have become the offical annotation as of release V6.0
  <!-- workshop protein sequence -->
  <c:if test="${species eq 'falciparum' && attrs['new_protein'].value == 1}">

  <c:set var="workshopProteinSequence" value="${attrs['workshop_protein_sequence']}"/>
  <c:set var="workshopProteinSequenceContent">
    <pre><w:wrap size="60">${attrs['workshop_protein_sequence'].value}</w:wrap></pre>
    <font size="-1">Sequence Length: ${fn:length(workshopProteinSequence.value)} aa</font><br/>
  </c:set>

  <table width="100%" bgcolor=#98FB98>
    <tr><td>
      <imp:toggle name="workshopProteinSequence" displayName="${workshopProteinSequence.displayName}"
               content="${workshopProteinSequenceContent}" isOpen="false"/>
    </td></tr>--%>
<%--  </c:if>--%>
</c:if>

<!-- transcript sequence -->
<c:set var="transcriptSequence" value="${attrs['transcript_sequence']}"/>
<c:set var="transcriptSequenceContent">
  <pre><w:wrap size="60">${transcriptSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(transcriptSequence.value)} bp</font><br/>
</c:set>
<imp:toggle name="transcriptSequence"
             displayName="${transcriptSequence.displayName}"
             content="${transcriptSequenceContent}" isOpen="false"/>


<%-- Workshop annotations have become the offical annotation as of release V6.0

<!-- workshop transcript sequence -->
<c:if test="${species eq 'falciparum' && attrs['new_protein'].value == 1}">
  <c:set var="workshopTranscriptSequence" value="${attrs['workshop_transcript_sequence']}"/>
  <c:set var="workshopTranscriptSequenceContent">
    <pre><w:wrap size="60">${workshopTranscriptSequence.value}</w:wrap></pre>
    <font size="-1">Sequence Length: ${fn:length(workshopTranscriptSequence.value)} bp</font><br/>
  </c:set>
    <table width="100%" bgcolor=#98FB98>
      <tr><td>
      <imp:toggle name="workshopTranscriptSequence"
             displayName="${workshopTranscriptSequence.displayName}"
             content="${workshopTranscriptSequenceContent}" isOpen="false"/>
    </td></tr>
  </table>--%>
<%--</c:if> --%>

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

<imp:toggle name="genomicSequence" isOpen="false"
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />


<c:if test="${isCodingGene}">
<!-- CDS -->
<c:set var="cds" value="${attrs['cds']}"/>
<c:set var="cdsContent">
  <pre><w:wrap size="60">${cds.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(cds.value)} bp</font><br/>
</c:set>
<imp:toggle name="cds" displayName="${cds.displayName}"
             content="${cdsContent}" isOpen="false"/>


<%-- Workshop annotations have become the offical annotation as of release V6.0
  <!-- workshop coding sequence -->
  <c:if test="${species eq 'falciparum' && attrs['new_protein'].value == 1}">
    <c:set var="workshopCds" value="${attrs['workshop_cds']}"/>
    <c:set var="workshopCdsContent">
      <pre><w:wrap size="60">${workshopCds.value}</w:wrap></pre>
      <font size="-1">Sequence Length: ${fn:length(workshopCds.value)} bp</font><br/>
    </c:set>
    <table width="100%" bgcolor=#98FB98>
      <tr><td>
    <imp:toggle name="workshopCds" displayName="${workshopCds.displayName}"
                content="${workshopCdsContent}" isOpen="false"/>
    </td></tr>
  </table>
  </c:if>--%>

</c:if>

<!-- attribution -->


<hr>

<c:set value="${wdkRecord.tables['GenomeSequencingAndAnnotationAttribution']}" var="referenceTable"/>

<c:set value="Error:  No Attribution Available for This Genome!!" var="reference"/>
<c:forEach var="row" items="${referenceTable}">
  <c:if test="${extdbname eq row['name'].value}">
    <c:set var="reference" value="${row['description'].value}"/>
  </c:if>
</c:forEach>


<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />

<br>
<%------------------------------------------------------------------%>

<%-- jsp:include page="/include/footer.html" --%>



<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

</imp:pageFrame>
</c:otherwise>
</c:choose>

<imp:pageLogger name="gene page" />
