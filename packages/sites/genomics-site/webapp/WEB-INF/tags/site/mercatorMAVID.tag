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

<c:if test="${inputContig == null}">
 <c:set var="headerFiller" value="of <i>${contigId}</i>"/>
</c:if>

<c:if test="${revCompOn == 1}">
 <c:set var="initialCheckBox" value="CHECKED"/>
</c:if>


<form action="${cgiUrl}/mavidAlign" onSubmit="popupform(this, 'mavidAlign')">
 <table border="0" cellpadding="${cellPadding}" cellspacing="1">
  <tr class="${bkgClass}"><td>
   <table border="0" cellpadding="${cellPadding}">
    <tr><td colspan="2">
    <b><font size="+1">Retrieve <a href="http://www.biostat.wisc.edu/~cdewey/mercator/">Mercator</a> 
   and <a href="http://www.genome.org/cgi/content/abstract/14/4/693">MAVID</a> 
   generated alignments ${headerFiller} across available genomes.</font></b>
<br><br>
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
    <tr><td align="left"><b>Output Format:</b>&nbsp;&nbsp;
        <input type="radio" name="type" value="clustal" checked>clustal
        <input type="radio" name="type" value="fasta_gapped">multi fasta (gapped)
        <input type="radio" name="type" value="fasta_ungapped">multi fasta
     </td></tr>
    <tr><td align="left"><input type="submit" name='go' value='Get Alignment' /></td></tr>
    </table>
   </td></tr></table>
</form>
