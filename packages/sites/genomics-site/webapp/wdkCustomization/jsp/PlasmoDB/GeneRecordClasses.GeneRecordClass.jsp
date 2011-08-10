
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
             divisionName="Gene Record"
		refer="recordPage" 
             division="queries_tools"/>
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>



<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>
<c:set var="binomial" value="${attrs['genus_species'].value}"/>
<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
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
  <c:when test="${fn:contains(organism,'yoelii')}">
    <c:set var="species" value="yoelii"/>
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
  <c:otherwise>
    <b>ERROR: setting species for organism "${organism}"</b>
  </c:otherwise>
</c:choose>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<site:header title="${wdkModel.displayName} : gene ${id} (${prd})"
             divisionName="Gene Record"
		refer="recordPage" 
             division="queries_tools"
             summary="${overview.value} (${length.value} bp)"/>

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


<%--- COMMUNITY EXPERT ANNOTATION -----------%>

<%--
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
--%>

<%-- OVERVIEW ------------%>

<c:set var="attr" value="${attrs['overview']}" />
<site:panel
    displayName="${attr.displayName} ${has_namefun_comment}"
    content="${attr.value}${append}" />
<br>


<%-- DNA CONTEXT ------------%>

<c:choose>
  <c:when test="${species eq 'falciparum3D7'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+CombinedSNPs
    </c:set>
  </c:when>
  <c:when test="${species eq 'yoelii'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'chabaudi'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'falciparumIT'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'berghei'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'knowlesi'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenyGenesVivaxMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'vivax'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansFalciparumITMC+SyntenyGenesFalciparumITMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC
    </c:set>
  </c:when>
  <c:otherwise>
    <c:set var="tracks">
      <%-- CHECK Gene+EST+BLASTX --%>
    </c:set>
  </c:otherwise>
</c:choose>

<c:set var="attribution">
P.${species}.contigs,P.${species}_contigsGB,P.${species}_mitochondrial,P.${species}_chromosomes,P.${species}_wholeGenomeShotgunSequence,P.${species}_Annotation,${species}_falciparum_synteny
</c:set>

<c:if test="${tracks ne ''}">


  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
 <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>

    <center><div id="${gnCtxDivId}"></div></center>
    
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
  </c:set>

  <wdk:toggle 
    name="dnaContextSyn" displayName="Genomic Context"
    displayLink="${has_model_comment}"
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />

</c:if> 


<%-- END DNA CONTEXT --------------------------------------------%>


<%-- mouseOver does not function properly
     if dnaContext and proteinFeatures imageMap are dynamically set on the page 
 <c:set var="okDOMInnerHtml" value="${ fn:contains(header['User-Agent'], 'Firefox') ||
                                       fn:contains(header['User-Agent'], 'Netscape') }"/>
--%>



<c:if test="${species eq 'falciparum3D7'}">
    <wdk:wdkTable tblName="SNPs" isOpen="false"
                   attribution="Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps"/>
</c:if>


<%-- version 5.5 genes --%>
<c:if test="${species eq 'falciparum3D7'}">
<wdk:wdkTable tblName="PlasmoVer5Genes" isOpen="true"
               attribution="" />
</c:if>

<c:if test="${externalDbName.value eq 'Pfalciparum_chromosomes_RSRC'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

</c:if>



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


<site:pageDivider name="Annotation"/>

<a name="user-comment"/>

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

<wdk:wdkTable tblName="PhenotypeComments"  isOpen="true"/> 

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
--%>

<!-- External Links --> 
<%-- "This if clause is redundant as the new (re) annotation has become the official annotation"
<c:if test="${species ne 'falciparum' || (species eq 'falciparum' && attrs['annotation_status'].value ne 'new' &&attrs['annotation_status'].value ne 'new_organellar')}">
--%>

<wdk:wdkTable tblName="GeneLinkouts" isOpen="true" attribution="Plasmodraft_DBRefs,Phenotype_DBRefs"/>

<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="<site:orthomcl orthomcl_name='${orthomcl_name}'/>">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <wdk:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL"
                 postscript="${orthomclLink}"/>
