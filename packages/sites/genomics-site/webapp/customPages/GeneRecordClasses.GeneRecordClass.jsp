<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="id" value="${attrs['primaryKey'].value}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>
<c:set var="CGI_OR_MOD" value="${props['CGI_OR_MOD']}"/>

<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="genus_species" value="${attrs['genus_species'].value}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/>
<c:set var="strand" value="${attrs['strand_plus_minus'].value}"/>

<%-- display page header with recordClass type in banner --%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var="snps">
    <site:dataTable tblName="SNPs" />
</c:set>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+3">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+3" face="Arial,Helvetica">
          <b>${wdkRecord.primaryKey}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>
<%--
<site:header title="${wdkRecord.primaryKey}"
             bannerPreformatted="${bannerText}"
             divisionName="Gene Record"
             division="queries_tools"/>
--%>
<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${wdkRecord.primaryKey} was not found.
  <br>
  <hr>
</c:when>
<c:otherwise>

<br>
<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="notes">
    <site:dataTable tblName="Notes" align="left" />
</c:set>

<c:if test="${notes ne 'none'}">
    <c:set var="append">
        ${append}<br><br><site:dataTable tblName="Notes" />
    </c:set>
</c:if>

<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append}" />
<br>

<%------------------------------------------------------------------%>

<c:set var="attr" value="${attrs['product']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />
<br>
<%------------------------------------------------------------------%>
<c:set var="content">
<a href="http://apicyc.apidb.org/${attrs['cyc_db'].value}/new-image?type=GENE-IN-CHROM-BROWSER&object=${wdkRecord.primaryKey}">CryptoCyc Metabolic Pathway Database</a>
<br>
${attrs['linkout'].value}
</c:set>

<c:if test="${attrs['pdb_id'].value ne 'null'}">
  <c:set var="content">
    ${content}<br>
    <a href="http://www.sgc.utoronto.ca/SGC-WebPages/StructureDescription/${attrs['pdb_id'].value}.php">Structural Genomics Consortium 3D Structure</a>
  </c:set>
</c:if>

<site:panel 
    displayName="Links to Other Web Pages"
    content="${content}" />
<br>

<%------------------------------------------------------------------%>
<c:url var="commentsUrl" value="showAddComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${genus_species}" />
</c:url>
<c:set var='commentLegend'>
    <c:catch var="e">
      <site:dataTable tblName="UserComments"/>
      <a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
    </c:catch>
    <c:if test="${e != null}">
     <site:embeddedError 
         msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
         e="${e}" 
     />
    </c:if>
    
</c:set>
<site:panel 
    displayName="User Comments"
    content="${commentLegend}" />
<br>


<%-- DNA CONTEXT ---------------------------------------------------%>
<c:if test="${snps ne 'none'}">
    <c:set var="snptrack" value="SNPs+"/>
</c:if>

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenyHominis+SyntenySpanParvumChr6+SyntenySpanHominis+SyntenySpanMuris+${snptrack}WastlingMassSpecPeptides+LoweryMassSpecPeptides+EinsteinMassSpecPeptides+BLASTX+Cluster
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec,CryptoLoweryLCMSMSInsolExcystedMassSpec,
    CryptoLoweryLCMSMSInsolNonExcystedMassSpec,CryptoLoweryLCMSMSSolMassSpec
    </c:set>

</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenyParvum+SyntenySpanParvum+SyntenySpanMuris+BLASTX+Cluster+BLASTX+BLASTN
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs
    </c:set>

</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="gtracks">
    Gene+SyntenyHominis+SyntenySpanParvum+SyntenySpanHominis+SyntenySpanMuris+WastlingMassSpecPeptides+EinsteinMassSpecPeptides+BLASTX
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="gtracks" value="" />
</c:otherwise>
</c:choose>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse_img/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${wdkRecord.primaryKey}@yellow
    </c:set>
    <c:set var="genomeContextImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${genomeContextUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <site:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center>
        </noindex>
        
        <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
        <c:set var="gbrowseUrl">
            http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${wdkRecord.primaryKey}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    </c:set>

    <site:panel 
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}"/>
     <!-- ${genomeContextUrl} -->
    <br>
