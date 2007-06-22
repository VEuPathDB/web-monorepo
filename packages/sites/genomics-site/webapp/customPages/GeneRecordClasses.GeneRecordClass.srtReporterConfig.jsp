<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkAnswer from requestScope -->
<jsp:useBean id="wdkUser" scope="session" type="org.gusdb.wdk.model.jspwrap.UserBean"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="history_id" value="${requestScope.wdk_history_id}"/>
<c:set var="format" value="${requestScope.wdkReportFormat}"/>
<c:set var="allRecordIds" value="${wdkAnswer.allIdList}"/>

<c:set var="site" value="${wdkModel.displayName}"/>




<c:set var="CGI_URL" value="${applicationScope.wdkModel.properties['CGI_URL']}"/>


<!-- display page header -->
<site:header banner="Retrieve Gene Sequences" />

<!-- display description for page -->
<p><b>This reporter will retrieve the sequences of the genes in your result.</b></p>

<!-- display the parameters of the question, and the format selection form -->
<wdk:reporter/>

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //

function setEnable(flag) {
    var offsetOptions = document.getElementById("offsetOptions");
    if (flag) offsetOptions.style.display = "block";
    else offsetOptions.style.display = "none";   
}

// -->
</script>

<%--
<c:choose>
<c:when test="${fn:containsIgnoreCase(site, 'ApiDB')}">
  <form action="${CGI_URL}/Api_geneSrt" method="post">
</c:when>
<c:otherwise>
--%>
  <form action="${CGI_URL}/geneSrt" method="post">
<%--
</c:otherwise>
</c:choose>
--%>


    <input type="hidden" name="ids" value="${allRecordIds}">
    
    <table border="0" width="100%" cellpadding="4">

    <tr><td colspan="2">
    <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="genomic" checked onclick="setEnable(true)">genomic
        <input type="radio" name="type" value="protein" onclick="setEnable(false)">protein
        <input type="radio" name="type" value="CDS" onclick="setEnable(false)">CDS
        <input type="radio" name="type" value="processed_transcript" onclick="setEnable(false)">transcript
    </td></tr>

    <tr>
        <td colspan="2">
    <table id="offsetOptions" cellpadding="4">
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
        <tr>
            <td colspan="3"><a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a></td>
        </tr>
    </table>
        </td>
    </tr>

        <td align="center"><input name="go" value="Get Sequences" type="submit"/></td></tr>

    </table>
  </form>

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