</c:if>
<%--</c:if>--%>

<c:if test="${species eq 'falciparum3D7'}">
  <a name="ecNumber"></a>
  <c:if test="${isCodingGene}">
    <wdk:wdkTable tblName="EcNumber" isOpen="false"
                   attribution="ecMappings_Hagai,P.falciparum_chromosomes,enzymeDB"/>
  </c:if>
</c:if>

<c:if test="${isCodingGene}">
  <a name="goTerm"></a>
  <wdk:wdkTable tblName="GoTerms"
                 attribution="GO,GOAssociations,InterproscanData"/>
</c:if>


<%-- "This if clause is redundant as the new (re) annotation has become the official annotation"
<c:if test="${species ne 'falciparum' || (species eq 'falciparum' && attrs['annotation_status'].value ne 'new' &&attrs['annotation_status'].value ne 'new_organellar')}">
--%>


<!-- gene alias table -->
<wdk:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>


  <wdk:wdkTable tblName="Notes" attribution="P.falciparum_chromosomes"/>


<c:if test="${species eq 'falciparum3D7' || species eq 'berghei' || species eq 'yoelii'}">

<%-- Need to comment out Phenotype for build 11 --%>
<wdk:wdkTable tblName="RodMalPhenotype" isOpen="false"  attribution="Phenotype_DBRefs"/>
  
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
    <wdk:wdkTable tblName="MetabolicPathways" attribution="ecMappings_Hagai"/>
  </c:if>

<c:set var="plasmocyc" value="${attrs['PlasmoCyc']}"/>  
<c:set var="plasmocycvalue" value="<a href='${plasmocyc.url}'>View</a>"/>  

<site:panel 
    displayName="PlasmoCyc <a href='${plasmocyc.url}'>View</a>"
    content="" />

</c:if>

<wdk:wdkTable tblName="Mr4Reagents" attribution="MR4Reagents"/>

<%--
<wdk:wdkTable tblName="AnnotationChanges"/>
--%>


<c:if test="${isCodingGene}">
  <site:pageDivider name="Protein"/>

  <c:if test="${species eq 'falciparum3D7'}">
     <c:set var="ptracks"> 
       FlorensMassSpecPeptides+KhanMassSpecPeptides+LasonderMassSpecPeptides+LasonderMassSpecPeptidesBloodStage+PfBowyerMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP
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

  <c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
  <c:set var="proteinFeaturesUrl">
   http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/plasmodbaa/?name=${id}:1..${proteinLength};type=${ptracks};width=640;embed=1;genepage=1
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
            e="${e}" />
    </c:if> 
    </center></noindex>
    </c:set>
    <wdk:toggle name="proteinContext"  displayName="Protein Features" 
                content="${proteinFeaturesImg}" 
                attribution="${attribution}"/>

    </c:if> <%-- ptracks ne '' --%>


  <c:if test="${species eq 'falciparum3D7'}">
  <wdk:wdkTable tblName="Y2hInteractions" isOpen="true"
                 attribution="y2h_data"/>
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

  <c:if test="${species eq 'falciparum3D7'}">
      <wdk:wdkTable tblName="MassSpec" isOpen="true"
                    attribution="Waters_female_gametes,Waters_male_gametes,Waters_mixed_gametes,Pyoelii_LiverStage_LS40,Pyoelii_LiverStage_LS50,FlorensMassSpecData2002,FlorensMassSpecData2004,Pf_Merozoite_Peptides,Lasonder_Mosquito_Oocysts,Lasonder_Mosquito_oocyst_derived_sporozoites,Lasonder_Mosquito_salivary_gland_sporozoites,Pf_Lasonder_Proteomics_Blood_Stages_early_gametocytes_RSRC,P.falciparum_Clinical_Proteomics,Pfalciparum_Bowyer_Proteomics_42hrs_Post_Infection,Pfalciparum_Bowyer_Proteomics_48hrs_Post_Infection,P.vivax_Clinical_Proteomics,Pf_Lasonder_Proteomics_Blood_Stages_trophozoites_RSRC,Pf_Lasonder_Proteomics_Blood_Stages_early_gametocytes_RSRC,Pf_Lasonder_Proteomics_Blood_Stages_late_gametocytes_RSRC"/>
  </c:if>

  <c:if test="${binomial eq 'Plasmodium berghei'}">
    <wdk:wdkTable tblName="ProteinExpression" attribution="Pberghei_Protein_Expression"/>
  </c:if>

  <wdk:wdkTable tblName="ProteinDatabase"/>

  <c:set var="pdbLink">
    <a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
  </c:set>

