<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} :: Retrieve Sequences"
                 banner="Retrieve Sequences"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Retrieve Sequences"
                 division="queries_tools"/>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<c:set var="gqSet" value="${qSetMap['InternalQuestions2']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>

<c:set var="geneByIdQuestion" value="${gqMap['SRT']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="genesIds" value="${gidqpMap['genes_ids']}"/>
<c:set var="contigsIds" value="${gidqpMap['contigs_ids']}"/>
<c:set var="orfsIds" value="${gidqpMap['orfs_ids']}"/>

<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>
<c:set var="gSrt" value="geneSrt"/>
<c:set var="cSrt" value="contigSrt"/>
<c:set var="oSrt" value="orfSrt"/>

<c:if test="${fn:containsIgnoreCase(wdkModel.displayName, 'ApiDB')}">
    <c:set var="cSrt" value="Api_contigSrt"/>
</c:if>
<%--
<c:if test="${fn:containsIgnoreCase(wdkModel.displayName, 'ApiDB')}">
    <c:set var="gSrt" value="Api_geneSrt"/>
    <c:set var="cSrt" value="Api_contigSrt"/>
    <c:set var="oSrt" value="Api_orfSrt"/>
</c:if>
--%>

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //

function setEnable(flag) {
    var offsetOptions = document.getElementById("offsetOptions");
    if (flag) offsetOptions.style.display = "block";
    else offsetOptions.style.display = "none";   
}

// -->
</script>

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //

function setEnable2(flag) {
    var offsetOptions2 = document.getElementById("offsetOptions2");
    if (flag) offsetOptions2.style.display = "block";
    else offsetOptions2.style.display = "none";   
}

// -->
</script>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 
 <tr>
  <td bgcolor=white valign=top>

<!-- begin page table -->

<table border=0 width=100% cellpadding=10>
 <tr>
  <td bgcolor="white" valign="top">
<b><center>Download Sequences By <br>
<a href="#gene">Gene IDs</a> | 
<a href="#contig">Contig IDs</a> |  
<c:if test="${wdkModel.name eq 'ToxoDB' || wdkModel.name eq 'CryptoDB'}">
<a href="#mercator">Alignments</a> |
</c:if>
<a href="#orf">Orf IDs</a> </center></b><hr>
  </td>
  <td valign="top" class="dottedLeftBorder"></td> 
</tr>
</table> 

<h3><a name="gene">Retrieve Sequences By Gene IDs</a></h3>

  <form action="${CGI_URL}/${gSrt}" method="post">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    <table border="0" width="100%" cellpadding="2">
    <tr><td colspan="2" valign="top"><b>Enter a list of Gene IDs (white space or new line delimited):</b></td><tr>
    <tr><td colspan="2">
            <textarea name="ids" rows="4" cols="60">${genesIds.default}</textarea>
    </td></tr>

    <tr><td colspan="2">
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="genomic" checked onclick="setEnable(true)">genomic
        <input type="radio" name="type" value="protein" onclick="setEnable(false)">protein
        <input type="radio" name="type" value="CDS" onclick="setEnable(false)">CDS
        <input type="radio" name="type" value="processed_transcript" onclick="setEnable(false)">transcript
    </td></tr>

    <tr>
        <td colspan="2">
    <table id="offsetOptions" cellpadding="2">
        <tr><td colspan="3">
                <b>Choose the region of the sequence(s):</b>
            </td>
        </tr>
        <tr>
            <td>begin at</td>
            <td align="left">
                <input type="radio" name="upstreamAnchor" value="Start" checked> start<br>
                <input type="radio" name="upstreamAnchor" value="End"> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;
                             <input id="upstreamOffset" name="upstreamOffset" value="0" size="6">residues
            </td>
        </tr>

        <tr>
            <td>end at</td>
            <td align="left">
                <input type="radio" name="downstreamAnchor" value="Start"> start<br>
                <input type="radio" name="downstreamAnchor" value="End" checked> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;
                             <input id="downstreamOffset" name="downstreamOffset" value="0" size="6"> residues
            </td>
        </tr>
       </table></td></tr>
      <tr><td align="left"><input name="go" value="Get Sequences" type="submit"/></td></tr>
    </table>
  </form>
<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>

<hr>

