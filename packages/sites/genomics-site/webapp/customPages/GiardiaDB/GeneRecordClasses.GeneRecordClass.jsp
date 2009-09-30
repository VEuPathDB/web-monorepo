<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="organism" value="${attrs['organism'].value}"/>

<c:set var="start" value="${attrs['start_min_text'].value}"/>
<c:set var="end" value="${attrs['end_max_text'].value}"/> 
<c:set var="orthomcl_name" value="${attrs['orthomcl_name'].value}"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}"/> 

<c:choose>
<c:when test="${wdkRecord.attributes['organism'].value eq null || !wdkRecord.validRecord}">
<site:header title="GiardiaDB: gene ${id} (${prd})"
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
<c:set var="tree_source_id" value="${attrs['phyTreeId'].value}"/>
<c:set var="tree_applet" value="${attrs['tree_applet_link'].value}"/>
<%-- display page header with recordClass type in banner --%>

<c:set var="async" value="${param.sync != '1'}"/>

<site:header title="GiardiaDB: gene ${id} (${prd})"
             summary="${overview.value} (${length.value} bp)"
             divisionName="Gene Record"
             division="queries_tools" />

<br>
<%--#############################################################--%>

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

<c:set var="append" value="" />


<c:set var="attr" value="${attrs['overview']}" />
<c:if test="${attrs['is_deprecated'].value eq 'Yes'}">
   <c:set var="isdeprecated">
     **<b>Deprecated</b>**
   </c:set>
</c:if>

<site:panel 
    displayName="${attr.displayName}"
    content="${attr.value}${append} ${isdeprecated}" />
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
<%-- Alternate Gene Models are taking time and hence are being avoided in the record page --%>
<%-- Contigs+Gene+DeprecatedGene+UnifiedMassSpecPeptides+SAGEtags+EST+BLASTX --%>
Contigs+Gene+UnifiedMassSpecPeptides+SAGEtags+EST+BLASTX
</c:set>

<c:set var="attribution">
G.lamblia_contigsGB
</c:set>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/giardiadb/?name=${contig}:${context_start_range}..${context_end_range};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${wdkRecord.primaryKey}@yellow
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
            http://${pageContext.request.serverName}/cgi-bin/gbrowse/giardiadb/?name=${contig}:${context_start_range}..${context_end_range};label=${labels};h_feat=${wdkRecord.primaryKey}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
    </c:set>

    <site:toggle 
        displayName="Genomic Context"
        content="${genomeContextImg}"
        isOpen="true"
        name="Genomic Context"
        attribution="${attribution}"/>
    <br>
</c:if>

<%-- Gene Location ------------------------------------------------------%>
<site:wdkTable tblName="Genbank" isOpen="true"
               attribution=""/>

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
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="gene"/>
  <c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
  <c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
  <c:param name="organism" value="${binomial}" />
  <c:param name="locations" value="${fn:replace(start,',','')}-${fn:replace(end,',','')}" />
  <c:param name="contig" value="${contig}" />
  <c:param name="flag" value="0" /> 
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

<c:if test="${tree_source_id ne null}">
  <c:set var='treeLink'>
    ${tree_applet} against RefEuks database
  </c:set>
  <site:panel 
      displayName="Phylogenetic Tree"
      content="${treeLink}" />
</c:if>
<br>

<%-- ORTHOMCL ------------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

  <c:set var="orthomcl_content">
    <site:dataTable tblName="Orthologs" />
     <div align="center">
      <a href="http://beta.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&in=Accession&q=${id}">Find the group containing ${id} in the OrthoMCL database</a>
    </div>
  </c:set>

  <site:panel displayName="Orthologs and Paralogs within ${projectId}"
              content="${orthomcl_content}"/>

</c:if>
<br>

