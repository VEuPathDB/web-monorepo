<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame title="${wdkModel.displayName} :: Retrieve Sequences"
                 refer="srt"
                 banner="Retrieve Sequences"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Retrieve Sequences"
                 division="queries_tools">
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<c:set var="gqSet" value="${qSetMap['InternalQuestions2']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>

<c:set var="geneByIdQuestion" value="${gqMap['SRT']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="genesIds" value="${gidqpMap['genes_ids']}"/>
<c:set var="contigsIds" value="${gidqpMap['contigs_ids']}"/>
<c:set var="contigsIds2" value="${gidqpMap['contigs_ids']}"/>
<c:set var="contigsIds3" value="${gidqpMap['contigs_ids']}"/>
<c:set var="orfsIds" value="${gidqpMap['orfs_ids']}"/>

<c:set var="gSrt" value="geneSrt"/>
<c:set var="cSrt" value="contigSrt"/>
<c:set var="oSrt" value="orfSrt"/>


<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 
 <tr>
  <td bgcolor=white valign=top>

<!-- begin page table -->

<table border=0 width=100% cellpadding=10>
 <tr>
  <td bgcolor="white" valign="top">
<b><center>Download Sequences By <br>
<a href="#gene">Gene IDs</a> | 
<a href="#sequence">Genomic Sequence IDs</a> |  
<c:if test="${wdkModel.name ne 'TrichDB' && wdkModel.name ne 'EuPathDB'}">
<a href="#msa">Alignments</a> |
</c:if>
<a href="#orf">ORF IDs</a> </center></b><hr>
  </td>
  <td valign="top" class="dottedLeftBorder"></td> 
</tr>
</table> 

<h3><a name="gene">Retrieve Sequences By Gene IDs</a></h3>

<imp:geneSrt />

<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>

<hr>

<h3><a name="sequence">Retrieve Sequences By Genomic Sequence IDs</a></h3>
  <form action="/cgi-bin/${cSrt}" method="post">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    <table border="0" width="100%" cellpadding="2">
    <tr><td colspan="2" valign="top"><b>Enter a list of Genomic Sequence IDs (each ID on a separate line):</b></td><tr>
    <tr><td colspan="2">
            <textarea name="ids" rows="4" cols="60">${contigsIds.default}
${contigsIds2.default} (14..700)
${contigsIds3.default} reverse (100..2000)</textarea>
    </td></tr>
    <tr><td colspan="2">Default region (for sequences in the list without a specified region):</td></tr>
    <tr><td colspan="2">
    <table style="margin-left:20px;" cellpadding="2">
        <tr><td colspan="2">
            <input type="checkbox" name="revComp" value="protein">Reverse & Complement
        </td></tr>
        <tr><td>Nucleotide positions</td>
            <td align="left">
                             <input name="start" value="1" size="6"> to
                             <input name="end" value="10000" size="6"></td></tr>

    <tr><td valign="top" nowrap><b>Download Type</b>:
            <input type="radio" name="downloadType" value="text">Save to File</input>
            <input type="radio" name="downloadType" value="plain" checked>Show in Browser</input>
        </td></tr>
        <tr><td align="left"><input name="go" value="Get Sequences" type="submit"/></td></tr>        
    </table></td></tr>

    </table>
  </form>
<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>


<c:if test="${wdkModel.name ne 'TrichDB' && wdkModel.name ne 'EuPathDB'}">

  <hr>
<h3><a name="msa">Retrieve Multiple Sequence Alignments by Contig / Genomic Sequence IDs</a></h3>

  <imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${wdkModel.name}" start="15,000" 
                      end="30,000" inputContig="1" contigId="${contigsIds.default}" cellPadding="2"/>

<a href="#help"><img src="images/toHelp.jpg" align="top" border='0'></a>
</c:if>

<hr>

<h3><a name="orf">Retrieve Sequences By Open Reading Frame IDs</a></h3>

  <form action="/cgi-bin/${oSrt}" method="post">
    <input type="hidden" name="project_id" value="${wdkModel.name}"/>
    <table border="0" width="100%" cellpadding="2">
    <tr><td colspan="2" valign="top"><b>Enter a list of ORF IDs (each ID on a separate line):</b></td><tr>
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
		<select name="upstreamAnchor">
                    <option value="Start" selected>start</option>
                    <option value="End">stop</option>
                </select>
            </td>
            <td align="left">
                <select name="upstreamSign">
		    <option value="plus" selected>+</option>
                    <option value="minus">-</option>
                </select>
            </td>
            <td align="left">
                <input name="upstreamOffset" value="0" size="6"/> nucleotides
            </td></tr>

        <tr><td>end at</td>
          <td align="left">
		<select name="downstreamAnchor">
                    <option value="Start">start</option>
                    <option value="End" selected>stop</option>
                </select>
            </td>
            <td align="left">
                <select name="downstreamSign">
		    <option value="plus" selected>+</option>
                    <option value="minus">-</option>
                </select>
	    </td>
            <td align="left">
                <input name="downstreamOffset" value="0" size="6"/> nucleotides
            </td></tr>
      </table></td></tr>
    <tr><td valign="top" nowrap><b>Download Type</b>:
            <input type="radio" name="downloadType" value="text">Save to File</input>
            <input type="radio" name="downloadType" value="plain" checked>Show in Browser</input>
        </td></tr>
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

<imp:srtHelp/>
 
</imp:pageFrame>