<h3><a name="contig">Retrieve Sequences By Contig IDs</a></h3>
  <form action="${CGI_URL}/${cSrt}" method="post">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    <table border="0" width="100%" cellpadding="2">
    <tr><td colspan="2" valign="top"><b>Enter a list of Contig IDs (white space or new line delimited):</b></td><tr>
    <tr><td colspan="2">
            <textarea name="ids" rows="4" cols="60">${contigsIds.default}</textarea>
    </td></tr>

    <tr><td colspan="2">
        <input type="checkbox" name="revComp" value="protein">Reverse & Complement
    </td></tr>

    <tr><td colspan="2">
    <b>Choose the region of the sequence(s):</b>
    </td></tr>
    <tr><td colspan="2">
    <table cellpadding="2">
        <tr><td>Nucleotide postions</td>
            <td align="left">
                             <input name="start" value="1" size="6"> to
                             <input name="end" value="10000" size="6"></td></tr>
        <tr><td align="left"><input name="go" value="Get Sequences" type="submit"/></td></tr>        
    </table></td></tr>

    </table>
  </form>
<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>

<c:if test="${wdkModel.name eq 'ToxoDB' || wdkModel.name eq 'CryptoDB'}">

  <hr>
<a name="mercator"></a>
  <site:mercatorMAVID cgiUrl="${CGI_URL}" projectId="${wdkModel.name}" start="15,000" 
                      end="30,000" inputContig="1" contigId="${contigsIds.default}" cellPadding="2"/>

<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>
</c:if>

<hr>

<h3><a name="orf">Retrieve Sequences By Open Reading Frame IDs</a></h3>

  <form action="${CGI_URL}/${oSrt}" method="post">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    <table border="0" width="100%" cellpadding="2">
    <tr><td colspan="2" valign="top"><b>Enter a list of ORF IDs (white space or new line delimited):</b></td><tr>
    <tr><td colspan="2">
            <textarea name="ids" rows="4" cols="60">${orfsIds.default}</textarea>
    </td></tr>


<tr><td colspan="2">
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="protein" onclick="setEnable2(false)">protein
        <input type="radio" name="type" value="genomic" checked onclick="setEnable2(true)">genomic
    </td></tr>

<%--
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="protein" checked>protein
        <input type="radio" name="type" value="genomic">genomic
 --%>

    
    <tr><td colspan="2">
    <table id="offsetOptions2" cellpadding="2">
<tr><td colspan="2">
    <b>Choose the region of the sequence(s):</b>
    </td></tr>
        <tr><td>begin at</td>
            <td align="left">
                <input type="radio" name="upstreamAnchor" value="Start" checked> start<br>
                <input type="radio" name="upstreamAnchor" value="End"> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;
                             <input name="upstreamOffset" value="0" size="6">residues</td></tr>

        <tr><td>end at</td>
            <td align="left">
                <input type="radio" name="downstreamAnchor" value="Start"> start<br>
                <input type="radio" name="downstreamAnchor" value="End" checked> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;
                             <input name="downstreamOffset" value="0" size="6"> residues</td></tr>

      </table></td></tr>
    <tr><td align="left"><input name="go" value="Get Sequences" type="submit"/></td></tr>
    </table>
 </form>
<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>

<hr>

<b><a name="help">Help</a></b>
  <br>
  <br>
<img src="images/genemodel.gif" align="top" > 

<br>
Types of sequences:
 <table width="100%" cellpadding="4">
 <tr>
      <td><i><b>protein</b></i>
      <td>the predicted translation of the gene
 </tr>
 <tr>
       <td><i><b>CDS</b></i>
       <td>the coding sequence, excluding UTRs (introns spliced out)
 </tr>
 <tr>
        <td><i><b>transcript</b></i>
        <td>the processed transcript, including UTRs (introns spliced out)
 </tr>
 <tr>
        <td><i><b>genomic</b></i>
        <td>a region of the genome.  <i>Genomic sequence is always returned from 5' to 3', on the proper strand</i>
 </tr>
 </table>

<br>
Regions:
 <table width="100%" cellpadding="4">
   <tr>
      <td><i><b>relative to sequence start</b></i>
      <td>to retrieve, eg, the 100 bp upstream genomic region, use "begin at <i>start</i> + -100  end at <i>start</i> + -1".
   <tr>
      <td><i><b>relative to sequence stop</b></i>
      <td>to retrieve, eg, the last 10 amino acids of a protein, use "begin at <i>stop</i> + -9  end at <i>stop</i> + 0".
    <tr>
      <td><i><b>relative to sequence start and stop</b></i>
      <td>to retrieve, eg, a CDS with the  first and last 10 basepairs excised, use: "begin at <i>start</i> + 10 end at <i>stop</i> + -10".
    </tr>
  </table>

<table>
<tr>
  <td valign="top" class="dottedLeftBorder"></td> 
</tr>
</table> 
 
<site:footer/>