<%-- Microarray Data ------------------------------------------------------%>

  <site:pageDivider name="Expression"/>


  <c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>


  <c:set var="secName1" value="Stress::Ver1"/>
  <c:set var="secName2" value="StressPercentile::Ver1"/>

  <c:set var="imgSrc1" value="${plotBaseUrl}?type=${secName1}&project_id=${projectId}&model=giardia&fmt=png&id=${id}"/>
  <c:set var="imgSrc2" value="${plotBaseUrl}?type=${secName2}&project_id=${projectId}&model=giardia&fmt=png&id=${id}"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td class="centered">
              <img src="${imgSrc1}">
        </td>

        <td class="centered">
          <div class="small">
          <b>Stress Response in Giardia lamblia Trophozoites</b>:  Samples were incubated for 30min with varying concentrations of DTT.  Each bar represents the average of three 2-channel hybridizations which were performed versus a control sample  (ie. Control=Control/Control,...).  Cases where the Control bar is NOT close to 0 is an indication of experimental variation in the spots mapping to this gene.
          </div>
        </td>

        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="150"></td>

      </tr>

      <tr>
        <td class="centered">
              <img src="${imgSrc2}">
        </td>


        <td class="centered">
          <div class="small">
          <b>Percentiles:  </b>  The mean raw expression value was computed for each sample group and for every gene and the percentile indicates the level of expression relative to all other genes in that group.   Green bars represent the reference channel (control).
          </div>
        </td>

        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="150"></td>

      </tr>
     
    </table>
  </c:set>

  <c:if test="${attrs['graph_stress'].value == 0}">
    < c:set var="expressionContent" value="none"/>
  </c:if>

<site:toggle
    displayName="Stress response in Trophozoites - Varying DTT Concentrations and Temperature"
    content="${expressionContent}"
    name="StressResponse1"
    isOpen="true"
    attribution="GL_Spycher_metaData"/>



<%-------------------------------------------------------------------------------------%>


  <c:set var="secName1" value="Stress::Ver2"/>
  <c:set var="secName2" value="StressPercentile::Ver2"/>

  <c:set var="imgSrc1" value="${plotBaseUrl}?type=${secName1}&project_id=${projectId}&model=giardia&fmt=png&id=${id}"/>
  <c:set var="imgSrc2" value="${plotBaseUrl}?type=${secName2}&project_id=${projectId}&model=giardia&fmt=png&id=${id}"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td class="centered">
              <img src="${imgSrc1}">
        </td>
        <td class="centered">
          <div class="small">
          <b>Stress Response in Giardia lamblia Trophozoites</b>:  Samples were incubated 30min, 60min, 120min at 14.2mM DTT.  Each bar represents the average of three 2-channel hybridizations which were performed versus a control sample  (ie. Control=Control/Control,...).  Cases where the Control bar is NOT close to 0 is an indication of experimental variation in the spots mapping to this gene.
          </div>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="150"></td>
      </tr>

      <tr>
        <td class="centered">
              <img src="${imgSrc2}">
        </td>
        <td class="centered">
          <div class="small">
          <b>Percentiles:  </b>  The mean raw expression value was computed for each sample group and for every gene and the percentile indicates the level of expression relative to all other genes in that group.   Green bars represent the reference channel (control).
          </div>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="150"></td>
      </tr>
    </table>
  </c:set>

  <c:if test="${attrs['graph_stress_ts'].value == 0}">
    < c:set var="expressionContent" value="none"/>
  </c:if>

<%--site:toggle--%>
<%--    displayName="Stress response in Trophozoites - Varying Incubation Time"--%>
<%--    content="${expressionContent}"--%>
<%--    name="StressResponse2"--%>
<%--    isOpen="true"--%>
<%--    attribution="GL_Spycher_metaData_2"--%>

<%-- sage count percentage graph --%>

  <c:set var="secName1" value="Sage::Ver1"/>

  <c:set var="imgSrc1" value="${plotBaseUrl}?type=${secName1}&project_id=${projectId}&model=giardia&fmt=png&id=${id}"/>

  <c:set var="expressionContent">
    <table border=0>
      <tr>
        <td class="centered">
              <img src="${imgSrc1}">
        </td>
        <td class="centered">
          <div class="small">
          <b><i>Giardia lamblia</i> SAGE Tags counts</b>:  
          </div>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="150"></td>
      </tr>

    </table>
  </c:set>

  <c:if test="${attrs['graph_sage_pct'].value == 0}">
    < c:set var="expressionContent" value="none"/>
  </c:if>