</c:if>

<%-- SNPs  ---------------------------------------------------%>

<%-- snps dataTable defined above --%>
<c:if test="${snps ne 'none'}">
<site:panel 
    displayName="SNPs Summary"
    content="${snps}" 
    attribution="Widmer_SNPs" />
</c:if>


<%-- Mercator/Mavid form ---------------------------------------------------%>

<c:if test="${strand eq '-'}">
 <c:set var="revCompOn" value="1"/>
</c:if>

<c:set var="mavid">
<site:mercatorMAVID cgiUrl="${CGI_URL}" projectId="${wdkRecord.primaryKey.projectId}" 
                    revCompOn="${revCompOn}"
                    contigId="${contig}" start="${start}" end="${end}" 
                    bkgClass="secondary3" cellPadding="0"/>
</c:set>
<site:panel 
    displayName="MAVID/Mercator Alignments"
    content="${mavid}" 
/>


<%-- Protein Features ---------------------------------------------------%>

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<p>
<table border='0' width='100%'><tr class="secondary3">
  <th align="center"><font face="Arial,Helvetica" size="+1">
  Protein Features
</font></th></tr></table>
<p>
</c:if>

<%-- EC ------------------------------------------------------------%>
<c:if test="${extdbname ne CPARVUMCHR6 && attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="attr" value="${wdkRecord.tables['EcNumber']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="EcNumber" />
</c:set>

<c:set var="attribution">
enzymeDB,CparvumEC-KEGG,ChominisEC-KEGG,CparvumEC-CryptoCyc,ChominisEC-CryptoCyc
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}"
    attribution="${attribution}" />
<br>

</c:if>
<%-- PFAM ----------------------------------------------------------%>
<%--<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${wdkRecord.tables['PfamDomains']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="PfamDomains" />
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}" />
<br>
</c:if>--%>
<%-- GO ------------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${wdkRecord.tables['GoTerms']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="GoTerms" />
</c:set>

<c:set var="attribution">
GO,InterproscanData,
CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}"
    attribution="${attribution}"/>
<br>
</c:if>
<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${extdbname ne CPARVUMCHR6 && attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="table">
    <site:dataTable tblName="Orthologs" />
<br>
<a href="http://orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&in=Accession&q=${wdkRecord.primaryKey}"><font size='-2'>Find ${wdkRecord.primaryKey} in OrthoMCL DB</font></a>
</c:set>

<c:set var="attribution">
</c:set>

<site:panel 
    displayName="Cryptosporidium Orthologs and Paralogs(<a href='http://orthomcl.org'>OrthoMCL DB</a>)"
    content="${table}"
    attribution="${attribution}"/>
<br>
</c:if>

<%-- EPITOPES ------------------------------------------------------%>
<c:if test="${extdbname ne CHOMINISCONTIGS && attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${wdkRecord.tables['Epitopes']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="Epitopes" />
</c:set>

<c:set var="attribution">
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}"
    attribution="${attribution}" />
<br>
</c:if>

<%-- Isolate Overlap  ------------------------------------------------------%>
<c:if test="${extdbname ne CHOMINISCONTIGS && attrs['so_term_name'].value eq 'protein_coding'}">
<c:set var="attr" value="${wdkRecord.tables['IsolateOverlap']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="IsolateOverlap" />
</c:set>

<c:set var="attribution">
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}"
    attribution="${attribution}" />
<br>
</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+WastlingMassSpecPeptides+LoweryMassSpecPeptides+EinsteinMassSpecPeptides+BLASTP
    </c:set>
    
    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec,CryptoLoweryLCMSMSInsolExcystedMassSpec,
    CryptoLoweryLCMSMSInsolNonExcystedMassSpec,CryptoLoweryLCMSMSSolMassSpec
    InterproscanData
    </c:set>

