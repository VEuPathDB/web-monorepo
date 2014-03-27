<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />

<c:choose>
<c:when test="${!wdkRecord.validRecord}">

<!-----------   ERROR ----------------------------------->

<imp:pageFrame title="${wdkModel.displayName} : gene ${id}"
             divisionName="Gene Record"
		         refer="recordPage" 
             division="queries_tools">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
</imp:pageFrame>
</c:when>
<c:otherwise>


<!--  SETTING ATTRIBUTES ****** 4 genedb-related attr only in plasmo and tritryp; 2 more missing in trich --------->

<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organismFull" value="${attrs['organism_full'].value}"/>
<c:set var="binomial" value="${attrs['genus_species'].value}"/>
<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>
<%-- only defined in plasmo, we need it in all sites
<c:set var="genedb_organism" value="${attrs['genedb_organism'].value}"/> 
--%>
<c:set var="isCodingGene" value="${so_term_name eq 'protein_coding'}"/>
<c:set var="async" value="${param.sync != '1'}"/>
<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="sequence_id" value="${attrs['sequence_id'].value}"/>
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>

<!-- COMMENTS attributes  -->
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


<%-- species used in expression and sequence sections --%>
<c:set var="species" value="${attrs['genus_species'].value}"/>

<!-- example values:
species:  	    Plasmodium falciparum
organism :    	P. falciparum 3D7
organismFull:   Plasmodium falciparum 3D7 
-->

<!-- =========================  HEADER ======================== -->

<imp:pageFrame title="${wdkModel.displayName} : gene ${id} (${prd})"
             divisionName="Gene Record"
		         refer="recordPage" 
             division="queries_tools"
             summary="${overview.value} (${length.value} bp)">

<a name="top"></a>


<!-- =========================  TOP MENU 4 OPTIONS, some genes ONLY 2  ========================= -->
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

  <c:if test="${attrs['hasExpression'].value eq '1'}">
  <td align="center"><a href="#Expression">Expression</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
  </c:if>

  <td align="center"><a href="#Sequence">Sequence</a>
     <img src="<c:url value='/images/arrow.gif'/>">
  </td>
</tr>
</table>

<hr>
<!-- =========================  PAGE BEGINNING: title and stuff under title  ========================= -->

<!-- this block is to set a link to add a comment  -->
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

<!------------ small div with: Download, show and hide all  ------------->
<imp:recordToolbox />

<!------------ BIG ID title  ------------->
<div class="h2center" style="font-size:150%">
  ${id} 
  <br><span style="font-size:70%">Product: ${prd} </span>

<!----------- Previous IDS  ----------------->
<c:if test="${attrs['old_ids'].value != null && attrs['old_ids'].value ne id }">
  <br><span style="font-size:70%">${attrs['OldIds'].value}</span><br>
</c:if>

<br>
<div>

<!----------- User Comments    ----------------->
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

<!----------- Basket and Favorites  ----------------->
<imp:recordPageBasketIcon />
</div>

<!-------------- Updated Product Name from GeneDB ---------------------------->

<%--  use genedb_organism when defined in all sites
<c:if test="${not empty genedb_organism}">
--%>
<c:if test="${projectId eq 'PlasmoDB' || projectId eq 'TriTrypDB'  }">
  <div style="margin:12px;padding:5px">
    <c:if test="${attrs['updated_annotation'].value != null}">
      ${attrs['GeneDB_updated'].value}
    </c:if>
    <c:if test="${attrs['new_product_name'].value != null}">
      <br><span style="font-size:75%">${attrs['GeneDB_New_Product'].value}</span>
    </c:if>
  </div>
</c:if>

</div>

<!--------------  NOTE on Unpublished data ----------------------->
<%-- Bindu should check this --%>

<c:if test="${projectId ne 'TrichDB' && attrs['is_annotated'].value == 0}">
  <c:choose>
  <c:when test="${attrs['release_policy'].value  != null}">
    <b>NOTE: ${attrs['release_policy'].value }</b>
  </c:when>
  <c:otherwise>
    <b>NOTE: The data for this genome is unpublished. You should consult with the Principal Investigators before undertaking large scale analyses of the annotation or underlying sequence.</b>
  </c:otherwise>
  </c:choose>
