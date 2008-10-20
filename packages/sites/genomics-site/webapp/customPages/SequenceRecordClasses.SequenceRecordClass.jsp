<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>
<c:set var="CMURISCONTIGS" value="${props['CMURISCONTIGS']}"/>
<c:set var="CGI_OR_MOD" value="${props['CGI_OR_MOD']}"/>

<c:set var="SRT_CONTIG_URL" value="/cgi-bin/contigSrt"/>
<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>

<c:set var="externalDbName" value="${attrs['externalDbName'].value}" />


<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
      <c:if test="${wdkRecord.attributes['organism'].value ne 'null'}">
          <font face="Arial,Helvetica" size="+3">
          <b>${wdkRecord.attributes['organism'].value}</b>
          </font> 
          <font size="+3" face="Arial,Helvetica">
          <b>${id}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="${id}"
             bannerPreformatted="${bannerText}"
             divisionName="Genomic Sequence Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq 'null'}">
  <br>
  ${id} was not found.
  <br>
  <hr>
</c:when>
<c:otherwise>

<br>
<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />
<br>

<%------------------------------------------------------------------%>
<c:choose><c:when test="${externalDbName eq CPARVUMCONTIGS or externalDbName eq CHOMINISCONTIGS}">
  <c:set var="externalLinks">
  <a href="http://apicyc.apidb.org/${wdkRecord.attributes['cyc_db'].value}/new-image?object=${id}">CryptoCyc Metabolic Pathway Database</a><br>
  <a href="http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=${wdkRecord.attributes['secondary_identifier'].value}">GenBank Record</a><br>
  <a href="showSummary.do?questionFullName=GeneQuestions.GenesByLocation&myProp%28chromosomeOptional%29=choose+one&myProp%28sequenceId%29=${id}&myProp%28start_point%29=1&myProp%28end_point%29=0">Lookup Genes on this Contig</a><br>
  </c:set>
</c:when></c:choose>

<c:set var="content">
${externalLinks}
<form action="${SRT_CONTIG_URL}" method="GET">
 <table border="0" cellpadding="0" cellspacing="1">
  <tr class="secondary3"><td>
  <table border="0" cellpadding="0">
    <tr><td colspan="2"><h3>Retrieve this Contig with the Sequence Retrieval Tool</h3>
      <input type='hidden' name='ids' size='20' value="${id}" />
      <input type='hidden' name='project_id' size='20' value="${projectId}" />
    </td></tr>
    <tr><td colspan="2"><b>Nucleotide positions:</b> &nbsp;&nbsp;
        <input type="text" name="start" value="1" maxlength="10" size="10" />
     to <input type="text" name="end"   value="${attrs['length'].value}" maxlength="10" size="10" />
     &nbsp;&nbsp;&nbsp;&nbsp;
         <input type="checkbox" name="revComp" ${initialCheckBox}>Reverse & Complement
    </td></td>
    <tr><td><input type="submit" name='go' value='Get Sequence' /></td></tr>
  </table>
  </td></tr>
 </table>
</form>

<br />

    <site:mercatorMAVID cgiUrl="${CGI_URL}" projectId="${projectId}" contigId="${id}"
                        start="1" end="${attrs['length'].value}" bkgClass="secondary3" cellPadding="0"/>
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${content}" />
<br>

<%------------------------------------------------------------------%>
<c:url var="commentsUrl" value="showAddComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="genome"/>
  <c:param name="externalDbName" value="${attrs['externalDbName'].value}" />
  <c:param name="externalDbVersion" value="${attrs['externalDbVersion'].value}" />
</c:url>
<c:set var='commentLegend'>
    <c:catch var="e">
      <site:dataTable tblName="SequenceComments"/>
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
<c:choose>
<c:when test="${externalDbName eq CPARVUMCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenySpanHominis+SyntenySpanMuris+WastlingMassSpecPeptides+LoweryMassSpecPeptides+EST+Cluster

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec,CryptoLoweryLCMSMSInsolExcystedMassSpec,
    CryptoLoweryLCMSMSInsolNonExcystedMassSpec,CryptoLoweryLCMSMSSolMassSpec
    </c:set>

    </c:set>
