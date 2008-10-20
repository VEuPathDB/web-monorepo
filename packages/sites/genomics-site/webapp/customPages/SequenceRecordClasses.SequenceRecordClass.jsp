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

<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set var="CPARVUMCHR6" value="${props['CPARVUMCHR6']}"/>
<c:set var="CPARVUMCONTIGS" value="${props['CPARVUMCONTIGS']}"/>
<c:set var="CHOMINISCONTIGS" value="${props['CHOMINISCONTIGS']}"/>
<c:set var="CMURISCONTIGS" value="${props['CMURISCONTIGS']}"/>
<c:set var="CGI_OR_MOD" value="${props['CGI_OR_MOD']}"/>

<c:set var="SRT_CONTIG_URL" value="/cgi-bin/contigSrt"/>
<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>

<c:set var="externalDbName" value="${attrs['externalDbName'].value}" />
<c:set var="organism" value="${wdkRecord.attributes['organism'].value}" />
<c:set var="is_top_level" value="${wdkRecord.attributes['is_top_level'].value}" />

<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>

<c:set var='bannerText'>
      <c:if test="${organism ne 'null'}">
          <font face="Arial,Helvetica" size="+3">
          <b>${organism}</b>
          </font> 
          <font size="+3" face="Arial,Helvetica">
          <b>${id}</b>
          </font><br>
      </c:if>
      
      <font face="Arial,Helvetica">${recordType} Record</font>
</c:set>

<site:header title="${id}"
             banner="${bannerText}"
             divisionName="Genomic Sequence Record"
             division="queries_tools"/>

<c:choose>
<c:when test="${organism eq 'null'}">
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

<c:set var="gtracks" value="${attrs['gbrowseTracks'].value}" />

<c:set var="attribution">
</c:set>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse_img/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${feature_source_id}@yellow
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
            http://${pageContext.request.serverName}/${CGI_OR_MOD}/gbrowse/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};label=${labels};h_feat=${id}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

    </c:set>

    <site:toggle 
        isOpen="true"
        name="genomicContext"
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}"/>
    <br>
</c:if>


<br>

<site:wdkTable tblName="Centromere" isOpen="true"
                 attribution=""/>

<site:wdkTable tblName="SequencePieces" isOpen="true"
                 attribution=""/>

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

<c:if test="${is_top_level eq '1' && ((projectId eq 'PlasmoDB' && fn:containsIgnoreCase(organism, 'falciparum')) || projectId eq 'CryptoDB' || projectId eq 'ToxoDB')}">

  <br />
  <site:mercatorMAVID cgiUrl="${CGI_URL}" projectId="${projectId}" contigId="${id}"
                        start="1" end="${attrs['length'].value}" bkgClass="secondary3" cellPadding="0"/>
</c:if>
</c:set>

<site:toggle
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
<c:when test="${externalDbName eq CPARVUMCONTIGS && projectId eq 'CryptoDB'}">
    <c:set var="reference">
Abrahamsen MS, Templeton TJ, Enomoto S, Abrahante JE, Zhu G, Lancto CA, 
Deng M, Liu C, Widmer G, Tzipori S, Buck GA, Xu P, Bankier AT, Dear PH, 
Konfortov BA, Spriggs HF, Iyer L, Anantharaman V, Aravind L, Kapur V. 
<b>Complete genome sequence of the apicomplexan, <i>Cryptosporidium parvum</i>.</b> 
Science. 2004 Apr 16;<a href="http://www.sciencemag.org/cgi/content/full/304/5669/441"><b>304</b>(5669):441-5</a>.
    </c:set>
</c:when>
<c:when test="${externalDbName eq CHOMINISCONTIGS && projectId eq 'CryptoDB'}">
    <c:set var="reference">
Xu P, Widmer G, Wang Y, Ozaki LS, Alves JM, Serrano MG, Puiu D, Manque P, 
Akiyoshi D, Mackey AJ, Pearson WR, Dear PH, Bankier AT, Peterson DL, 
Abrahamsen MS, Kapur V, Tzipori S, Buck GA. 
<b>The genome of <i>Cryptosporidium hominis</i>.</b> 
Nature. 2004 Oct 28;<a href="http://www.nature.com/nature/journal/v431/n7012/abs/nature02977.html"><b>431</b>(7012):1107-12</a>.
    </c:set>
</c:when>
<c:when test="${externalDbName eq CPARVUMCHR6 && projectId eq 'CryptoDB'}">
    <c:set var="reference">
Bankier AT, Spriggs HF, Fartmann B, Konfortov BA, Madera M, Vogel C, 
Teichmann SA, Ivens A, Dear PH. 
<b>Integrated mapping, chromosomal sequencing and sequence analysis of <i>Cryptosporidium parvum</i>. 
</b>Genome Res. 2003 Aug;<a href="http://www.genome.org/cgi/content/full/13/8/1787">13(8):1787-99</a>
    </c:set>
</c:when>
<c:when test="${externalDbName eq CMURISCONTIGS && projectId eq 'CryptoDB'}">
    <c:set var="reference">