</c:if>



<%--##########################  SECTION  BEFORE ANNOTATION   ################################--%>

<%--- COMMUNITY EXPERT ANNOTATION -----------%>
<!--
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
-->


<%-- OVERVIEW ------------%>
<c:set var="attr" value="${attrs['overview']}" />
<imp:panel attribute="${attr.name}"
    displayName="${attr.displayName} ${has_namefun_comment}"
    content="${attr.value}${append}" />
<br>

<c:set var="dna_gtracks" value="${attrs['dna_gtracks'].value}"/>
<c:set var="protein_gtracks" value="${attrs['protein_gtracks'].value}"/>


<%-- DNA CONTEXT ------------%>
<c:if test="${dna_gtracks ne ''}">

  <c:set var="lowerProjectId" value="${fn:toLowerCase(projectId)}"/>
  <c:set var="gnCtxUrl"> /cgi-bin/gbrowse_img/${lowerProjectId}/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${dna_gtracks};width=640;embed=1;h_feat=${fn:toLowerCase(id)}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
		<c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/${lowerProjectId}/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${fn:toLowerCase(id)}@yellow
    </c:set>

    <center>
		    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
				<div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
				<div id="${gnCtxDivId}"></div>
		    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
				<div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
		</center>

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

<%-- === from toxo ===== --%>
<!-- strains comparison table -->
<imp:wdkTable2 tblName="Strains" isOpen="true"  attribution=""/>


<%---------- HTS SNP OVERVIEW --------- BASED ON ATTRIBUTE  ------%>
<c:if test="${attrs['hasHtsSnps'].value eq '1'}">
<c:set var="htsSNPs" value="${attrs['snpoverview']}" />
<imp:panel attribute="${htsSNPs.name}"
    displayName="${htsSNPs.displayName}"
    content="${htsSNPs.value}${append}" />
<br>
<imp:wdkTable2 tblName="SNPsAlignment" isOpen="false" /> 
</c:if>


<%-- === from toxo ===== --%>
<!-- locations -->
<imp:wdkTable2 tblName="Genbank" isOpen="true" attribution="" />



<%------------ eQTL regions ---------------%>
<%-- ******* not in Datasets  --%>
<%-- uneeded since table defines the organisms via datasets 
<c:if test="${organismFull eq 'Plasmodium falciparum 3D7'}">  
--%>
<c:set var="queryURL">
  showQuestion.do?questionFullName=GeneQuestions.GenesByEQTL_HaploGrpSimilarity&value%28lod_score%29=1.5&value%28percentage_sim_haploblck%29=25&value%28pf_gene_id%29=${id}&weight=10
</c:set>
<c:set var="extraInfo">
  <a id="assocQueryLink" href="${queryURL}"><font size='-2'>Other genes that have similar associations based on eQTL experiments</font></a><br><font size="-1">(<i>use right click or ctrl-click to open in a new window</i>)</font>
</c:set>
<imp:wdkTable2 tblName="Plasmo_eQTL_Table" isOpen="true"
               attribution="" postscript="${extraInfo}" />



<%------------- version 8.2 genes ------------%>
<imp:wdkTable2 tblName="PreviousReleaseGenes" isOpen="true"
               attribution="" />


<%----------- Mercator / Mavid alignments ------------%>
<%-- asked JB how to handle this: remove conditionals
- In crypto: it was done always
- In toxo: it was done for all BUT not for externalDbName.value:  'Roos Lab T. gondii apicoplast
          <c:if test="${externalDbName.value ne 'Roos Lab T. gondii apicoplast'}">
- in plasmo: it was done ONLY if externalDbName.value eq 'Pfalciparum_chromosomes_RSRC
--%>
<c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
</c:if>


<imp:mercatorTable tblName="MercatorTable" isOpen="false" 
     cgiUrl="/cgi-bin" projectId="${projectId}" 
     revCompOn="${revCompOn}" contigId="${sequence_id}" 
     start="${start}" end="${end}" /> 


<%-------COMMENT OUT FOR DEBUGGING: MetaTable --%> 
<imp:wdkTable2 tblName="MetaTable" isOpen="FALSE" attribution=""/>



