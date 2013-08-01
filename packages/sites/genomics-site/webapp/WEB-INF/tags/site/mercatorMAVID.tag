<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

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
<c:set var="cgiScript" value='pairwiseMercator'/>

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
              <input type="checkbox" name="genomes" value="lbraMHOMBR75M2904" checked>L.braziliensis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ldonBPK282A1" checked>L.donovani
            </td>
            <td>
              <input type="checkbox" name="genomes" value="linfJPCM5" checked>L.infantum
            </td>
            <td>
              <input type="checkbox" name="genomes" value="lmajFriedlin" checked>L.major
            </td>
            <td>
              <input type="checkbox" name="genomes" value="lmexMHOMGT2001U1103" checked>L.mexicana
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ltarParrotTarII" checked>L.tarentolae
            </td>
            </tr>
           <tr>
            <td>
              <input type="checkbox" name="genomes" value="tbruLister427" checked>T.brucei 427
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tbruTREU927" checked>T.brucei 927
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tbrugambienseDAL972" checked>T.brucei gambiense
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tconIL3000" checked>T.congolense
            </td>
            <td colspan="2">
              <input type="checkbox" name="genomes" value="tevaSTIB805" checked>T.evansi
            </td>
            <td colspan="2">
              <input type="checkbox" name="genomes" value="tvivY486" checked>T.vivax
            </td>
          </tr>
            <tr>
            <td>
              <input type="checkbox" name="genomes" value="tcruCLBrenerEsmeraldo-like" checked>T.cruzi esmeraldo like
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tcruCLBrenerNon-Esmeraldo-like" checked>T.cruzi non-esmeraldo like
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tcruCLBrener" checked>T.cruzi strain CL Brener
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tcrumarinkelleiB7" checked>T.cruzi marinkellei
            </td>
            <td colspan="2">
              <input type="checkbox" name="genomes" value="tcruSylvioX10-1" checked>T.cruzi Sylvio
            </td>
           </tr>
         </table>

     </td></tr>
</c:if>

<c:if test="${projectId eq 'PlasmoDB' && wdkRecord.recordClass.displayName ne 'SNP'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="pfal3D7" checked>P.falciparum 3D7
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pfalIT" checked>P.falciparum IT
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pvivSaI1" checked>P.vivax
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pyoe17XNL" checked>P.yoelii 17XNL
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pberANKA" checked>P.berghei
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pchachabaudi" checked>P.chabaudi
            </td>
           </tr>
            <td>
              <input type="checkbox" name="genomes" value="pknoH" checked>P.knowlesi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pyoeyoeliiYM" checked>P.yoelii YM
            </td>
            <td>
              <input type="checkbox" name="genomes" value="pcynB" checked>P.cynomolgi
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>
<c:if test="${projectId eq 'ToxoDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="tgonME49" checked>T.gondii ME49
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tgonGT1" checked>T.gondii GT1
            </td>
            <td>
              <input type="checkbox" name="genomes" value="tgonVEG" checked>T.gondii VEG
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ncanLIV" checked>N.caninum
            </td>
            <td>
              <input type="checkbox" name="genomes" value="etenHoughton" checked>E.tenella
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

<c:if test="${projectId eq 'CryptoDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="cparIowaII" checked>C.parvum Iowa II
            </td>
            <td>
              <input type="checkbox" name="genomes" value="chomTU502" checked>C.hominis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="cmurRN66" checked>C.muris
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
              <input type="checkbox" name="genomes" value="tannAnkara" checked>T.annulata
            </td> 
            <td>
              <input type="checkbox" name="genomes" value="tequWA" checked>T.equi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="toriShintoku" checked>T.orientalis
            </td> 
            <td>
              <input type="checkbox" name="genomes" value="tparMuguga" checked>T.parva
            </td>
            <td>
              <input type="checkbox" name="genomes" value="bbovT2Bo" checked>B.bovis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="bmicRI" checked>B.microti
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
              <input type="checkbox" name="genomes" value="ecunEC1" checked>E.cuniculi EC1
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ecunEC2" checked>E.cuniculi EC2
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ecunEC3" checked>E.cuniculi EC3
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ecunGBM1" checked>E.cuniculi GBM1
            </td>
            <td>
              <input type="checkbox" name="genomes" value="nemaSp1ERTm2" checked>Nematocida Sp1 ERTm2
            </td>
            <td>
              <input type="checkbox" name="genomes" value="nparERTm1" checked>N.parisii ERTm1
            </td>
            <td>
              <input type="checkbox" name="genomes" value="nparERTm3" checked>N.parisii ERTm3
            </td>
            <td>
              <input type="checkbox" name="genomes" value="eintATCC50506" checked>E.intestinalis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ebieH348" checked>E.bieneusi
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehelSwiss" checked>E.hellem Swiss
            </td>
            <td>
              <input type="checkbox" name="genomes" value="eromSJ2008" checked>E.romaleae
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehelATCC50504" checked>E.hellem ATCC 50504
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ncerBRL01" checked>N.cerenae
            </td>
            <td>
              <input type="checkbox" name="genomes" value="vculfloridensis" checked>V.floridensis
            </td>
            <td>
              <input type="checkbox" name="genomes" value="vcorATCC50505" checked>V.corneae
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

<c:if test="${projectId eq 'AmoebaDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="acasNeff" checked>A.castellanii
            </td>
            <td>
              <input type="checkbox" name="genomes" value="edisSAW760" checked>E.dispar
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehisHM1IMSS" checked>E.histolytica HM-1:IMSS
            </td> 
            <td>
              <input type="checkbox" name="genomes" value="ehisHM1IMSS-A" checked>E.histolytica HM-1:IMSS-A
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehisHM1IMSS-B" checked>E.histolytica HM-1:IMSS-B
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehisHM3IMSS" checked>E.histolytica HM-3:IMSS
            </td>
            <td>
              <input type="checkbox" name="genomes" value="ehisKU27" checked>E.histolytica KU27
            </td> 
            <td>
              <input type="checkbox" name="genomes" value="einvIP1" checked>E.invadens
            </td>
            <td>
              <input type="checkbox" name="genomes" value="emosLaredo" checked>E.moshkovskii
            </td>
            <td>
              <input type="checkbox" name="genomes" value="enutP19" checked>E.nuttalli
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>

<c:if test="${projectId eq 'GiardiaDB'}">

   <tr><td align="left"><b>Genomes to Align:</b>&nbsp;&nbsp;<br />
        <table>
          <tr>
            <td>
              <input type="checkbox" name="genomes" value="gassAWB" checked>Giardia Assemblage A
            </td>
            <td>
              <input type="checkbox" name="genomes" value="gassBGS" checked>Giardia Assemblage B
            </td>
            <td>
              <input type="checkbox" name="genomes" value="gassEP15" checked>Giardia Assemblage E
            </td>
           </tr>
         </table>
     </td></tr>
</c:if>


    <tr><td align="left"><b>Output Format:</b>&nbsp;&nbsp;
        <input type="radio" name="type" value="clustal" checked>clustal

        <input type="radio" name="type" value="fasta_ungapped">multi fasta
     </td></tr>
    <tr><td align="left"><br><input type="submit" name='go' value='Get Alignment' />
	<span style="font-size:90%;">&nbsp;&nbsp;&nbsp;(Alignments made with <a href="http://www.biostat.wisc.edu/~cdewey/mercator/">Mercator</a>)</span>
	</td>
     </tr>
    </table>
   </td></tr></table>
</form>