<site:toggle
    displayName="<i>Giardia lamblia</i> SAGE Tags Counts"
    content="${expressionContent}"
    name="SageCountPct"
    isOpen="true"
    attribution="Giardia_SageTag_Count_percentages"/>

<%-- SAGE tags ------------------------------------------------------%>

<site:wdkTable tblName="SageTags" isOpen="true"
               attribution="GiardiaSageTagArrayDesign,GiardiaSageTagFreqs"/>


<%-- PROTEIN FEATURES -------------------------------------------------%>
<c:if test="${attrs['so_term_name'].value eq 'protein_coding'}">

<site:pageDivider name="Protein Features"/>

    <c:set var="ptracks">
     RatnerMassSpecPeptides+TachezyMassSpecPeptides+InterproDomains+SignalP+TMHMM+BLASTP
    </c:set>
    
    <c:set var="attribution">
    InterproscanData
    </c:set>

<c:set var="proteinFeaturesUrl">
http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/giardiadbaa/?name=${wdkRecord.primaryKey};type=${ptracks};width=640;embed=1
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

    <site:toggle 
        displayName="Predicted Protein Features"
        content="${proteinFeaturesImg}"
        isOpen="true"
        name="Protein Context"
        attribution="${attribution}"/>
      <!--${proteinFeaturesUrl} -->
   <br>
</c:if>

<%-- EC ------------------------------------------------------------%>

  <site:wdkTable tblName="EcNumber" isOpen="true"
               attribution="enzymeDB,G.lamblia_contigs"/>

<%-- GO ------------------------------------------------------------%>
  <site:wdkTable tblName="GoTerms" isOpen="true"
               attribution="GO,InterproscanData,G.lamblia_contigs"/>

<%-- EPITOPES ------------------------------------------------------%>
  <site:wdkTable tblName="Epitopes" isOpen="true"
                 attribution="IEDB_Epitopes"/>
</c:if>


<site:pageDivider name="Protein Features"/>

<p>
<table border='0' width='100%'>
<tr><td><font size ="-1">Please note that UTRs are not available for all gene models and may result in the RNA sequence (with introns removed) being identical to the CDS in those cases.</font></td></tr>
</table>
<p>

<%--- Sequence -----------------------------------------------------%>
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
<site:toggle
    name="ProteinSequence"
    isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />
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
<site:toggle
    name="mRnaSequence"
    isOpen="false"
    displayName="${attr.displayName}"
    content="${seq}" />

<%------------------------------------------------------------------%>
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
<site:toggle
    name="GenomicSequence"
    isOpen="false"
    displayName="Genomic Sequence (introns shown in lower case)"
    content="${seq}" />
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
<site:toggle
    name="CodingSequence"
    isOpen="true"
    displayName="${attr.displayName}"
    content="${seq}" />
</c:if>
<%---- reference ---------------------------------------------------%> 
<%--
<c:set var="reference" value="${extdbname}" />
--%>
<c:set var="reference">
<b>Genomic minimalism in the early diverging intestinal parasite <i>Giardia lamblia</i>. </b>
Hilary G. Morrison, Andrew G. McArthur, Frances D. Gillin, Stephen B. Aley, Rodney D. Adam, Gary J. Olsen, Aaron A. Best, W. Zacheus Cande, Feng Chen, Michael J. Cipriano, Barbara J. Davids, Scott C. Dawson, Heidi G. Elmendorf, Adrian B. Hehl, Michael E. Holder, Susan M. Huse, Ulandt U. Kim, Erica Lasek-Nesselquist, Gerard Manning, Anuranjini Nigam, Julie E. J. Nixon, Daniel Palm, Nora E. Passamaneck, Anjali Prabhu, Claudia I. Reich, David S. Reiner, John Samuelson, Staffan G. Svard, and Mitchell L. Sogin.  <font color="blue">Science 28 September 2007, Volume 317, pp. 1921-1926.</font>
</c:set>


<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<%-- jsp:include page="/include/footer.html" --%>

<site:footer/>

<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>