<%--##########################   ANNOTATION      ################################--%>
<imp:pageDivider name="Annotation"/>


<!-- User comments -->
<a name="user-comment"/>

<b><a title="Click to go to the comments page" style="font-size:120%" href="${commentsUrl}">Add a comment on ${id}
<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a></b>

<br><br>

<c:catch var="e">
  <imp:wdkTable2 tblName="UserComments" />
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

<%--  ====== from toxo ====== --%>
<%--
<c:catch var="e">
--%>

<imp:wdkTable2 tblName="TaskComments" isOpen="true"
                 attribution="" suppressColumnHeaders="true"/>

<%-- handled in tag file
</c:catch>
<c:if test="${e != null}">
 <table  width="100%" cellpadding="3">
      <tr><td><b>Toxoplasma Genome Sequencing Project Annotation </b>
     <imp:embeddedError 
         msg="<font size='-1'><i>temporarily unavailable.</i></font>"
         e="${e}" 
     />
     </td></tr>
 </table>
</c:if>
--%>




<!-- Note for 3D7 -->
<c:if test="${organismFull eq 'Plasmodium falciparum 3D7'}">
  <div align="center">
      <i>The ${binomial} genome is not finished.  Please consult Plasmodium orthologs to support your conclusions.</i><br><br>
  </div>
</c:if> 
<br/>

<%---------- in old jsp there was a section on phenotype  commented out ------------%>

<!-- EC number -->
<a name="ecNumber"></a>
<c:if test="${isCodingGene}">
  <imp:wdkTable2 tblName="EcNumber" isOpen="false" attribution=""/>
</c:if>


<!-- metabolic pathways -->
<imp:wdkTable2 tblName="CompoundsMetabolicPathways" isOpen="true" attribution=""/>


<!-- External Links --> 
<imp:wdkTable2 tblName="GeneLinkouts" isOpen="true" attribution=""/>


<!-- Orthologs and Paralogs -->
<c:if test="${isCodingGene}">
  <c:set var="orthomclLink">
  <c:choose>
    <c:when test="${fn:contains( orthomcl_name, '|') }">
    <div>
    <br>Note: Genes in this table could not be mapped to OrthoMCL, but were grouped to each other based on blast similarity.
    </div>
    </c:when>
    <c:otherwise>
    <div>
    <br> <a target="_blank" href="<imp:orthomcl orthomcl_name='${orthomcl_name}'/>">View the group (${orthomcl_name}) containing this gene (${id}) in the OrthoMCL database</a>
    </div>
    </c:otherwise>
  </c:choose>
  </c:set>

  <imp:wdkTable2 tblName="Orthologs" isOpen="false" attribution=""
                 postscript="${orthomclLink}"/>
</c:if>


<!-- GO TERMS -->
<c:if test="${isCodingGene}">
  <a name="goTerm"></a>
  <imp:wdkTable2 tblName="GoTerms" attribution=""/>
</c:if>


<!-- gene alias table -->
<imp:wdkTable2 tblName="Alias" isOpen="FALSE" attribution=""/>


<!-- Notes from annotator == in toxo only shown if externalDbName.value eq 'Roos Lab T. gondii apicoplast-->
<imp:wdkTable2 tblName="Notes" attribution=""/>


<%-- unneeded since table appears associated to specific organisms 
<c:if test="${organismFull eq 'Plasmodium falciparum 3D7' || species eq 'Plasmodium berghei' || species eq 'Plasmodium yoelii'}">
--%>

<!-- phenotype -->
<imp:wdkTable2 tblName="RodMalPhenotype" isOpen="false"  attribution=""/>


<!-- Hagai -->
<%-- ******* not in Datasets  --%>
<c:if test="${isCodingGene}">
  <imp:wdkTable2 tblName="MetabolicPathways" attribution=""/>
</c:if>


<!-- plasmocyc -->
<c:if test="${projectId eq 'PlasmoDB'}">
  <c:set var="plasmocyc" value="${attrs['PlasmoCyc']}"/>  
  <c:set var="plasmocycurl" value="${plasmocyc.url}"/>  
  <imp:panel 
    displayName="PlasmoCyc <a href='${plasmocycurl}'>View</a>"
    content="" />
