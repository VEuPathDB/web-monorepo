<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="id" value="${attrs['primaryKey'].value}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>

<c:set var="extdbname" value="${attrs['extdbname'].value}" />
<c:set var="contig" value="${attrs['contig'].value}" />
<c:set var="context_start_range" value="${attrs['context_start_range'].value}" />
<c:set var="context_end_range" value="${attrs['context_end_range'].value}" />

<%-- display page header with recordClass type in banner --%>
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

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

<site:header title="${wdkRecord.primaryKey}"
             bannerPreformatted="${bannerText}"
             divisionName="Gene Record"
             division="queries_tools"/>

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
<c:set var="attr" value="${attrs['otherInfo']}" />
<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" />
<br>

<%------------------------------------------------------------------%>
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
    
    <c:set var="externalDbName" value="${attrs['externalDbName']}"/>
    <c:set var="externalDbVersion" value="${attrs['externalDbVersion']}"/>
    
    <c:url var="commentsUrl" value="showAddComment.do">
    <c:param name="stableId" value="${id}"/>
    <c:param name="commentTargetId" value="gene"/>
    <c:param name="externalDbName" value="${externalDbName.value}" />
    <c:param name="externalDbVersion" value="${externalDbVersion.value}" />
    </c:url>
    
</c:set>
<site:panel 
    displayName="User Comments"
    content="${commentLegend}" />
<br>


<%-- DNA CONTEXT ---------------------------------------------------%>

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenyGene+MassSpecPeptides+BLASTX+Cluster+BLASTN
    </c:set>
</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="gtracks">
    Gene+SyntenyGene+MassSpecPeptides+BLASTX+Cluster+BLASTX+BLASTN
    </c:set>
</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="gtracks">
    Gene+MassSpecPeptides+BLASTX
    </c:set>
</c:when>
<c:otherwise>
    <c:set var="gtracks" value="" />
</c:otherwise>
</c:choose>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/mod-perl/gbrowse_img/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${wdkRecord.primaryKey}@yellow
    </c:set>
    <c:set var="genomeContextImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${genomeContextUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <site:embeddedError 
                msg="<font size='-2'>error accessing<br>'${genomeContextUrl}'</font>" 
                e="${e}" 
            />
        </c:if>
        </center>
        </noindex>
        
        <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
        <c:set var="gbrowseUrl">
            http://${pageContext.request.serverName}/mod-perl/gbrowse/cryptodb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${wdkRecord.primaryKey}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    </c:set>
    
    <site:panel 
        displayName="Genomic Context"
        content="${genomeContextImg}" />
    <br>
</c:if>
<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_type'].value eq 'CDS'}">

<c:choose>
<c:when test="${extdbname eq CPARVUMCONTIGS}">
    <c:set var="ptracks">
    MassSpecPeptides+PfamDomains+SignalP+TMHMM+HydropathyPlot+BLASTP
    </c:set>
</c:when>
<c:when test="${extdbname eq CHOMINISCONTIGS}">
    <c:set var="ptracks">
    MassSpecPeptides+PfamDomains+SignalP+TMHMM+HydropathyPlot+BLASTP
   </c:set>
</c:when>
<c:when test="${extdbname eq CPARVUMCHR6}">
    <c:set var="ptracks">
    MassSpecPeptides+PfamDomains+SignalP+TMHMM+HydropathyPlot+BLASTP
    </c:set>
</c:when>
<c:otherwise>
    <c:set var="ptracks" value="" />
</c:otherwise>
</c:choose>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/mod-perl/gbrowse_img/cryptodbaa/?name=${wdkRecord.primaryKey};type=${ptracks};width=640;embed=1
</c:set>

<c:if test="${ptracks ne ''}">
    <c:set var="proteinFeaturesImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${proteinFeaturesUrl}"/>
        </c:catch>
        <c:if test="${e!=null}">
            <site:embeddedError 
                msg="<font size='-2'>error accessing<br>'${proteinFeaturesUrl}'</font>" 
                e="${e}" 
            />
        </c:if>
        </center></noindex>
    </c:set>
    
    <site:panel 
        displayName="Predicted Protein Features"
        content="${proteinFeaturesImg}" />
    <br>
</c:if>
</c:if>
<%-- EC ------------------------------------------------------------%>
<c:if test="${extdbname ne CPARVUMCHR6 && attrs['so_type'].value eq 'CDS'}">

<c:set var="attr" value="${wdkRecord.tables['EcNumber']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="EcNumber" />
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}" />
<br>

</c:if>
<%-- PFAM ----------------------------------------------------------%>
<c:if test="${attrs['so_type'].value eq 'CDS'}">
<c:set var="attr" value="${wdkRecord.tables['PfamDomains']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="PfamDomains" />
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}" />
<br>
</c:if>
<%-- GO ------------------------------------------------------------%>
<c:if test="${attrs['so_type'].value eq 'CDS'}">
<c:set var="attr" value="${wdkRecord.tables['GoTerms']}" />
<c:set var="junk" value="${attr.close}"/>

<c:set var="table">
    <site:dataTable tblName="GoTerms" />
</c:set>

<site:panel 
    displayName="${attr.displayName}"
    content="${table}" />
<br>
</c:if>
<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${extdbname ne CPARVUMCHR6 && attrs['so_type'].value eq 'CDS'}">

<c:set var="table">
    <site:dataTable tblName="Orthologs" />
<br>
<a href="http://orthomcl.cbil.upenn.edu/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&in=Keyword&q=${fn:substring(attrs['protein_id'].value, 0, 8)}"><font size='-2'>Find ${wdkRecord.primaryKey} in OrthoMCL DB</font></a>
</c:set>

<site:panel 
    displayName="Cryptosporidium Orthologs and Paralogs(<a href='http://orthomcl.cbil.upenn.edu'>OrthoMCL DB</a>)"
    content="${table}" />
<br>
</c:if>
<%------------------------------------------------------------------%>
<c:if test="${attrs['so_type'].value eq 'CDS'}">
<c:set var="attr" value="${attrs['translation']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font>
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
    </font>
    </noindex>
</c:set>
<site:panel 
    displayName="${attr.displayName}"
    content="${seq}" />
<br>
<%------------------------------------------------------------------%>
<c:if test="${attrs['so_type'].value eq 'CDS'}">
<c:set var="attr" value="${attrs['cds']}" />
<c:set var="seq">
    <noindex> <%-- exclude htdig --%>
    <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
    </font>
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

<c:set var="citation" value="${attrs['citation'].value}" />
<c:if test="${citation eq 'CryptoDB'}">
    <c:set var="reference">
    ${reference}<br><br>Gene prediction/annotation by CryptoDB
    </c:set>
</c:if>

<site:panel 
    displayName="Attributions"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

       <jsp:include page="/include/footer.html"/>

<script type="text/javascript">
document.write(
  '<img alt="logo" src="/images/pix-white.gif?resolution='
   + screen.width + 'x' + screen.height + '" border="0">'
);
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>
