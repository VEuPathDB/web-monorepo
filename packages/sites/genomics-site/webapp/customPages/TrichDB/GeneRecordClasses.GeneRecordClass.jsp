<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
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
<c:set var="organism" value="${attrs['organism'].value}"/>

<c:choose>
<c:when test="${organism eq null || !wdkRecord.validRecord}">
<site:header title="TrichDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             division="queries_tools" />
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>
<c:set var="extdbname" value="${attrs['external_db_name'].value}" />
<c:set var="contig" value="${attrs['sequence_id'].value}" />
<c:set var="context_start_range" value="${attrs['context_start'].value}" />
<c:set var="context_end_range" value="${attrs['context_end'].value}" />
<c:set var="binomial" value="${attrs['genus_species'].value}"/>

<c:set var="so_term_name" value="${attrs['so_term_name'].value}"/>
<c:set var="prd" value="${attrs['product'].value}"/>
<c:set var="overview" value="${attrs['overview']}"/>
<c:set var="length" value="${attrs['transcript_length']}"/>
<%-- display page header with recordClass type in banner --%>

<site:header title="TrichDB : gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             division="queries_tools" />
<br>
<%--#############################################################--%>

<h2>
<center>
${id} <br /> ${prd}
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

<!--
<c:if test="${attrs['cyc_gene_id'].value ne 'null'}">
  <c:set var="content">
    ${content}<br>
    ${attrs['cyc_db'].value}
  </c:set>
</c:if>

<site:panel 
    displayName="Links to Other Web Pages"
    content="${content}" />
<br>
-->

<%-- DNA CONTEXT ---------------------------------------------------%>

<c:set var="gtracks">
Gene+Repeat+EST+BLASTX
</c:set>

<c:set var="attribution">
T.vaginalis_scaffolds,T.vaginalis_Annotation
</c:set>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/trichdb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${id}@yellow
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
            http://${pageContext.request.serverName}/cgi-bin/gbrowse/trichdb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${id}@yellow
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

<%--- Notes --------------------------------------------------------%>

<c:set var="notes">
    <site:dataTable tblName="Notes" align="left" />
</c:set>

<c:if test="${notes ne 'none'}">
    <c:set var="append">
        <site:dataTable tblName="Notes" />
    </c:set>
    <site:panel 
        displayName="Notes"
        content="${append}" />
    <br>
</c:if>

<%--- Comments -----------------------------------------------------%>
<c:url var="commentsUrl" value="showAddComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
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

<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">
<p>
<table border='0' width='100%'><tr class="secondary3">
  <th align="center"><font face="Arial,Helvetica" size="+1">
  Protein Features
</font></th></tr></table>
<p>
</c:if>

<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding') || (attrs['so_term_name'].value eq 'repeat_region')}">

    <c:set var="ptracks">
    InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
    
    <c:set var="attribution">
    InterproscanData
    </c:set>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/trichdbaa/?name=${id};type=${ptracks};width=640;embed=1
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

<%-- EC ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding') || (attrs['so_term_name'].value eq 'repeat_region')}">


  <c:set var="attribution">
    enzymeDB,T.vaginalis_scaffolds,T.vaginalis_Annotation
  </c:set>

<site:wdkTable tblName="EcNumber" isOpen="true"
               attribution="${attribution}"/>

</c:if>

<%-- GO ------------------------------------------------------------%>
<c:if test="${(attrs['so_term_name'].value eq 'protein_coding') || (attrs['so_term_name'].value eq 'repeat_region')}">

<c:set var="attribution">
GO,InterproscanData,
T.vaginalis_scaffolds,T.vaginalis_Annotation
</c:set>

<site:wdkTable tblName="GoTerms" isOpen="true"
               attribution="${attribution}"/>

<br>
</c:if>
<%-- ORTHOMCL ------------------------------------------------------%>
<%--
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<c:set var="table">
    <site:dataTable tblName="Orthologs" />
<br>
<a href="http://orthomcl.cbil.upenn.edu/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&in=Keyword&q=${fn:substring(attrs['cyc_gene_id'].value, 0, 8)}"><font size='-2'>Find ${id} in OrthoMCL DB</font></a>
</c:set>

<c:set var="attribution">
</c:set>

<site:panel 
    displayName="Trichomonas Orthologs and Paralogs(<a href='http://orthomcl.cbil.upenn.edu'>OrthoMCL DB</a>)"
    content="${table}"
    attribution="${attribution}"/>
<br>
</c:if>
--%>


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
<c:set var="attr" value="${attrs['protein_sequence']}" />
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


<c:set var="reference">
<i>T. vaginalis</i> sequencing consortium: <br>
Carlton J. et. al. <b>Draft Genome Sequence of the Sexually Transmitted Pathogen <i>Trichomonas vaginalis</i>.</b>  
<a href="http://www.sciencemag.org/cgi/content/abstract/315/5809/207?ijkey=oB.4E566IyJLg&keytype=ref&siteid=sci" target="reference">Science <b>315</b>:207-212. Jan. 2007</a>
</c:set>

<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>
<hr>

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

