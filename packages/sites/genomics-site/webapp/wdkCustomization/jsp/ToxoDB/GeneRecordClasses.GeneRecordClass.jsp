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
<imp:pageFrame title="${wdkModel.displayName} : gene ${id}"
			 refer="recordPage"
             divisionName="Gene Record"
             division="queries_tools">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
  </imp:pageFrame>
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

<imp:pageFrame title="${wdkModel.displayName} : gene ${id} (${prd})"
			 refer="recordPage"
             banner="${id}<br>${prd}"
             divisionName="Gene Record"
             division="queries_tools"
             summary="${overview.value}">

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
<%-- this block moves here so we can set a link to add a comment on the apge title --%>
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

<%--  TITLE  --------------------------%>
<%-- quick tool-box for the record --%>
<imp:recordToolbox />

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

        <%--${fn:length(wdkRecord.tables['CommunityExpComments'])}--%>


<c:set var="count" value="0"/>
<c:forEach var="row" items="${wdkRecord.tables['ToxoETennellaSuspects']}">
        <c:set var="count" value="${count +  1}"/>
</c:forEach>
<c:choose>
<c:when test="${count > 0}">
<br><span style="color:#CC0000;">This gene model is curently under revision.</span><br/>
</c:when>
</c:choose>

</div>

<%--- COMMUNITY EXPERT ANNOTATION -----------%>

<%--
<c:if test="${fn:length(wdkRecord.tables['CommunityExpComments']) gt 0}">
<div style="font-size:large; text-align:center; font-weight:bold"> 
<a href=<c:url value="showComment.do?projectId=${projectId}&stableId=${id}&commentTargetId=gene"/>>Community Annotation Available</a>
</div>
<br>
</c:if>
</a>

 
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


<%-- OVERVIEW ---------------%>

<c:set var="attr" value="${attrs['overview']}" />
<imp:panel attribute="${attr.name}"
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>


<%-- DNA CONTEXT ---------------%>

<c:set var="gtracks" value="${attrs['gtracks'].value}"/>

  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;l=${gtracks};width=640;embed=1;h_feat=${fn:toLowerCase(id)}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${fn:toLowerCase(id)}@yellow
    </c:set>
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

    <center><div id="${gnCtxDivId}"></div></center>
    
    <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
  </c:set>

  <imp:toggle 
    name="dnaContextSyn" displayName="Genomic Context" 
    dsLink=""
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution=""
  />

<%-- END DNA CONTEXT --------------------------------------------%>

<!-- strains comparison table -->
<imp:wdkTable tblName="Strains" isOpen="true"
               attribution=""/>

<!-- gene alias table -->
<imp:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>

<!-- snps between strains -->
<c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">
 <imp:wdkTable tblName="SNPs" isOpen="false" attribution=""/> 
 <imp:snpTable tblName="SNPsAlignment" isOpen="false" />
</c:if>


<!-- locations -->
<imp:wdkTable tblName="Genbank" isOpen="true"
               attribution="" />

<!-- previous version genes -->
<imp:wdkTable tblName="PreviousReleaseGenes" isOpen="true"
               attribution="" />


<c:if test="${externalDbName.value ne 'Roos Lab T. gondii apicoplast'}">
  <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

<c:set var="mercatorAlign">
  <imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                      contigId="${sequence_id}" start="${start}" end="${end}" bkgClass="secondary2" cellPadding="0"/>
</c:set>

<imp:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment of ${sequence_id} across available genomes"
  content="${mercatorAlign}"
  attribution=""/>

</c:if>

<imp:pageDivider name="Annotation"/>

<%-- moved above
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
--%>
<b><a title="Click to go to the comments page" style="font-size:120%" href="${commentsUrl}">Add a comment on ${id}
<img style="position:relative;top:2px" width="28" src="/assets/images/commentIcon12.png">
</a></b><br><br>

<c:catch var="e">
<imp:wdkTable tblName="UserComments"/>
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


<c:catch var="e">
  <imp:wdkTable tblName="TaskComments" isOpen="true"
                 attribution="" suppressColumnHeaders="true"/>
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


