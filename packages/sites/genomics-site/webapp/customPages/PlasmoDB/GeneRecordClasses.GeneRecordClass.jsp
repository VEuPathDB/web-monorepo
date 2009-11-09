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
<c:set var="organism" value="${attrs['organism'].value}"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq null || !wdkRecord.validRecord}">
<site:header title="${wdkModel.displayName} : gene ${id}"
             divisionName="Gene Record"
             division="queries_tools"/>
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>
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
  <c:when test="${fn:contains(organism,'falciparum')}">
    <c:set var="species" value="falciparum"/>
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

<site:header title="${wdkModel.displayName} : gene ${id} (${prd})"
             divisionName="Gene Record"
             division="queries_tools"
             summary="${overview.value} (${length.value} bp)"/>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white
       class=thinTopBorders>

 <tr>
  <td bgcolor=white valign=top>

<table width="100%">
<tr>
  <td align="center"><a href="#Annotation">Annotation</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  <c:if test="${isCodingGene}">
  <td align="center"><a href="#Protein">Protein</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  </c:if>

  <c:if test="${species eq 'falciparum' || species eq 'berghei' || species eq 'yoelii' || species eq 'vivax'}">
  <td align="center"><a href="#Expression">Expression</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  </c:if>

  <td align="center"><a href="#Sequence">Sequence</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>

  <c:if test="${species eq 'falciparum'}">
    <td align="center"><a href="http://v4-4.plasmodb.org/plasmodb/servlet/sv?page=gene&source_id=${id}">${id} in PlasmoDB 4.4</a>
       <img src="<c:url value='/images/arrow.gif'/>">
    </td>
  </c:if>
  <c:if test="${species eq 'yoelii'}">
    <td align="center"><a href="http://v4-4.plasmodb.org/plasmodb/servlet/sv?page=pyGene&source_id=${id}">${id} in PlasmoDB 4.4</a>
       <img src="<c:url value='/images/arrow.gif'/>">
    </td>
  </c:if>

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
    displayName="${attr.displayName} ${has_namefun_comment}" 
    content="${attr.value}${append}" />
<br>


<!-- note moved comments url stuff here so can use in plasmo new annotation section -->
<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>
<c:url var="commentsUrl" value="showAddComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${externalDbName.value}" />
  <c:param name="externalDbVersion" value="${externalDbVersion.value}" />
        <c:param name="organism" value="${binomial}" />
</c:url>

<%-- "new annotation attributes have become obsolete as the new (re) annotation has become the official annotation"
 
<c:if test="${species eq 'falciparum'}">
<!-- new annotation attributes -->
<c:set var="annotationStatus" value="${attrs['annotation_status'].value}"/>
<c:set var="hasNewGo" value="${attrs['new_go'].value}"/>
<c:set var="hasNewEc" value="${attrs['new_ec'].value}"/>
<c:set var="hasNewProduct" value="${attrs['new_product'].value}"/>
<c:set var="hasNewProtein" value="${attrs['new_protein'].value}"/>
<c:set var="newProductString" value="${attrs['new_product_string'].value}"/>

