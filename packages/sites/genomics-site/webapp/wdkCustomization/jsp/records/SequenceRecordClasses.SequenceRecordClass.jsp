<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>


<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set var="SRT_CONTIG_URL" value="/cgi-bin/contigSrt"/>

<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${id}"
             divisionName="Genomic Sequence Record"
             refer="recordPage"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<c:set var="externalDbName" value="${attrs['externalDbName'].value}" />
<c:set var="organism" value="${wdkRecord.attributes['organism'].value}" />
<c:set var="is_top_level" value="${wdkRecord.attributes['is_top_level'].value}" />

<br/>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	Genomic Sequence
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<imp:recordPageBasketIcon />
</div>

<%--#############################################################--%>




<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}"/>
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}"
    attribute="${attr.name}" />
<br>


<%------------------------------------------------------------------%>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="genome"/>
  <c:param name="externalDbName" value="${attrs['externalDbName'].value}" />
  <c:param name="externalDbVersion" value="${attrs['externalDbVersion'].value}" />
  <c:param name="flag" value="0" /> 
</c:url>
<c:catch var="e">
      <imp:wdkTable tblName="SequenceComments" isOpen="true"/>
      <a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
</c:catch>
<c:if test="${e != null}">
     <imp:embeddedError 
         msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
         e="${e}" 
     />
</c:if>
    
<br>


<%-- DNA CONTEXT ---------------------------------------------------%>
<%------------------------------------------------------------------%>
<%-- Gbrowse tracks defaults  --------------------------------------%>
<%------------------------------------------------------------------%>
<c:set var="gtracks" value="${attrs['gbrowseTracks'].value}" />
<%------------------------------------------------------------------%>
<%-- Gbrowse tracks defaults For Unannotated genomes  --------------%>
<%------------------------------------------------------------------%>
<c:if test="${attrs['gene_count'].value == 0}">

  <%------------------------------------------------------------------%>
  <c:choose>
    <c:when test="${projectId eq 'TriTrypDB' && attrs['length'].value >= 300000}">
      <c:set var="gtracks" value="ProtAlign+ORF600+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${projectId eq 'TriTrypDB' && attrs['length'].value < 300000}">
      <c:set var="gtracks" value="ProtAlign+ORF+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${(projectId eq 'PlasmoDB' || projectId eq 'FungiDB') && attrs['length'].value >= 100000}">
      <c:set var="gtracks" value="ProtAlign+ORF600+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${(projectId eq 'PlasmoDB' || projectId eq 'FungiDB') && attrs['length'].value < 100000}">
      <c:set var="gtracks" value="ProtAlign+ORF300+TandemRepeat+LowComplexity" />
    </c:when>
    <c:otherwise>

       <c:choose>
         <c:when test="${attrs['length'].value >= 100000}">
           <c:set var="gtracks" value="ProtAlign+ORF600+TandemRepeat+LowComplexity" />
         </c:when>
         <c:otherwise>
           <c:set var="gtracks" value="ProtAlign+ORF300+TandemRepeat+LowComplexity" />
         </c:otherwise>
       </c:choose>
    </c:otherwise>
  </c:choose>
  <%------------------------------------------------------------------%>
  <%-- Gbrowse tracks defaults For Specific Genomes   ----------------%>
  <%------------------------------------------------------------------%>
  <c:if test="${ (fn:contains(organism,'Anncaliia') || fn:contains(organism,'Edhazardia') || fn:contains(organism,'Nosema') || fn:contains(organism,'Vittaforma')) && projectId eq 'MicrosporidiaDB'}">
    <c:set var="gtracks" value="" />
  </c:if>
</c:if>
<%------------------------------------------------------------------%>





<c:set var="attribution">
</c:set>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${feature_source_id}@yellow
    </c:set>
    <c:set var="genomeContextImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${genomeContextUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <imp:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center>
        </noindex>

        <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
        <c:set var="gbrowseUrl">
            /cgi-bin/gbrowse/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};label=${labels};h_feat=${id}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

    </c:set>

    <imp:toggle 
        isOpen="true"
        name="genomicContext"
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}"/>
    <br>
</c:if>


<br>


<imp:wdkTable tblName="Aliases" isOpen="true"/>

<imp:wdkTable tblName="Centromere" isOpen="true"/>

<imp:wdkTable tblName="SequencePieces" isOpen="true"/>

<%------------------------------------------------------------------%>

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

<c:if test="${is_top_level eq '1' && ((projectId eq 'PlasmoDB' && fn:containsIgnoreCase(organism, 'falciparum')) || (projectId eq 'TriTrypDB' && !fn:contains(organism,'Crithidia') && !fn:contains(organism,'tarentolae')) || projectId eq 'CryptoDB' || projectId eq 'ToxoDB' || projectId eq 'AmoebaDB' || projectId eq 'MicrosporidiaDB')}">

  <c:if test="${attrs['has_msa'].value == 1}">

  <br />
<h3>Retrieve Multiple Sequence Alignments by Contig / Genomic Sequence IDs</h3>
   <imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" contigId="${id}"
      start="1" end="${attrs['length'].value}" bkgClass="secondary3" cellPadding="0"/>
  </c:if>
</c:if>
</c:set>

<imp:toggle
    isOpen="true"
    name="Sequences"
    attribution=""
    displayName="Sequences"
    content="${content}" />

<%------------------------------------------------------------------%>
<%------------------------------------------------------------------%>


<%------- The Attribution Section is Organism Specific -------------%>

<%------------------------------------------------------------------%>
<%------------------------------------------------------------------%>


 <c:choose>
 <c:when test="${projectId eq 'PiroplasmaDB' || projectId eq 'FungiDB' || projectId eq 'PlasmoDB' || projectId eq 'CryptoDB' || projectId eq 'MicrosporidiaDB' || projectId eq 'ToxoDB' || projectId eq 'AmoebaDB' || projectId eq 'GiardiaDB' || projectId eq 'TriTrypDB' }">

    <c:set value="${wdkRecord.tables['GenomeSequencingAndAnnotationAttribution']}" var="referenceTable"/>

    <c:set value="Error:  No Attribution Available for This Genome!!" var="reference"/>

     <c:forEach var="row" items="${referenceTable}">
         <c:set var="reference" value="${row['description'].value}"/>
     </c:forEach>

 </c:when>


    <c:when test="${projectId eq 'TrichDB'}">
    <c:set var="reference">
     T. vaginalis sequence from Jane Carlton (NYU,TIGR). PMID: 17218520
    </c:set>
    </c:when>

<c:otherwise>
    <c:set var="reference">
  <b>ERROR: can't find attribution information for organism "${organism}",
     sequence "${id}"</b>
    </c:set>
</c:otherwise>

</c:choose>



<imp:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%-- if wdkRecord.attributes['organism'].value --%>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

</imp:pageFrame>
