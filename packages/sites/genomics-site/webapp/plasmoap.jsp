<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<imp:pageFrame title="${wdkModel.displayName} :: PlasmoAP"
               refer="plasmoap"
               banner="PlasmoAP"
               parentDivision="PlasmoDB"
               parentUrl="/home.jsp"
               divisionName="PlasmoAP"
               division="queries_tools">
  <c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>



  <h1><center>PlasmoAP - Prediction of apicoplast targeting signals</center><h1> 

<h2>Use the PlasmoAP algorithm to predict apicoplast-targeting signals.</h2>

<FORM METHOD = "POST" action="../cgi-bin/plasmoap.cgi">
<table border=0 CELLPADDING=2 CELLSPACING=0 bgcolor="BDC0FA">
 <!table border=0 width=100% cellpadding=10 bgcolor="BDC0FA"-->
<tr>
<td colspan=2  align="center">
Please paste your entire <b>protein</b> sequence, <b>including</b> any signal sequence that may be present.
</td></tr>

<tr><td align="center">
<TEXTAREA NAME="sequence" ROWS=10 COLS=70></TEXTAREA>
</td></tr>
<tr><td align="center"><input type="reset" value="Clear Input">&nbsp;&nbsp;
<input type="submit" value="Run"></tr>
</table>
</FORM>
<h2>Explanation</h2>
<p>The apicoplast is a distintive subcellular structure, acquired when an ancestral protist 
'ate' (or was invaded by) a eukaryotic alga, and retained the algal plastid. The apicoplast
has lost photosynthetic function, but is nevertheless essential for parasite survival, and
has generated considerable excitement as a potential drug target. Nuclear-encoded apicoplast 
proteins are imported into the organelle using a bipartite targeting signal consisting of a
classical secretory signal sequence, followed by a plastid transit peptide.</p>


<p>PlasmoAP is a rules-based algorithm that uses amino-acid frequency and distribution to identify 
putative apicoplast-targeting peptides. <B>Just paste a protein sequence into the text box 
above, and click on "Run".</B>  Note that this algorithm will predict target to the apicoplast
<b>only</B> if a signal sequence is present. Also note that PlasmoAP performs well <B>only</B> 
for <i>P. falciparum</i> sequences, as A+T content skews amino acid distribution. 
For more information on this tool please 
click <a href="../Help/Tools-Apicoplast-Plasmoap-PredictionOfApicoplastTargetingSignals.shtml">
here</a>, or see Foth, BJ et al.<I> Science</I> 299:5606 (2003).

</p>


</imp:pageFrame>