The Cryptosporidium muris genome sequencing project has been funded by the
National Institute of Allergy and Infections Diseases (NIAID), through the
Microbial Sequencing Center program at the Institute for Genomic Research
(TIGR). 
</c:set>
</c:when>
<c:when test="${fn:containsIgnoreCase(organism, 'vivax') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <b><i>P. vivax</i> was sequenced by 
        <a href="http://www.tigr.org/tdb/e2k1/pva1/">The
        Institute for Genomic Research</a></b>
    </c:set>
    </c:when>
<c:when test="${fn:containsIgnoreCase(organism, 'yoelii') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <b><i>P. yoelii</i> was sequenced by
        <a href="http://www.tigr.org/tdb/edb2/pya1/htmls/">The Institute for Genomic Research</a></b>
    </c:set>
    </c:when>

    <c:when test="${fn:containsIgnoreCase(organism, 'falciparum') && (id eq 'MAL2' || id eq 'MAL10' || id eq 'MAL11' || id eq 'MAL14') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- P. falciparum 2, 10, 11, 14 = TIGR --%>
        <b>Chromosome ${id} of <i>P. falciparum</i> 3D7 was
        sequenced at 
        <a href="http://www.tigr.org/tdb/edb2/pfa1/htmls/">The
        Institute for Genomic Research</a>
        <br>and the
        <a href="http://www.nmrc.navy.mil/">Naval
        Medical Research Center</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:containsIgnoreCase(organism, 'falciparum') && (id eq 'MAL1' || id eq 'MAL3' || id eq 'MAL4' || id eq 'MAL5' || id eq 'MAL6' || id eq 'MAL7' || id eq 'MAL8' || id eq 'MAL9' || id eq 'MAL13') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- P. falciparum 1, 3-9, 13 = Sanger --%>
        <b>Chromosome ${id} of <i>P. falciparum</i> 3D7 was
        sequenced at the 
        <a href="http://www.sanger.ac.uk/Projects/P_falciparum/">Sanger
        Institute</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:containsIgnoreCase(organism, 'falciparum') && id eq 'MAL12' && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- P. falciparum 12 = Stanford --%>
        <b>Chromosome ${id} of <i>P. falciparum</i> 3D7 was
        sequenced at the
        <a href="http://sequence-www.stanford.edu/group/malaria/">Stanford
        Genome Technology Center</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:containsIgnoreCase(organism, 'falciparum') && id eq 'AJ276844' && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- P. falciparum mitochondrion = University of London --%>
        <b>The mitochondrial genome of <i>P. falciparum</i> was
        sequenced at the
        <a href="http://www.lshtm.ac.uk/pmbu/staff/dconway/dconway.html">London
        School of Hygiene & Tropical Medicine</a></b>
    </c:set>

    </c:when>
    <c:when test="${organism eq '<i>P.&nbsp;falciparum 3D7</i>' && (id eq 'X95275' || id eq 'X95276') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- P. falciparum plastid --%>
        <b>The <i>P. falciparum</i> plastid was
        sequenced at the 
        <a href="http://www.nimr.mrc.ac.uk/parasitol/wilson/">National
        Institute for Medical Research</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:contains(organism,'berghei') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- e.g.PB000938.03.0 --%>
        <b>The <i>P. berghei</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_berghei">Sanger
        Institute</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:contains(organism,'knowlesi') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <b>The <i>P.knowlesi </i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_knowlesi">Sanger
        Institute</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:contains(organism,'reichenowi') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <b>The <i>P. reichenowi</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_reichenowi">Sanger
        Institute</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:contains(organism,'gallinaceum') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <b>The <i>P. gallinaceum</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_gallinaceum">Sanger
        Institute</a></b>
    </c:set>
    </c:when>
    <c:when test="${fn:contains(organism,'chabaudi') && projectId eq 'PlasmoDB'}">
    <c:set var="reference">
        <%-- e.g. PC000000.00.0 --%>
        <b>The <i>P. chabaudi</i> genome was sequenced by the
        <a href="http://www.sanger.ac.uk/Projects/P_chabaudi">Sanger
        Institute</a></b>
        </a></b>
    </c:set>
    </c:when>
    <c:when test="${projectId eq 'ToxoDB'}">
    <c:set var="reference">
     T. gondii was sequenced by The Institute for <a href=" http://www.tigr.org/tdb/e2k1/tga1/">Genomic Research</a>
    </c:set>
    </c:when>
<c:otherwise>
    <c:set var="reference">
  <b>ERROR: can't find attribution information for organism "${organism}",
     sequence "${id}"</b>
    </c:set>
</c:otherwise>

</c:choose>



<site:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%/* if wdkRecord.attributes['organism'].value */%>

<site:footer/>

<script type="text/javascript">
  document.write(
    '<img alt="logo" src="/images/pix-white.gif?resolution='
     + screen.width + 'x' + screen.height + '" border="0">'
  );
</script>
<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>