</c:when>
<c:when test="${externalDbName eq CHOMINISCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenySpanParvum+SyntenySpanMuris+EST+Cluster
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs
    </c:set>

</c:when>
<c:when test="${externalDbName eq CPARVUMCHR6}">
    <c:set var="gtracks">
    Gene+SyntenySpanParvum+SyntenySpanHominis+SyntenySpanMuris+WastlingMassSpecPeptides+EST+Cluster
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs,
    Wastling2DGelLSMassSpec,Wastling1DGelLSMassSpec,WastlingMudPitSolMassSpec,
    WastlingMudPitInsolMassSpec
    </c:set>

</c:when>
<c:when test="${externalDbName eq CMURISCONTIGS}">
    <c:set var="gtracks">
    SyntenySpanParvum+SyntenyParvum+SyntenySpanHominis+EST
    </c:set>

    <c:set var="attribution">
    CparvumContigs,ChominisContigs,CparvumChr6Scaffold,CparvumESTs
    </c:set>

</c:when>
<c:otherwise>
    <c:set var="gtracks" value="" />
</c:otherwise>
</c:choose>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/mod-perl/gbrowse_img/cryptodb/?name=${id}:1..100000;hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow
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
            http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse/cryptodb/?name=${id}:1..10000;label=${labels};h_feat=${id}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    </c:set>
    
    <site:panel 
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}" />
    <br>
</c:if>

<br>

<%------------------------------------------------------------------%>

<c:choose>
<c:when test="${externalDbName eq CPARVUMCONTIGS}">
    <c:set var="reference">
Abrahamsen MS, Templeton TJ, Enomoto S, Abrahante JE, Zhu G, Lancto CA, 
Deng M, Liu C, Widmer G, Tzipori S, Buck GA, Xu P, Bankier AT, Dear PH, 
Konfortov BA, Spriggs HF, Iyer L, Anantharaman V, Aravind L, Kapur V. 
<b>Complete genome sequence of the apicomplexan, <i>Cryptosporidium parvum</i>.</b> 
Science. 2004 Apr 16;<a href="http://www.sciencemag.org/cgi/content/full/304/5669/441"><b>304</b>(5669):441-5</a>.
    </c:set>
</c:when>
<c:when test="${externalDbName eq CHOMINISCONTIGS}">
    <c:set var="reference">
Xu P, Widmer G, Wang Y, Ozaki LS, Alves JM, Serrano MG, Puiu D, Manque P, 
Akiyoshi D, Mackey AJ, Pearson WR, Dear PH, Bankier AT, Peterson DL, 
Abrahamsen MS, Kapur V, Tzipori S, Buck GA. 
<b>The genome of <i>Cryptosporidium hominis</i>.</b> 
Nature. 2004 Oct 28;<a href="http://www.nature.com/nature/journal/v431/n7012/abs/nature02977.html"><b>431</b>(7012):1107-12</a>.
    </c:set>
</c:when>
<c:when test="${externalDbName eq CPARVUMCHR6}">
    <c:set var="reference">
Bankier AT, Spriggs HF, Fartmann B, Konfortov BA, Madera M, Vogel C, 
Teichmann SA, Ivens A, Dear PH. 
<b>Integrated mapping, chromosomal sequencing and sequence analysis of <i>Cryptosporidium parvum</i>. 
</b>Genome Res. 2003 Aug;<a href="http://www.genome.org/cgi/content/full/13/8/1787">13(8):1787-99</a>
    </c:set>
</c:when>
<c:when test="${externalDbName eq CMURISCONTIGS}">
    <c:set var="reference">
The Cryptosporidium muris genome sequencing project has been funded by the
National Institute of Allergy and Infections Diseases (NIAID), through the
Microbial Sequencing Center program at the Institute for Genomic Research
(TIGR). 
</c:set>
</c:when>
<c:otherwise>
    <c:set var="reference" value="${externalDbName}" />
</c:otherwise>
</c:choose>

<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<c:import url="http://${pageContext.request.serverName}/include/footer.html"/>

<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>