<wdk:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

<wdk:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>

  <c:if test="${species eq 'falciparum3D7'}">
    <wdk:wdkTable tblName="3dPreds" attribution="predictedProteinStructures"/>
  </c:if>

  <wdk:wdkTable tblName="Epitopes"/>


</c:if> <%-- end if isCodingGene --%>


<c:if test="${attrs['hasExpression'].value eq '1'}">
  <site:pageDivider name="Expression"/>

  <site:expressionGraphs organism="${organismFull}"/>


<c:if test="${species eq 'falciparum3D7'}">
  <wdk:wdkTable tblName="SageTags" attribution="SageTagArrayDesign,PlasmoSageTagFreqs"/>
</c:if>
</c:if>

 <%-- ------------------------------------------------------------------ --%>


<site:pageDivider name="Sequence"/>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${attrs['protein_sequence'].value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<wdk:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
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
      <wdk:toggle name="workshopProteinSequence" displayName="${workshopProteinSequence.displayName}"
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
<wdk:toggle name="transcriptSequence"
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
      <wdk:toggle name="workshopTranscriptSequence"
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
    <wdk:toggle name="workshopCds" displayName="${workshopCds.displayName}"
                content="${workshopCdsContent}" isOpen="false"/>
    </td></tr>
  </table>
  </c:if>--%>

</c:if>

<!-- attribution -->


<hr>
<div>
  <c:choose>
    <c:when test="${binomial eq 'Plasmodium vivax' && sequence_id eq 'AY598140'}">
        <b><i>P. vivax</i> mitochondrial sequence and annotation was obtained from Genbank</b>
    </c:when>
    <c:when test="${binomial eq 'Plasmodium vivax'}">

        <b><i>P. vivax</i> was sequenced by 
        <a href="http://www.tigr.org/tdb/e2k1/pva1/">The
        Institute for Genomic Research</a></b>

    </c:when>
    <c:when test="${binomial eq 'Plasmodium yoelii'}">

        <b><i>P. yoelii</i> was sequenced by
        <a href="http://www.tigr.org/tdb/edb2/pya1/htmls/">The Institute for
        Genomic Research</a></b>

    </c:when>
    <c:when test="${species eq 'falciparum3D7' && (sequence_id eq 'Pf3D7_02' || sequence_id eq 'Pf3D7_10' || sequence_id eq 'Pf3D7_11' || sequence_id eq 'Pf3D7_14')}">

        <%-- P. falciparum 2, 10, 11, 14 = TIGR --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at 
        <a href="http://www.tigr.org/tdb/edb2/pfa1/htmls/">The Institute for Genomic Research</a>
        and the <a href="http://www.nmrc.navy.mil/">Naval Medical Research Center</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${species eq 'falciparum3D7' && (sequence_id eq 'Pf3D7_01' || sequence_id eq 'Pf3D7_03' || sequence_id eq 'Pf3D7_04' || sequence_id eq 'Pf3D7_05' || sequence_id eq 'Pf3D7_06' || sequence_id eq 'Pf3D7_07' || sequence_id eq 'Pf3D7_08' || sequence_id eq 'Pf3D7_09' || sequence_id eq 'Pf3D7_13')}">
        <%-- P. falciparum 1, 3-9, 13 = Sanger --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at the 
        <a href="http://www.sanger.ac.uk/Projects/P_falciparum/">Sanger Institute</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${species eq 'falciparum3D7' && sequence_id eq 'Pf3D7_12'}">
        <%-- P. falciparum 12 = Stanford --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at the
        <a href="http://sequence-www.stanford.edu/group/malaria/">Stanford Genome Technology Center</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${species eq 'falciparum3D7' && sequence_id eq 'M76611'}">
        <%-- P. falciparum mitochondrial genome --%>
        <%--b>The <i>P. falciparum</i> mitochondrial sequence was retrieved from GenBank</b --%>
        <b>The <i>P. falciparum</i> mitochondrial genome was obtained from the Wellcome Trust Sanger Institute (WTSI).</b>
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the WTSI and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${species eq 'falciparum3D7' && sequence_id eq 'PFC10_API_IRAB'}">
        <%-- P. falciparum plastid genome --%>
        <b>The <i>P. falciparum</i> plastid genome was obtained from the Wellcome Trust Sanger Institute (WTSI).</b>
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the WTSI and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>

    <c:when test="${species eq 'falciparum3D7' && sequence_id eq 'AJ276844'}">
        <%-- P. falciparum mitochondrion = University of London --%>
        <b>The mitochondrial genome of <i>P. falciparum</i> was
        sequenced at the
        <a href="http://www.lshtm.ac.uk/pmbu/staff/dconway/dconway.html">London
        School of Hygiene & Tropical Medicine</a></b>
    </c:when>
    <c:when test="${species eq 'falciparum3D7' && (sequence_id eq 'X95275' || sequence_id eq 'X95276')}">

        <%-- P. falciparum plastid --%>
        <b>The <i>P. falciparum</i> plastid was
        sequenced at the 
        <a href="http://www.nimr.mrc.ac.uk/parasitol/wilson/">National
        Institute for Medical Research</a></b>

    </c:when>
    <c:when test="${species eq 'falciparum3D7' && (sequence_id eq 'API_IRAB' || sequence_id eq 'PfNF54')}">
        <%-- new plastid sequences --%>
        <b>The new <i>P. falciparum</i> plastid and mitochondrial sequences were provided by GeneDB (WTSI). </b>
    </c:when>
    <c:when test="${species eq 'falciparumIT'}">
Sequence data for <i>Plasmodium falciparum</i> IT strain were produced by Wellcome Trust Sanger Institute, with funding from the EVIMalaR Consortium (a European Commission Funded Network of Excellence). This draft version of the genome was generated by iterative mapping reads of <i>P. falciparum</i> IT against the <i>P. falciparum</i> 3D7 genome. Subtelomeric genes have been transferred from <i>P. falciparum</i> 3D7 based on location. The Parasite Genomics Group plans on publishing the completed and annotated sequence in a peer-reviewed journal as soon as possible. 
    </c:when>
    <c:when test="${binomial eq 'Plasmodium berghei'}">
        <%-- e.g.PB000938.03.0 --%>
        <b>The <i>P. berghei</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_berghei">Sanger
        Institute</a></b>
    </c:when>
    <c:when test="${binomial eq 'Plasmodium chabaudi'}">
        <%-- e.g. PC000000.00.0 --%>
Annotation of the P. chabaudi AS chromosomes was obtained from the Pathogen Sequencing Unit at the <a href="http://www.sanger.ac.uk/Projects/P_chabaudi">Wellcome Trust Sanger Institute</a>, 2009-03-24. It included sequence and gene models. 
<b>The <a href="http://www.sanger.ac.uk/Projects/P_chabaudi">Wellcome Trust Sanger Institute</a> plans on publishing the completed and annotated sequences (i.e. 8X assembly and updated annotation) of P. chabaudi AS in a peer-reviewed journal as soon as possible. Permission of the principal investigator should be obtained before publishing analyses of the sequence/open reading frames/genes on a chromosome or genome scale.</b>
    </c:when>
    <c:when test="${binomial eq 'Plasmodium knowlesi'}">
        <%-- e.g. PC000000.00.0 --%>
        <b>The <i>P. knowlesi</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_knowlesi">Sanger
        Institute</a></b>
        </a></b>
    </c:when>
    <c:otherwise>
      <b>ERROR: attribution unknown for binomial "${binomial}",
         sequence "${sequence_id}"</b>
    </c:otherwise>
  </c:choose>
</div>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>
</c:otherwise>
</c:choose>

<site:footer/>

<site:pageLogger name="gene page" />