<!-- External Links --> 
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

  <imp:wdkTable tblName="EcNumber" isOpen="true"
                 attribution=""/>

  <imp:wdkTable tblName="GoTerms" isOpen="true"
                 attribution=""/>

<c:set var="externalDbName" value="${attrs['external_db_name']}"/>
<c:set var="externalDbVersion" value="${attrs['external_db_version']}"/>

<c:if test="${externalDbName.value eq 'Roos Lab T. gondii apicoplast'}">
  <imp:wdkTable tblName="Notes" isOpen="true"
	 	 attribution=""/>
</c:if>                 

  <imp:wdkTable tblName="MetabolicPathways" isOpen="true"
                 attribution=""/>

<imp:wdkTable tblName="Antibody" attribution=""/>
<c:set var="toxocyc" value="${attrs['ToxoCyc']}"/>

<!--
<imp:panel 
    displayName="ToxoCyc <a href='${toxocyc.url}'>View</a>"
    content="" />
-->

<c:if test="${isCodingGene}">
  <imp:pageDivider name="Protein"/>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
   <c:if test="${organism_full eq 'Toxoplasma gondii ME49'}">
    <c:set var="ptracks">
     WastlingMassSpecPeptides+MurrayMassSpecPeptides+EinsteinMassSpecPeptides+CarruthersMassSpecPeptides+MorenoMassSpecPeptides+TonkinMassSpecPeptides+SullivanMassSpecPeptides+BoothroydMassSpecPeptides+BoothroydOocystMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+LowComplexity+BLASTP 
    </c:set>
    </c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii GT1'}">
<c:set var="ptracks">
    BoothroydMassSpecPeptides+InterproDomains+SignalP+TMHMM+HydropathyPlot+LowComplexity+BLASTP 
    </c:set>
</c:if>
<c:if test="${organism_full eq 'Toxoplasma gondii VEG'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+HydropathyPlot+LowComplexity+BLASTP 
    </c:set>
</c:if>
<c:if test="${organism_full eq 'Neospora caninum'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+HydropathyPlot+LowComplexity+BLASTP 
    </c:set>
</c:if>
<c:if test="${organism_full eq 'Eimeria tenella str. Houghton'}">
<c:set var="ptracks">
     InterproDomains+SignalP+TMHMM+HydropathyPlot+LowComplexity+BLASTP 
    </c:set>
</c:if>


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
            <imp:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center></noindex>
    </c:set>

    <imp:toggle name="proteinFeatures" 
        displayName="Protein Features"
        content="${proteinFeaturesImg}"
        attribution=""/>
   <br>
</c:if>
</c:if>

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

    <imp:wdkTable tblName="Epitopes"/>

</c:if>

<imp:wdkTable tblName="MassSpec" isOpen="true"
               attribution=""/>



 <imp:wdkTable tblName="MassSpecMod" isOpen="true"
      attribution=""/> 


<imp:wdkTable tblName="PdbSimilarities" postscript="${attrs['pdb_blast_form'].value}" attribution=""/>

<imp:wdkTable tblName="Ssgcid" isOpen="true" attribution="" />

<c:if test="${attrs['hasSsgcid'].value eq '0' && attrs['hasPdbSimilarity'].value eq '0'}">
  ${attrs['ssgcid_request_link']}
</c:if>


<c:if test="${attrs['hasExpression'].value eq '1'}">
<imp:pageDivider name="Expression"/>

 <%-- ------------------------------------------------------------------ --%>

     <imp:expressionGraphs species="${genus_species}"/>
 <%-- ------------------------------------------------------------------ --%>

</c:if>

<imp:pageDivider name="Sequence"/>
<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>
<c:if test="${isCodingGene}">
<!-- protein sequence -->
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${proteinSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<imp:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
             content="${proteinSequenceContent}" isOpen="false"/>
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
</c:if>



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





<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

</imp:pageFrame>
</c:otherwise>
</c:choose>


<imp:pageLogger name="gene page" />
