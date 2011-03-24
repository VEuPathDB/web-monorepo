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

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
<site:header title="AmoebaDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
		refer="recordPage" 
             divisionName="Gene Record"
             division="queries_tools" />

<h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>

<c:otherwise>
<c:set var="organism" value="${attrs['organism'].value}"/>
<c:set var="organism_full" value="${attrs['organism_full'].value}"/>

<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="binomial" value="${attrs['genus_species'].value}"/>

<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="strand" value="+"/>
<c:if test="${attrs['strand'].value == 'reverse'}">
  <c:set var="strand" value="-"/>
</c:if>



<%-- display page header with recordClass type in banner --%>

<site:header title="AmoebaDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             division="queries_tools" 
             refer="recordPage" />

<a name="top"></a>

<%-- quick tool-box for the record --%>
<site:recordToolbox />

<br>
<%--#############################################################--%>
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



<h2>
<center>
 	${id} <br /> <span style="font-size:80%">${prd}</span> <br/>

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

</center>
</h2>


<c:set var="append" value="" />


<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>

<c:set var="content">
${attrs['organism'].value}<br>
</c:set>


<%-- DNA CONTEXT ---------------------------------------------------%>

<c:choose>
  <c:when test='${organism_full eq "Entamoeba dispar SAW760"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansEhistolytica+SyntenyGenesEhistolytica+Repeat+EST+BLASTX
    </c:set>
  </c:when>
  <c:when test='${organism_full eq "Entamoeba histolytica HM-1:IMSS"}'>
    <c:set var="gtracks">
      Gene+SyntenySpansEdispar+SyntenyGenesEdispar+Repeat+EST+BLASTX
    </c:set> 
  </c:when>
  <c:when test='${organism_full eq "Entamoeba invadens IP1"}'>
    <c:set var="gtracks">
      Gene+Repeat+EST+BLASTX
    </c:set>
  </c:when>
</c:choose>

<c:set var="attribution">
E.histolytica_Annotations,E.dispar_Annotations,E.invadens_Annotations
</c:set>

<c:if test="${gtracks ne ''}">
  <c:set var="gnCtxUrl">
     /cgi-bin/gbrowse_img/amoebadb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow;genepage=1
  </c:set>

  <c:set var="gnCtxDivId" value="gnCtx"/>

  <c:set var="gnCtxImg">
    <center><div id="${gnCtxDivId}"></div></center>
    
    <c:set var="gbrowseUrl">
        /cgi-bin/gbrowse/amoebadb/?name=${contig}:${context_start_range}..${context_end_range};h_feat=${id}@yellow
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
</c:if>

<!-- gene alias table -->
<%-- <wdk:wdkTable tblName="Alias" isOpen="true" attribution=""/> --%>


<!-- Mercator / Mavid alignments -->

 <c:if test="${strand eq '-'}">
   <c:set var="revCompOn" value="1"/>
  </c:if>

<c:set var="mercatorAlign">
<site:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" revCompOn="${revCompOn}"
                    contigId="${contig}" start="${start}" end="${end}" bkgClass="rowMedium" cellPadding="0"
                    availableGenomes=""/>
</c:set>

<wdk:toggle isOpen="false"
  name="mercatorAlignment"
  displayName="Multiple Sequence Alignment"
  content="${mercatorAlign}"
  attribution=""/>






<site:pageDivider name="Annotation"/>
<%--- Notes --------------------------------------------------------%>

<c:if test="${notes ne 'none'}">
    <%--- wdk:wdkTable tblName="Notes" isOpen="true" / ---%>
</c:if>

<%--- Comments -----------------------------------------------------%>
<a name="user-comment"/>

<%--
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

<!-- External Links --> 
<wdk:wdkTable tblName="GeneLinkouts" isOpen="true" attribution=""/>

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


<%-- GO ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding') || (attrs['so_term_name'].value eq 'repeat_region')}">

<c:set var="attribution">
GO,InterproscanData
</c:set>

<wdk:wdkTable tblName="GoTerms" isOpen="true" attribution="${attribution}"/>

</c:if>