<table border=0 width=100% cellpadding=2 cellspacing=0 bgcolor=#98FB98> --%>
<%--  <c:choose>
  <c:when test="${annotationStatus eq 'new'}">
    <tr><td colspan="4">This is a <b>new gene</b> identified in the course of the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop and ongoing reannotation efforts</a>.</td></tr>
  </c:when>
  <c:when test="${annotationStatus eq 'new_organellar'}">
    <tr><td colspan="4">Organellar Genes were annotated on alternative genomic sequences at the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop</a>.  This appears to be a <b>new gene</b> but it may correspond to an existing gene with a different identifier.  (ie.  Some Genes on <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=API_IRAB">API_IRAB</a> will map to  <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=X95275">X95275</a> or <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=X95276">X95276</a>)</td></tr>
  </c:when>
  <c:when test="${annotationStatus eq 'deleted_organellar'}">
    <tr><td colspan="4">Organellar Genes were annotated on alternative genomic sequences at the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop</a>.  This appears to be a <b>deleted gene</b> but it may have a corresponding gene in the New Workshop Annotation with a different identifier.  (ie.  Some Genes on <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=API_IRAB">API_IRAB</a> will map to  <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=X95275">X95275</a> or <a href="/a/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=PlasmoDB&primary_key=X95276">X95276</a>)</td></tr>
  </c:when>
  <c:when test="${annotationStatus eq 'reviewed'}">
    <tr><td colspan="4">This gene was <b>reviewed</b> (but not modified) in the course of the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop and ongoing reannotation efforts</a>.</td></tr>
  </c:when>
  <c:when test="${annotationStatus eq 'changed'}">
    <tr><td colspan="4">This gene has been <b>modified</b> in the course of the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop and ongoing reannotation efforts</a>.</td></tr>
  </c:when>
  <c:when test="${annotationStatus eq 'deleted'}">
    <tr><td colspan="4">This gene identifier was <b>deleted</b> in the course of the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation workshop and ongoing reannotation efforts</a>.</td></tr>
  </c:when>
  <c:otherwise>
    <tr><td colspan="4">This gene has not yet been reviewed in the <a href="showXmlDataContent.do?name=XmlQuestions.News#newsItem1">reannotation effort</a>.</td></tr>
  </c:otherwise>

  </c:choose>
    <c:if test="${hasNewProduct == 1}">
      <tr><td><b>New Product:</b></td>
          <td colspan="3"><b><font color="CC0000">${newProductString}</font></b></td>
      </tr>
    </c:if>

    <c:if test="${annotationStatus eq 'changed' || annotationStatus eq 'new' || annotationStatus eq 'new_organellar'}">
      <tr><td><b>New information available:</b></td>
        <c:choose>
          <c:when test="${hasNewProtein == 1}">
            <td><b><a href="#geneModel"><font color="CC0000">Gene Model</font></a></b>
             <img src="<c:url value='/images/arrow.gif'/>">
            </td>
          </c:when>
          <c:otherwise>
            <td><font color="999999">Gene Model</font></td>
          </c:otherwise>
        </c:choose>
        <c:choose>
          <c:when test="${hasNewGo == 1}">
            <td><b><a href="#goTerm"><font color="CC0000">GO Terms</font></a></b>
             <img src="<c:url value='/images/arrow.gif'/>">
            </td>
          </c:when>
          <c:otherwise>
            <td><font color="999999">GO Terms</font></td>
          </c:otherwise>
        </c:choose>
        <c:choose>
          <c:when test="${hasNewEc == 1}">
            <td><b><a href="#ecNumber"><font color="CC0000">EC Number</font></a></b>
             <img src="<c:url value='/images/arrow.gif'/>">
            </td>
          </c:when>
          <c:otherwise>
            <td><font color="999999">EC Number</font></td>                                                                            
          </c:otherwise>
        </c:choose>
      </tr>
    </c:if>

  <tr><td colspan="4"><b>Re-annotation is ongoing</b>.  Please <b><a href="${commentsUrl}">add a user comment</a></b> if you can provide further information.</td></tr>

</table>

<hr>
</c:if> --%>


<%-- DNA CONTEXT ---------------------------------------------------%>

<c:choose>
  <c:when test="${species eq 'falciparum'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC+CombinedSNPs
    </c:set>
  </c:when>
  <c:when test="${species eq 'yoelii'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'chabaudi'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'berghei'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'knowlesi'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansVivaxMC+SyntenyGenesVivaxMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC
    </c:set>
  </c:when>
  <c:when test="${species eq 'vivax'}">
    <c:set var="tracks">
      AnnotatedGenes+SyntenySpansFalciparumMC+SyntenyGenesFalciparumMC+SyntenySpansKnowlesiMC+SyntenyGenesKnowlesiMC+SyntenySpansChabaudiMC+SyntenyGenesChabaudiMC+SyntenySpansYoeliiMC+SyntenyGenesYoeliiMC+SyntenySpansBergheiMC+SyntenyGenesBergheiMC
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
     /cgi-bin/gbrowse_img/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${id}@yellow
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>
    
    <c:set var="labels" value="${fn:replace(tracks, '+', ';label=')}" />
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/plasmodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
    </c:set>
    <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
  </c:set>

  <site:toggle 
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



<c:if test="${binomial eq 'Plasmodium falciparum'}">
    <site:wdkTable tblName="SNPs" isOpen="false"
                   attribution="Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps"/>
</c:if>


<%-- version 5.5 genes --%>
<c:if test="${binomial eq 'Plasmodium falciparum'}">
<site:wdkTable tblName="PlasmoVer5Genes" isOpen="true"
               attribution="" />
</c:if>

<c:if test="${externalDbName.value eq 'Sanger P. falciparum chromosomes'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>


<!-- Mercator / Mavid alignments -->
<c:set var="mercatorAlign">
<site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes="3D7,Dd2,HB3, and IT"/>
</c:set>

<site:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>

</c:if>

<site:pageDivider name="Annotation"/>

<a name="user-comment"/>

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
<b><a href="${commentsUrl}">Add a comment on ${id}</a></b><br><br>

<c:catch var="e">

<site:wdkTable tblName="UserComments"  isOpen="true"/>


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




<c:if test="${binomial ne 'Plasmodium falciparum'}">
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

<site:wdkTable tblName="PhenotypeComments"  isOpen="true"/> 

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

<site:wdkTable tblName="GeneLinkouts" isOpen="true" attribution="Plasmodraft_DBRefs,Phenotype_DBRefs"/>

<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="http://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=${orthomcl_name}">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <site:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL"
                 postscript="${orthomclLink}"/>
</c:if>
<%--</c:if>--%>

<c:if test="${binomial eq 'Plasmodium falciparum'}">
  <a name="ecNumber"></a>
  <c:if test="${isCodingGene}">
    <site:wdkTable tblName="EcNumber" isOpen="false"
                   attribution="ecMappings_Hagai,P.falciparum_chromosomes,enzymeDB"/>
  </c:if>
</c:if>

<c:if test="${isCodingGene}">
  <a name="goTerm"></a>
  <site:wdkTable tblName="GoTerms"
                 attribution="GO,GOAssociations,InterproscanData"/>
</c:if>


<%-- "This if clause is redundant as the new (re) annotation has become the official annotation"
<c:if test="${species ne 'falciparum' || (species eq 'falciparum' && attrs['annotation_status'].value ne 'new' &&attrs['annotation_status'].value ne 'new_organellar')}">
--%>

<c:if test="${binomial eq 'Plasmodium falciparum'}">
  <site:wdkTable tblName="Aliases" isOpen="true"
                 attribution="P.falciparum_chromosomes"/>

  <site:wdkTable tblName="Notes" attribution="P.falciparum_chromosomes"/>
  
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
    <site:wdkTable tblName="MetabolicPathways" attribution="ecMappings_Hagai"/>
  </c:if>

<c:set var="plasmocyc" value="${attrs['PlasmoCyc']}"/>  
<c:set var="plasmocycvalue" value="<a href='${plasmocyc.url}'>View</a>"/>  

<site:panel 
    displayName="PlasmoCyc <a href='${plasmocyc.url}'>View</a>"
    content="" />

</c:if>

<site:wdkTable tblName="Mr4Reagents" attribution="MR4Reagents"/>


<c:if test="${isCodingGene}">
  <site:pageDivider name="Protein"/>

  <c:set var="proteinFeatures" value="${attrs['proteinFeatures'].value}"/>

  <c:if test="${species eq 'falciparum'}">
      <c:set var="proteinFeatures" value="${attrs['proteinFeatures'].value};type=FlorensMassSpecPeptides+KhanMassSpecPeptides+LasonderMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP"/>
  </c:if>
  <c:if test="${species eq 'berghei'}">
      <c:set var="proteinFeatures" value="${attrs['proteinFeatures'].value};type=WatersMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP"/>
  </c:if>
  <c:if test="${species eq 'yoelii'}">
      <c:set var="proteinFeatures" value="${attrs['proteinFeatures'].value};type=LiverStageMassSpecPeptides+InterproDomains+SignalP+TMHMM+ExportPred+HydropathyPlot+SecondaryStructure+LowComplexity+BLASTP"/>
  </c:if>

  <c:if test="${! fn:startsWith(proteinFeatures, 'http')}">
    <c:set var="proteinFeatures">
      ${pageContext.request.scheme}://${pageContext.request.serverName}/${proteinFeatures}
    </c:set>
  </c:if>

  <c:set var="imageMapDivId" value="proteinFeaturesDiv"/>

  <c:catch var="e">
    <c:set var="proteinFeaturesContent">
    <c:choose>
    <c:when test="${okDOMInnerHtml}">
      <div id="${imageMapDivId}"></div>
    </c:when>
    <c:otherwise>
      <noindex follow><center>
      <c:import url="${proteinFeatures}"/>
      <!-- ${proteinFeatures} -->
      </center></noindex>
    </c:otherwise>
    </c:choose>
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

  <c:choose>
  <c:when test="${okDOMInnerHtml}">
    <site:toggle name="proteinFeatures" displayName="Protein Features"
               content="${proteinFeaturesContent}" isOpen="true"
               imageMapDivId="${imageMapDivId}" imageMapSource="${proteinFeatures}"
               attribution="NRDB,InterproscanData"/>
  </c:when>
  <c:otherwise>
    <site:toggle name="proteinFeatures" displayName="Protein Features"
               content="${proteinFeaturesContent}" isOpen="true"
               attribution="NRDB,InterproscanData"/>
  </c:otherwise>
  </c:choose>

  <c:if test="${binomial eq 'Plasmodium falciparum'}">
  <site:wdkTable tblName="Y2hInteractions" isOpen="true"
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

  <c:if test="${binomial eq 'Plasmodium falciparum'}">
      <site:wdkTable tblName="MassSpec" isOpen="true"
                    attribution="FlorensMassSpecData2002,FlorensMassSpecData2004"/>
  </c:if>

  <c:if test="${binomial eq 'Plasmodium berghei'}">
    <site:wdkTable tblName="ProteinExpression" attribution="Pberghei_Protein_Expression"/>
  </c:if>

  <site:wdkTable tblName="ProteinDatabase"/>

  <c:set var="pdbLink">
    <a href="http://www.rcsb.org/pdb/smartSubquery.do?smartSearchSubtype=SequenceQuery&inputFASTA_USEstructureId=false&sequence=${attrs['protein_sequence'].value}&eCutOff=10&searchTool=blast">Search
    PDB by the protein sequence of ${id}</a>
  </c:set>

  <site:wdkTable tblName="PdbSimilarities" postscript="${pdbLink}" attribution="PDBProteinSequences"/>

  <c:if test="${binomial eq 'Plasmodium falciparum'}">
    <site:wdkTable tblName="3dPreds" attribution="predictedProteinStructures"/>
  </c:if>

  <site:wdkTable tblName="Epitopes"/>


</c:if> <%-- end if isCodingGene --%>

<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<c:if test="${binomial eq 'Plasmodium falciparum' || binomial eq 'Plasmodium yoelii' || binomial eq 'Plasmodium berghei'}">
  <site:pageDivider name="Expression"/>

  <site:wdkTable tblName="ArrayElements" attribution="Vaidya_Bergman_oligos,DeRisi_oligos,berghei_gss_oligos"/>
</c:if>

<c:if test="${binomial eq 'Plasmodium vivax'}">
  <site:pageDivider name="Expression"/>

  <c:set var="secName" value="ZBPvivaxTS::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table border=0>
      <tr>
        <td class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
           Transcriptional profile throughout the 48-h intraerythrocytic cycle of three distinct P. vivax clinical isolates.
           Samples were collected on the Northewestern border of Thailand and taken before treatment.
	  <br><br>
            <font color="#990099"><b>Patient 1</b></font>
            : color representing patient 1
            <br><font color="#009999"><b>Patient 2</b></font>
            : color representing patient 2
            <br><font color="#999900"><b>Patient 3</b></font>
            : color representing patient 3
            	  <br><br>

            <b>x-axis (all graphs)</b><br>
            Using the best fit Pearson correlations, correlated gene expression data in TP1-9 
            in <i>P. vivax</i> to the expression data in TP 9, 13, 17, 20, 23, 29, 35, 40, and 43
            in the <i>P. falciparum</i> transcriptome
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Log (base 2) ratio of expression value
            (normalized by experiment) to average value for all time points
            for a gene
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Ranking (percentile) of each gene's intensity relative to all other genes
            for a given experiment
          </div>
          <br><br>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_zb_pvivax'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic Time Series"
               attribution="Pvivax_ZB_Time_Series_ExpressionData"/>


  <c:set var="secName" value="WestenbergerVivax::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table border=0>
      <tr>
        <td class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
             Asexual parasites were extracted from patients who presented to local health clinics in the Peruvian Amazon region of Iquitos with typical signs and symptoms of malaria.  These were evaluated by light microscopy examination of Giemsa-stained blood smears to have P. vivax parasitemia.  P. vivax sporozoites were obtained from Sanaria, Inc. from mosquitoes fed on P. vivax infected chimpanzees infected with India VII strain P. vivax. 
            <br><br>
            <b>y-axis (graph #1)</b><br>
             For a given gene, signals from probes selected by the probe selection algorithm form an integral intensity distribution. According to the MOID algorithm, the 70 percentile of the intensity distribution is defined as the expression level of the gene.
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Percentiles are calculated for each sample within array.
          </div>
          <br><br>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_westenberger'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>


  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Asexual parasites from patient blood samples"
               attribution="Westenberger_vivax_ExpressionData"/>


</c:if>

<c:if test="${binomial eq 'Plasmodium falciparum'}">

  <c:set var="secName" value="DeRisiWinzeler::Ver1"/>
  <c:if test="${attrs['graph_derisi_winzeler'].value == 0 && attrs['graph_3d7'].value == 1 && attrs['graph_hb3'].value == 1 && attrs['graph_dd2'].value == 1}">
    <c:set var="secName" value="DeRisiOverlay::Ver1"/>
  </c:if>


  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="true"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="155" width="1"></td>
        <td  class="centered">
          <div class="small">
             Studies by the <a href="http://derisilab.ucsf.edu/">Derisi
             Lab</a> of <i>P. falciparum</i> strains 
             <font color='blue'>HB3</font>, <font color='red'>3D7</font>, and
             <font color='orange'>Dd2</font> used glass slide arrays.<br>
          </div>
        </td>
      </tr>

      <c:if test="${attrs['graph_derisi_winzeler'].value == 1}">

      <tr>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="155" width="1"></td>
        <td  class="centered">
          <div class="small">
             Studies by the <a href="http://www.scripps.edu/cb/winzeler/">Winzeler
             Lab</a> of
             <font color=#009999>Sorbitol</font>-
             and <font color=#990099>Temperature</font>-synchronized 3D7 strain             parasites used Affymetrix
             oligonucleotide arrays.<br>
          </div>
        </td>
      </tr>

      </c:if>

      <tr>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="170" width="1"></td>
        <td  class="centered">
          <div class="small">
             <a href="<c:url value="/correlatedGeneExpression.jsp"/>">More
             on mapping time points between time courses</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_derisi_winzeler'].value == 0 && (attrs['graph_3d7'].value == 0 || attrs['graph_hb3'].value == 0 || attrs['graph_dd2'].value == 0)}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Overlay of Intraerythrocytic Expression Profiles"
               attribution="winzeler_cell_cycle,derisi_Dd2_time_series,derisi_HB3_time_series,derisi_3D7_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="PfRNASeq::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="true"/>

  <c:set var="expressionContent">
    <table width="90%" cellpadding=3>
      <tr>
        <td class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered">
         <div class="small">            
P.falciparum RNA Sequence Profiles - Intraerythrocytic Cycle. Y-axis is the log2 of the geometric mean of coverage / kb of unique sequence (GMC/kb). 
         </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_pf_rna_seq'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

<%--  NOTE: uncomment here to activate RNAseq
  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="P.falciparum RNA Sequence Profiles - Intraerythrocytic Cycle"
               attribution="Pfalciparum_RNA_Seq"/> 
--%>

  <c:set var="secName" value="Winzeler::Cc"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
            Plasmodium developmental stages* synchronized by
            <font COLOR='#009999'><b>sorbitol</b></font> and
            <font COLOR='#990099'><b>temperature</b></font>.
            Data for Gametocyte sample corresponds to synchronization only by sorbitol,
            and for Sporozoite sample represents average of two replicates.
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Log (base 2) ratio of Affymetrix MOID expression value
            (normalized by experiment) to average MOID value for all time points
            for a gene
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #2)</b><br>
            Ranking (percentile) of each gene's intensity relative to all other genes
            for a given experiment
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #3)</b><br>
            Affymetrix MOID expression value normalized by experiment
          </div>
        </td>
      
      </tr>
      <tr>
        <td colspan="3" class="centered">
          <div class="small">
            <font color="#009999"><b>sorbitol</b></font>
            : color representing stage synchronized by sorbitol
            <br><font color="#990099"><b>temperature</b></font>
            : color representing stage synchronized by temperature
            <br><font color="#999999"><b>below confidence threshold</b></font>
            : the expression level is less than 10 (too close to background),
            or the logP is greater than -0.5 (too few probes per gene)

            <br><br>
            <b>*Stages:</b> ER&nbsp;=&nbsp;Early&nbsp;Rings | LR&nbsp;=&nbsp;Late&nbsp;Rings |
            ET&nbsp;=&nbsp;Early&nbsp;Trophs | LT&nbsp;=&nbsp;Late&nbsp;Trophs |
            ES&nbsp;=&nbsp;Early&nbsp;Schizonts | LS&nbsp;=&nbsp;Late&nbsp;Schizonts |
            M&nbsp;=&nbsp;Merozoites | S&nbsp;=&nbsp;Sporozoites |
            G&nbsp;=&nbsp;Gametocytes

            <br><br>
            <b>Reference for this dataset:</b>
            <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=PubMed&list_uids=12893887&dopt=Abstract">Le
            Roch et al. PubMed abstract</a><br>
            <b>To download a free electronic reprint</b>: go to
            <a href="https://www.scripps.edu/cb/winzeler/publications">Winzeler
            lab publications</a><br>
            <b>See also:</b>
            <a href="http://carrier.gnf.org/publications/CellCycle/">Supplemental
            material on Winzeler lab web site</a><br>
            <b>See also:</b>
            <a href="http://www.cbil.upenn.edu/RAD/php/displayStudy.php?study_id=429">Study
            annotations in RAD</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_winzeler'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic 3D7 (photolithographic oligo array)"
               attribution="winzeler_cell_cycle"/>

  <c:set var="secName" value="WbcGametocytes::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (both graphs)</b><br>
            Day of gametocytogenesis
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Ranking (percentile) of ${id}'s intensity, relative to all other genes
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #2)</b><br>
            Affymetrix MOID expression value for ${id}, normalized by
            experiment
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="3" class="centered">
          <div class="small">
                <font face="helvetica,sans-serif" color="#ff0000" size="-1"><b>red</b></font>
                <font size="-1">: P. falciparum 3D7</font><br>
                <font face="helvetica,sans-serif" color="#ffc0cb" size="-1"><b>pink</b></font>
                <font size="-1">: MACS-purified P. falciparum 3D7</font><br>
                <font face="helvetica,sans-serif" color="#a020f0" size="-1"><b>purple</b></font>
                <font size="-1">: P. falciparum isolate NF54<br><br></font>

                <b>Reference:</b>
                <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=16005087&query_hl=1">Young
                et al. PubMed abstract</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_gametocyte'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Gametocyte 3D7/NF54 (photolithographic oligo array)"
               attribution="winzeler_gametocyte_expression"/>

  <c:set var="secName" value="DeRisi::3D7"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=3D7&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of <B>3D7</B> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_3d7'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series 3D7 (glass slide oligo array)"
               attribution="derisi_3D7_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisi::Dd2"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=Dd2&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>DD2</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_dd2'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series Dd2 (glass slide oligo array)"
               attribution="derisi_Dd2_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisi::HB3"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=HB3&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>HB3</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_hb3'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series HB3 (glass slide oligo array)"
               attribution="derisi_HB3_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="MEXP128::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table width="90%" cellpadding=3>
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered">
         <div class="small">            
Comparison of expression profile of two 3D7 isogenic clones : 3D7S8.4 vs. 3D7AH1S2 (M=log2(3D7S8.4/3D7AH1S2) at three different stages of intraerythrocytic cycle: ring,
trophozite and schizont stage.
         </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_mexp128'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic comparison of antigenic and adherent variant clones of P. falciparum 3D7"
               attribution="E-MEXP-128_arrayData"/> 

  <c:set var="secName" value="Cowman::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table cellspacing=3>
 
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      </tr>

      <tr>
        <td class="centered"><image width="95%" src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
        </td>
      </tr>

   <tr>
            <td class="centered"><image  src="<c:url value="/images/cowman_percentile.PNG"/>" ></td>
            <td  class="centered"><div class"small">The percentile graph represents all expression values across the dymanic range of intensities for each study.</div></td>
   </tr>


    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_cowman'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Sir2 and invasion pathway studies (WT vs. KO)"
               attribution="scrMalaria_PlasmoSubset,CowmanStubbs_arrayData,CowmanDuraisingh_arrayData,CowmanBaum_arrayData,Cowman_radAnalysisscrMalaria_PlasmoSubset"/>


  <c:set var="secName" value="Daily::SortedRmaAndPercentiles"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="typeArg" value="patient-number"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg=${typeArg}"/>

  <c:set var="isOpen" value="false"/>

<c:set var="preImgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg="/>

  <c:set var="expressionContent">

    <table width="95%">
<FORM NAME="DailySort">
      <tr>
        <td rowspan=2 class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
         <td  class="centered"  nowrap><b>Sort By:</b>
<SELECT NAME="DailyList"
OnChange="javascript:updateImage('${imgId}', DailySort.DailyList.options[selectedIndex].value)">
<OPTION SELECTED="SELECTED" VALUE="${preImgSrc}patient-number">patient-number</OPTION>
<OPTION VALUE="${preImgSrc}age">age</OPTION>
<OPTION VALUE="${preImgSrc}temperature">temperature</OPTION>
<OPTION VALUE="${preImgSrc}weight">weight</OPTION>
<OPTION VALUE="${preImgSrc}days-ill">days-ill</OPTION>
<OPTION VALUE="${preImgSrc}parasitemia">parasitemia</OPTION>
<OPTION VALUE="${preImgSrc}hct">hct</OPTION>
<OPTION VALUE="${preImgSrc}TNFa">TNFa</OPTION>
<OPTION VALUE="${preImgSrc}TGFa">TGFa</OPTION>
<OPTION VALUE="${preImgSrc}Lymphotactin">Lymphotactin</OPTION>
<OPTION VALUE="${preImgSrc}Tissue-Factor">Tissue-Factor</OPTION>
<OPTION VALUE="${preImgSrc}P-selectin">P-selectin</OPTION>
<OPTION VALUE="${preImgSrc}VCAM1">VCAM1</OPTION>
<OPTION VALUE="${preImgSrc}IL6">IL6</OPTION>
<OPTION VALUE="${preImgSrc}IL10">IL10</OPTION>
<OPTION VALUE="${preImgSrc}IL12p70">IL12p70</OPTION>
<OPTION VALUE="${preImgSrc}IL15">IL15</OPTION>
</select>
    </td></tr>

    <tr>
      <td  class="centered"><div class="small">Correlations between the expressoin level and various measured factors are shown.  The patient samples (x axis) can be ordered based on any factor using the drop down list.  The patient number is always displayed with the factor value. Colors indicate clusters based on Daily et. al. publication (see data source). Blue= cluster1 (starvation response), purple=cluster2 (early ring stage), peach= cluster3 (env. stress). 
      </div>   
   </td>
    </tr>
</FORM>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_daily'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Distinct physiological states of <i>Plasmodium falciparum</i> in malaria infected patients"
               attribution="daily_expressionProfiles"/>

  <!-- start Newbold microarry study --> 
  <c:set var="secName" value="Newbold::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table cellspacing=3>
 
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      </tr>

      <tr>
        <td class="centered"><image width="95%" src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
             Patients with diverse sympotoms of malaria. <i>Plasmodium falciparum</i> directly from the blood of infected individuals was cultured to examine patterns of mature-stage gene expression in patient isolates. 
            <br><br>
            <b>y-axis (graph #1)</b><br>
            log2 of the RMA normalized values
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Percentiles are calculated for each sample within array.
            <br/><br/>
            <b>mild/severe disease (all graphs)</b><br>
            <font color='red'>red color</font> represents patients with severe disease <br/>
            <font color='lightskyblue'>blue color</font> represents patients with mild disease <br/>
          </div>
          <br><br> 
        </td>
      </tr>

    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_cowman'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Ex vivo intraerythrocitic expression assays of <i>Plasmodium falciparum</i> in malaria infected patients"
               attribution="Pfalciparum_newbold_Gene_Expression"/>

  <!-- end Newbold microarry study -->


  <site:wdkTable tblName="SageTags" attribution="SageTagArrayDesign,PlasmoSageTagFreqs"/>
</c:if>



<c:if test="${binomial eq 'Plasmodium yoelii'}">

  <c:set var="secName" value="Kappe::ReplicatesAveraged"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table width="90%" cellpadding=4>
      <tr>
        <td  class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        </tr>
        <tr>
        <td  class="centered"><div class="small">
<b>ooSpz</b>: Sporozoites from infected A. stephensi mosquitoes midguts (harvested 10 days after mosquito feeding)<br/>
<b>sgSpz</b>: Sporozoites from infected A. stephensi mosquitoes salivary glands (harvested 15 days after mosquito feeding)<br/>
<b>LS24</b>: Isolated liver stage infected hepatocytes 24 hrs after in vivo infection<br/>
<b>LS40</b>: Isolated liver stage infected hepatocytes 40 hrs after in vivo infection<br/>
<b>LS50</b>: Isolated liver stage infected hepatocytes 50 hrs after in vivo infection<br/>
<b>Schz</b>: Purified erythrocytic schizonts<br/>
<b>BS</b>: mixed erythrocytic stages when parasitemia was at 5-10%<br/><br/>
M values (Blue bars in the upper graph) represent the relative expression level between pairs of conditions expressed as base-2 logarithms (note that M is in units of 2-fold change so in a comparison M = 0 denotes equal expression, M = +/-1 denotes a 2-fold difference in expression between the compared samples, etc.) - each is the average of all arrays representing the indicated comparison.  <br/>The lower graph gives the expression percentile of the two conditions for each of the comparisons - each is the average percentile over all arrays representing that comparision.
</div>
</td>
</tr>

</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_kappe'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<site:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Relative expression profiles between liver, mosquito, and red cell stage parasites"
       attribution="Kappe_expressionProfiles"/>


<c:set var="secName" value="Kappe::AveragedPercentiles"/>
<c:set var="imgId" value="img${secName}"/>
<c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

<c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2" class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td  class="centered"><div class="small">
The overall expression percentile of each condition is the average percentile over all arrays representing that condition regardless of channel.
 </div>
</td>
</tr>
</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_kappe'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<site:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Expression profile of liver, mosquito, and red cell stage parasites"
       attribution="Kappe_expressionProfiles"/>



  <c:set var="secName" value="WinzelerYoelii::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

  <c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2" class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td  class="centered">
<div class="small">

<table cellpadding=0 cellspacing=0>
<tr><td colspan=2><b>X-Axis(Graph #1 and #2)</b></td></tr>
<tr><td>G(1) </td><td>	Gametocyte 1</td></tr>
<tr><td>G(2)</td><td>	Gametocyte 2</td></tr>
<tr><td>GM(1)</td><td>	Gametocyte 1 Mature</td></tr>
<tr><td>GI(2)</td><td>	Gametocyte 2 Immature</td></tr>
<tr><td>S</td><td>	Schizont</td></tr>
<tr><td>MB</td><td>	Mixed blood</td></tr>
<tr><td>MB</td><td>	Mixed blood</td></tr>
<tr><td>SS(1) 14 dpi</td><td>	Salivary sporozoite 1 (14 days post infection)</td></tr>
<tr><td>SS(2) 14 dpi</td><td>	Salivary sporozoite 2 (14 days post infection)</td></tr>
<tr><td>SS(3) 14 dpi</td><td>	Salivary sporozoite 3 (14 days post infection)</td></tr>
<tr><td>MS(1) 9 dpi</td><td>	Midgut sporozoite 1 (9 days post infection)</td></tr>
<tr><td>MS(2) 9 dpi</td><td>	Midgut sporozoite 2 (9 days post infection)</td></tr>
<tr><td>LS(1) 36 hpi</td><td>	Liver subtraction 1 (36 hours post infection)</td></tr>
<tr><td>LS(2) 40 hpi</td><td>	Liver subtraction 2 (40 hours post infection)</td></tr>
</table>
 </div>
</td>
</tr>
</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_winzeler_py_mixed'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<site:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Expression profile of blood stage, live stage, gametocyte, and sporozoite samples"
       attribution="winzeler_yoelii_falciparum_comparison_expression"/>

</c:if>

<c:if test="${binomial eq 'Plasmodium berghei'}">

<site:wdkTable tblName="TwoChannelDiffExpr" attribution="Agilent_P_Berghei_Array,Waters_arrayData,Waters_radAnalysis"/>

<%-- berghei expression --%>
<c:set var="secName" value="Waters::Ver1"/>
<c:set var="imgId" value="img${secName}"/>
<c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
<c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2"  class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="250" width="1"></td>
        <td class="centered">
          <div class="small">
             Induction/Repression
          </div>
        </td>
      </tr>

      <tr>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
          <div class="small">
             Expression levels
          </div>
        </td>
      </tr>

    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_waters'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <site:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="P. berghei expression"
               attribution="berghei_gss_oligos,berghei_oligo_gene_mapping,berghei_gss_time_series,P.berghei_wholeGenomeShotgunSequence,P.berghei_Annotation"/>


</c:if>

<%--</c:if><!-- this is for the test for new genes before aliases -->--%>

<site:pageDivider name="Sequence"/>
<font size ="-1">Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</font>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${attrs['protein_sequence'].value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<site:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
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
      <site:toggle name="workshopProteinSequence" displayName="${workshopProteinSequence.displayName}"
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
<site:toggle name="transcriptSequence"
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
      <site:toggle name="workshopTranscriptSequence"
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
    <site:toggle name="workshopCds" displayName="${workshopCds.displayName}"
                content="${workshopCdsContent}" isOpen="false"/>
    </td></tr>
  </table>
  </c:if>--%>

</c:if>

<!-- attribution -->


<hr>
<div align="center">
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
    <c:when test="${binomial eq 'Plasmodium falciparum' && (sequence_id eq 'Pf3D7_02' || sequence_id eq 'Pf3D7_10' || sequence_id eq 'Pf3D7_11' || sequence_id eq 'Pf3D7_14')}">

        <%-- P. falciparum 2, 10, 11, 14 = TIGR --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at 
        <a href="http://www.tigr.org/tdb/edb2/pfa1/htmls/">The Institute for Genomic Research</a>
        <br>and the <a href="http://www.nmrc.navy.mil/">Naval Medical Research Center</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && (sequence_id eq 'Pf3D7_01' || sequence_id eq 'Pf3D7_03' || sequence_id eq 'Pf3D7_04' || sequence_id eq 'Pf3D7_05' || sequence_id eq 'Pf3D7_06' || sequence_id eq 'Pf3D7_07' || sequence_id eq 'Pf3D7_08' || sequence_id eq 'Pf3D7_09' || sequence_id eq 'Pf3D7_13')}">
        <%-- P. falciparum 1, 3-9, 13 = Sanger --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at the 
        <a href="http://www.sanger.ac.uk/Projects/P_falciparum/">Sanger Institute</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && sequence_id eq 'Pf3D7_12'}">
        <%-- P. falciparum 12 = Stanford --%>
        <b>Chromosome ${sequence_id} of <i>P. falciparum</i> 3D7 was sequenced at the
        <a href="http://sequence-www.stanford.edu/group/malaria/">Stanford Genome Technology Center</a></b>.
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the Wellcome Trust Sanger Institute (WTSI) and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && sequence_id eq 'M76611'}">
        <%-- P. falciparum mitochondrial genome --%>
        <%--b>The <i>P. falciparum</i> mitochondrial sequence was retrieved from GenBank</b --%>
        <b>The <i>P. falciparum</i> mitochondrial genome was obtained from the Wellcome Trust Sanger Institute (WTSI).</b>
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the WTSI and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && sequence_id eq 'PFC10_API_IRAB'}">
        <%-- P. falciparum plastid genome --%>
        <b>The <i>P. falciparum</i> plastid genome was obtained from the Wellcome Trust Sanger Institute (WTSI).</b>
<br>The new annotation for <i>P. falciparum</i> 3D7 genome started in October 2007 with a week-long workshop co-organized by staff from the WTSI and the EuPathDB team. Ongoing annotation and error checking is being carried out by the GeneDB group from WTSI.
    </c:when>

    <c:when test="${binomial eq 'Plasmodium falciparum' && sequence_id eq 'AJ276844'}">
        <%-- P. falciparum mitochondrion = University of London --%>
        <b>The mitochondrial genome of <i>P. falciparum</i> was
        sequenced at the
        <a href="http://www.lshtm.ac.uk/pmbu/staff/dconway/dconway.html">London
        School of Hygiene & Tropical Medicine</a></b>
    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && (sequence_id eq 'X95275' || sequence_id eq 'X95276')}">

        <%-- P. falciparum plastid --%>
        <b>The <i>P. falciparum</i> plastid was
        sequenced at the 
        <a href="http://www.nimr.mrc.ac.uk/parasitol/wilson/">National
        Institute for Medical Research</a></b>

    </c:when>
    <c:when test="${binomial eq 'Plasmodium falciparum' && (sequence_id eq 'API_IRAB' || sequence_id eq 'PfNF54')}">
        <%-- new plastid sequences --%>
        <b>The new <i>P. falciparum</i> plastid and mitochondrial sequences were provided by GeneDB (WTSI). </b>
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

<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>
</c:otherwise>
</c:choose>

<site:footer/>