</c:if>


<%-- *******  not in crypto  ******* not in Datasets --%>
<imp:wdkTable2 tblName="Mr4Reagents" attribution=""/>


<%-- was already commented out
<imp:wdkTable2 tblName="AnnotationChanges"/>
--%>


<%--##########################   PROTEIN      ################################--%>

<c:if test="${isCodingGene}">
  
<imp:pageDivider name="Protein"/>


<%-- Protein Features------------%>
<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
   http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/${lowerProjectId}aa/?name=${id}:1..${proteinLength};l=${protein_gtracks};hmap=pbrowse;width=640;embed=1;genepage=1
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
            e="${e}" />
    </c:if> 
    </center></noindex>
  </c:set>

  <imp:toggle name="proteinContext"  displayName="Protein Features" 
                content="${proteinFeaturesImg}" 
                attribution=""/>
</c:if> 


<%-- Y2Hinteractions ------------%>
<%-- uneeded since table defines the organisms via datasets
  <c:if test="${organismFull eq 'Plasmodium falciparum 3D7'}">
--%>
<imp:wdkTable2 tblName="Y2hInteractions" isOpen="true" attribution=""/>


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


<!-- Mass Spec -->
<c:if test="${attrs['hasProteomics'].value eq '1'}">
 <imp:wdkTable2 tblName="MassSpec" isOpen="true"   attribution=""/>
</c:if>


<!-- Mass Spec Post Trans Mods -->
<c:if test="${attrs['hasPostTransMod'].value ne '0'}">
 <imp:wdkTable2 tblName="MassSpecMod" isOpen="true"   attribution=""/>
</c:if>


<%-- Pberghei Prot Expression   ******* not in Datasets   --%>
<%-- unneeded since table will define the organisms 
<c:if test="${binomial eq 'Plasmodium berghei'}">
--%>
<imp:wdkTable2 tblName="ProteinExpression" attribution=""/>


<%--  Protein Linkouts    ******** not in Crypto ******* not in Datasets  --%>
<imp:wdkTable2 tblName="ProteinDatabase"/>


<!-- PdbSimilarities -->
<imp:wdkTable2 tblName="PdbSimilarities" postscript="${attrs['pdb_blast_form'].value}" attribution=""/>


<!-- SSGCID  ******* not in Datasets because we do not load the dataset -->
<c:if test="${attrs['hasSsgcid'].value eq '1'}">
  <imp:wdkTable2 tblName="Ssgcid" isOpen="true" attribution="" />
</c:if>

<!-- SSGCID Note  -->
<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>


<!-- Antibody ***** only crypto? toxo too but shown under GoTerms  ****** not in Datasets -->
<imp:wdkTable2 tblName="Antibody" attribution="" />


<!-- 3D struct predictions ==== only 3D7   -->
<%-- ******* not in Datasets  --%>
<%-- unneeded since table will define the organisms 
<c:if test="${organismFull eq 'Plasmodium falciparum 3D7'}">
--%>
<imp:wdkTable2 tblName="3dPreds" attribution=""/>


<!-- Epitopes -->
<imp:wdkTable2 tblName="Epitopes"/>


</c:if> <%-- end if isCodingGene --%>




<%--##########################   EXPRESSION      ################################--%>


<c:if test="${attrs['hasExpression'].value eq '1'}">

  <imp:pageDivider name="Expression"/>

  <imp:expressionGraphs organism="${organismFull}" species="${binomial}"/>

<%-- unneeded since table will define the organisms 
  <c:if test="${organismFull eq 'Plasmodium falciparum 3D7'}">
--%>
  <imp:wdkTable2 tblName="SageTags" attribution=""/>

</c:if>


<%--##########################  HOST RESPONSE      ################################--%>
<c:if test="${attrs['hasHostResponse'].value eq '1'}">
  <imp:pageDivider name="Host Response"/>
  <imp:profileGraphs species="${binomial}" tableName="HostResponseGraphs"/>

</c:if>

 

<%--##########################   SEQUENCE     ################################--%>

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
    <c:set var="reference" value="${row['description'].value}"/>
</c:forEach>


<imp:panel 
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
