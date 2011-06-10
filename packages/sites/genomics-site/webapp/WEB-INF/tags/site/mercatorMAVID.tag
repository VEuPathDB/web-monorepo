<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="cgiUrl"
              description="Basename for the cgi"
%>

<%@ attribute name="projectId"
              description="projectId"
%>

<%@ attribute name="contigId"
              description="source id for the contig or chromosome"
%>

<%@ attribute name="availableGenomes"
              description="string list of available genomes"
%>

<%@ attribute name="start"
              description="nucleotide position"
%>

<%@ attribute name="end"
              description="nucleotide position"
%>

<%@ attribute name="bkgClass"
              description="tr class name"
%>

<%@ attribute name="inputContig"
              description="boolean, use text box to get contig if true"
%>

<%@ attribute name="cellPadding"
              description="table cell padding"
%>

<%@ attribute name="revCompOn"
              description="boolean"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>


<SCRIPT TYPE="text/javascript">
<!--
function popupform(myform, windowname)
{
if (! window.focus)return true;
window.open('', windowname, 'height=500,width=950,scrollbars=yes,resizable=1');
myform.target=windowname;
return true;
}
//-->
</SCRIPT>

<c:set var="cgiScript" value='mavidAlign'/>
<c:if test="${(projectId eq 'TriTrypDB') || (projectId eq 'MicrosporidiaDB') || (projectId eq 'PiroplasmaDB') || (projectId eq 'PlasmoDB' && wdkRecord.recordClass.type ne 'SNP')}">
  <c:set var="cgiScript" value='pairwiseMercator'/>
</c:if>

<c:if test="${inputContig == null}">
 <c:set var="headerFiller" value="of <i>${contigId}</i>"/>
</c:if>

<c:if test="${revCompOn == 1}">
 <c:set var="initialCheckBox" value="CHECKED"/>
</c:if>

<c:if test="${availableGenomes == null || availableGenomes == ''}">
 <c:set var="availableGenomes" value="available genomes"/>
</c:if>
<!--
<table  class="paneltoggle" width="100%" cellpadding="3" bgcolor="#dddddd">
<tr><td>
    <b><font size="+1">Multiple Sequence Alignment ${headerFiller} across ${availableGenomes}.</font></b>
</td></tr>
</table>
-->
<form action="${cgiUrl}/${cgiScript}" onSubmit="popupform(this, ${cgiScript})">
 <table border="0" cellpadding="${cellPadding}" cellspacing="1">
  <tr class="${bkgClass}"><td>
   <table border="0" cellpadding="${cellPadding}">
    <tr><td colspan="2">
        <input name='project_id' value='${projectId}' size='20' type='hidden' />
        <c:if test="${inputContig == null}">
          <input name='contig' value='${contigId}' size='20' type='hidden' />
        </c:if>
    </td></tr>


    <c:if test="${inputContig != null}">
      <tr><td align="left"><b>Enter a Contig ID:</b>&nbsp;&nbsp;
          <input type="text" name="contig" value="${contigId}">
    </c:if>
    <tr><td colspan="2"><b>Nucleotide positions:</b>&nbsp;&nbsp;
        <input type="text" name="start" value="${start}" maxlength="10" size="10"/>
     to <input type="text" name="stop" value="${end}" maxlength="10" size="10"/>
     &nbsp;&nbsp;&nbsp;&nbsp;
         <input type="checkbox" name="revComp" ${initialCheckBox}>Reverse & Complement</td></tr>

<c:if test="${projectId eq 'TriTrypDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="Lbraziliensis" checked>L.braziliensis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Linfantum" checked>L.infantum
            </td>
            <td>
              <input type="checkbox" name="genomes" value="LmajorFriedlin" checked>L.major
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Lmexicana" checked>L.mexicana
            </td>
            </tr>
           <tr>
            <td>
              <input type="checkbox" name="genomes" value="Tbrucei427" checked>T.brucei 427
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Tbrucei927" checked>T.brucei 927
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Tbruceigambiense" checked>T.brucei gambiense
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Tcongolense" checked>T.congolense
            </td>
          </tr>
            <tr>
            <td>
              <input type="checkbox" name="genomes" value="TcruziEsmeraldoLike" checked>T.cruzi esmeraldo like
            </td>
            <td>
              <input type="checkbox" name="genomes" value="TcruziNonEsmeraldoLike" checked>T.cruzi non-esmeraldo like
            </td>
            <td colspan="2">
              <input type="checkbox" name="genomes" value="Tvivax" checked>T.vivax
            </td>
           </tr>
         </table>

     </td></tr>
</c:if>

<c:if test="${projectId eq 'PlasmoDB' && wdkRecord.recordClass.type ne 'SNP'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="Pfalciparum" checked>P.falciparum
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Pvivax" checked>P.vivax
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Pyoelii" checked>P.yoelii
            </td>
           </tr>
            <td>
              <input type="checkbox" name="genomes" value="Pberghei" checked>P.berghei
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Pchabaudi" checked>P.chabaudi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Pknowlesi" checked>P.knowlesi
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>
<c:if test="${projectId eq 'PiroplasmaDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="TannulataAnkara" checked>T.annulata
            </td>
            <td>
              <input type="checkbox" name="genomes" value="TparvaMuguga" checked>T.parva
            </td>
            <td>
              <input type="checkbox" name="genomes" value="BbovisT2Bo" checked>B.bovis
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

<c:if test="${projectId eq 'MicrosporidiaDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="Ecuniculi" checked>E.cuniculi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Eintestinalis" checked>E.intestinalis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="Ebieneusi" checked>E.bieneusi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="EhellemATCC50504" checked>E.hellem
            </td>
            <td>
              <input type="checkbox" name="genomes" value="NceranaeBRL01" checked>N.cerenae
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

<c:if test="${projectId eq 'AmoebaDB_'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="e_dispar" checked>E.dispar
            </td>
            <td>
              <input type="checkbox" name="genomes" value="e_histolytica" checked>E.histolytica
            </td>
            <td>
              <input type="checkbox" name="genomes" value="e_invadens" checked>E.invadens
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

    <tr><td align="left"><b>Output Format:</b>&nbsp;&nbsp;
        <input type="radio" name="type" value="clustal" checked>clustal

<c:if test="${(projectId ne 'TriTrypDB') && (projectId ne 'MicrosporidiaDB') && (projectId ne 'PlasmoDB' || wdkRecord.recordClass.type eq 'SNP')}">
        <input type="radio" name="type" value="fasta_gapped">multi fasta (gapped)
</c:if>
        <input type="radio" name="type" value="fasta_ungapped">multi fasta
     </td></tr>
    <tr><td align="left"><br><input type="submit" name='go' value='Get Alignment' />
	<span style="font-size:90%;">&nbsp;&nbsp;&nbsp;(Alignments made with <a href="http://www.biostat.wisc.edu/~cdewey/mercator/">Mercator</a>)</span>
	</td>
     </tr>
    </table>
   </td></tr></table>
</form>