<!-- gene alias table -->
<wdk:wdkTable tblName="Alias" isOpen="FALSE" attribution=""/>


<%-- ORTHOMCL ------------------------------------------------------%>

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
  <c:set var="orthomclLink">
    <div align="center">
      <a href="http://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=${orthomcl_name}">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>
  <wdk:wdkTable tblName="Orthologs" isOpen="true" attribution="OrthoMCL" postscript="${orthomclLink}"/>

</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding') || (attrs['so_term_name'].value eq 'repeat_region')}">
  <site:pageDivider name="Protein"/>

<c:choose>
  <c:when test='${organism_full eq "Entamoeba dispar SAW760"}'>
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+BLASTP      
    </c:set>
  </c:when>
  <c:when test='${organism_full eq "Entamoeba histolytica HM-1:IMSS"}'>
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+BLASTP+HustonMassSpecPeptides+CarpentieriMassSpecPeptides
    </c:set>
  </c:when>
  <c:when test='${organism_full eq "Entamoeba invadens IP1"}'>
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
  </c:when>
</c:choose>

    <c:set var="attribution">
    InterproscanData
    </c:set>

<c:set var="proteinLength" value="${attrs['protein_length'].value}"/>
<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/amoebadbaa/?name=${id}:1..${proteinLength};type=${ptracks};width=640;embed=1;genepage=1
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
      <!-- ${proteinFeaturesUrl} -->

</c:if>
</c:if>

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

<%-- Expression Graphs ------------------------------------------------------%>

<c:if test="${binomial eq 'Entamoeba histolytica'}">
<site:pageDivider name="Expression"/>
  <site:expressionGraphs species="${binomial}" model="amoeba"/>
</c:if>




<%-- Sequence Data ------------------------------------------------------%>

<site:pageDivider name="Sequence"/>

<i>Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</i>

<p>

<%------------------------------------------------------------------%>
<!-- protein sequence -->

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="proteinSequence" value="${attrs['protein_sequence']}"/>
<c:set var="proteinSequenceContent">
  <pre><w:wrap size="60">${attrs['protein_sequence'].value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(proteinSequence.value)} aa</font><br/>
</c:set>
<wdk:toggle name="proteinSequence" displayName="${proteinSequence.displayName}"
             content="${proteinSequenceContent}" isOpen="false"/>
</c:if>
<%------------------------------------------------------------------%>

<!-- transcript sequence -->
<c:set var="attr" value="${attrs['transcript_sequence']}" />
<c:set var="transcriptSequence" value="${attrs['transcript_sequence']}"/>
<c:set var="transcriptSequenceContent">
  <pre><w:wrap size="60">${transcriptSequence.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(transcriptSequence.value)} bp</font><br/>
</c:set>
<wdk:toggle name="transcriptSequence"
             displayName="${transcriptSequence.displayName}"
             content="${transcriptSequenceContent}" isOpen="false"/>


<%------------------------------------------------------------------%>
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


<%------------------------------------------------------------------%>

<!-- CDS -->
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="cds" value="${attrs['cds']}"/>
<c:set var="cdsContent">
  <pre><w:wrap size="60">${cds.value}</w:wrap></pre>
  <font size="-1">Sequence Length: ${fn:length(cds.value)} bp</font><br/>
</c:set>
<wdk:toggle name="cds" displayName="${cds.displayName}"
             content="${cdsContent}" isOpen="false"/>

</c:if>
<%------------------------------------------------------------------%> 
<hr>

<c:choose>
<c:when test='${organism_full eq "Entamoeba dispar SAW760"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>E. dispar</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
  </c:set>
</c:when>
<c:when test='${organism_full eq "Entamoeba histolytica HM-1:IMSS"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>E. histolytica</i>HM-1:IMSS obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
  </c:set>
</c:when>
<c:when test='${organism_full eq "Entamoeba invadens IP1"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>E. invadens</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
  </c:set>
</c:when>
</c:choose>

<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>




<%--
<jsp:include page="/include/footer.html"/>
--%>


<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>


<site:footer/>

<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>

<site:pageLogger name="gene page" />
