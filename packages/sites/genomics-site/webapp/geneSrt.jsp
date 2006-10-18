<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<c:set var="$siteName" value="ApiDB"/>
<c:if test="${param.siteName != null}"><c:set var="siteName" value="${param.siteName}"/></c:if>

<site:header title="${siteName}.org :: Retrieve Gene Sequences"
                 banner="Retrieve Gene Sequences"
                 parentDivision="${siteName}"
                 parentUrl="/home.jsp"
                 divisionName="Retrieve Gene Sequences"
                 division="queries_tools"/>

<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>

<!-- begin page table -->

<table border="0" width="100%" cellpadding="3" cellspacing="0" bgcolor="white" class="thinTopBottomBorders"> 

 <tr>
  <td bgcolor="white" valign="top">

  <form action="${CGI_URL}/geneSrt" method="post">
    <table border="0" width="100%" cellpadding="4">
    <tr><td colspan="2" valign="top"><b>Enter a list of Gene IDs (white space or new line delimited):</b></td><tr>
    <tr><td colspan="2">
            <textarea name="ids" rows="4" cols="60">${param.defaultGeneIds}</textarea>
    </td></tr>

    <tr><td colspan="2">
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="protein">protein
        <input type="radio" name="type" value="CDS">CDS
        <input type="radio" name="type" value="processed_transcript" checked>transcript
        <input type="radio" name="type" value="genomic">genomic
    </td></tr>

    <tr><td colspan="2">
    <b>Choose the region of the sequence(s):</b>
    </td></tr>
    <tr><td colspan="2">
    <table cellpadding="4">
        <tr><td>begin at</td>
            <td align="left">
                <input type="radio" name="upstreamAnchor" value="Start" checked> start<br>
                <input type="radio" name="upstreamAnchor" value="End"> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+/-&nbsp;&nbsp;
                             <input name="upstreamOffset" value="0" size="6">residues</td></tr>

        <tr><td>end at</td>
            <td align="left">
                <input type="radio" name="downstreamAnchor" value="Start"> start<br>
                <input type="radio" name="downstreamAnchor" value="End" checked> stop<br>
            </td>
            <td align="left">&nbsp;&nbsp;&nbsp;&nbsp;+/-&nbsp;&nbsp;
                             <input name="downstreamOffset" value="0" size="6"> residues</td></tr>
    </table></td></tr>

        <td align="center"><input name="go" value="Get Sequences" type="submit"/></td></tr>

    </table>
  </form>

<br>
(<b>Note</b>: to retrieve sequence for a chromosome or contig <a href="showQuestion.do?questionFullName=GenomicSequenceQuestions.SequenceBySourceId">go to its page</a>)
<br>
  <hr>
  <br>

<b><font size="+1">Help</font></b>
  <br>
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
 <table>


Regions:
 <table width="100%" cellpadding="4">
   <tr>
      <td><i><b>relative to sequence start</b></i>
      <td>to retrieve, eg, the 100 bp upstream genomic region, use "begin at <i>start</i> +/- -100  end at <i>start</i> +/- -1".
   <tr>
      <td><i><b>relative to sequence stop</b></i>
      <td>to retrieve, eg, the last 10 amino acids of a protein, use "begin at <i>stop</i> +/- -9  end at <i>stop</i> +/- 0".
    <tr>
      <td><i><b>relative to sequence start and stop</b></i>
      <td>to retrieve, eg, a CDS with the  first and last 10 basepairs excised, use: "begin at <i>start</i> +/- 10 end at <i>stop</i> +/- -10".
    </tr>
  </table>
    <img src="<c:url value="/images/genemodel.gif" />" border="1"/>
  </td>
  <td valign="top" class="dottedLeftBorder"></td> 
</tr>
</table> 
 
<site:footer/>