</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+BLASTP
   </c:set>
    
    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    InterproscanData
    </c:set>

</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+WastlingMassSpecPeptides+EinsteinMassSpecPeptides+BLASTP
    </c:set>
    
    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec
    InterproscanData
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="ptracks" value="" />
</c:otherwise>
</c:choose>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse_img/cryptodbaa/?name=${wdkRecord.primaryKey};type=${ptracks};width=640;embed=1
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

    <site:panel 
        displayName="Predicted Protein Features"
        content="${proteinFeaturesImg}"
        attribution="${attribution}"/>
      <!-- ${proteinFeaturesUrl} -->
   <br>
</c:if>
</c:if>

<p>
<table border='0' width='100%'><tr class="secondary3">
  <th align="center"><font face="Arial,Helvetica" size="+1">
  Sequences
</font></th></tr>
<tr><td><font size ="-1">Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</font></td></tr>
</table>
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
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
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
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
<%------------------------------------------------------------------%>
<c:set value="${wdkRecord.tables['GeneModel']}" var="geneModelTable"/>

<c:set var="i" value="0"/>
<c:forEach var="row" items="${geneModelTable.visibleRows}">
  <c:set var="totSeq" value="${totSeq}${row['sequence'].value}"/>
  <c:set var="i" value="${i +  1}"/>
</c:forEach>

<c:set var="seq">
    <font class="fixed">
    <w:wrap size="60" break="<br>">${totSeq}</w:wrap>
    </font><br/><br/>
  <font size="-1">Sequence Length: ${fn:length(totSeq)} bp</font><br/>
    </noindex>
</c:set>
<site:panel 
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />
<br>

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
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
</c:if>
<%------------------------------------------------------------------%> 

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="reference">
Abrahamsen MS, Templeton TJ, Enomoto S, Abrahante JE, Zhu G, Lancto CA, 
Deng M, Liu C, Widmer G, Tzipori S, Buck GA, Xu P, Bankier AT, Dear PH, 
Konfortov BA, Spriggs HF, Iyer L, Anantharaman V, Aravind L, Kapur V. 
<b>Complete genome sequence of the apicomplexan, <i>Cryptosporidium parvum</i>.</b> 
Science. 2004 Apr 16;<a href="http://www.sciencemag.org/cgi/content/full/304/5669/441"><b>304</b>(5669):441-5</a>.
    </c:set>
</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="reference">
Xu P, Widmer G, Wang Y, Ozaki LS, Alves JM, Serrano MG, Puiu D, Manque P, 
Akiyoshi D, Mackey AJ, Pearson WR, Dear PH, Bankier AT, Peterson DL, 
Abrahamsen MS, Kapur V, Tzipori S, Buck GA. 
<b>The genome of <i>Cryptosporidium hominis</i>.</b> 
Nature. 2004 Oct 28;<a href="http://www.nature.com/nature/journal/v431/n7012/abs/nature02977.html"><b>431</b>(7012):1107-12</a>.
    </c:set>
</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="reference">
Bankier AT, Spriggs HF, Fartmann B, Konfortov BA, Madera M, Vogel C, 
Teichmann SA, Ivens A, Dear PH. 
<b>Integrated mapping, chromosomal sequencing and sequence analysis of <i>Cryptosporidium parvum</i>. 
</b>Genome Res. 2003 Aug;<a href="http://www.genome.org/cgi/content/full/13/8/1787">13(8):1787-99</a>
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="reference" value="${extdbname}" />
</c:otherwise>
</c:choose>

<c:if test="${fn:containsIgnoreCase(notes, 'cryptodb update')}">
    <c:set var="reference">
    ${reference}<br><br>Additional gene prediction/annotation by CryptoDB.
    </c:set>
</c:if>

<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>
<hr>
<%--<c:import url="http://${pageContext.request.serverName}/include/footer.html"/>--%>

<%--<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
--%>
<%--<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>--%>
