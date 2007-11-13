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

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<SCRIPT TYPE="text/javascript">
<!--
function popupform(myform, windowname)
{
if (! window.focus)return true;
window.open('', windowname, 'height=500,width=800,scrollbars=yes,resizable=1');
myform.target=windowname;
return true;
}
//-->
</SCRIPT>

<form action="${cgiUrl}/mavidAlign" onSubmit="popupform(this, 'mavidAlign')">
 <table border="0" cellpadding="5" cellspacing="1">
  <tr class="${bkgClass}"><td>
   <table border="0" cellpadding="0">
    <tr><td colspan="2"><b>Retrieve the Multiple Alignment for <i>${contigId}</i> and All Available Genomes</b>
        <input name='project_id' value='${projectId}' size='20' type='hidden' />
        <input name='contig' value='${contigId}' size='20' type='hidden' />
    </td></tr>
    <tr><td colspan="2">Nucleotide positions: from 
        <input type="text" name="start" value="${start}" maxlength="7" size="8"/>
     to <input type="text" name="stop" value="${end}" maxlength="7" size="8"/>
    </td></tr>
    <tr><td align="left"><input type="checkbox" name="revComp">Reverse complement</td></tr>
    <tr><td align="left">Format:&nbsp;&nbsp;
        <input type="radio" name="type" value="clustal" checked>clustal
        <input type="radio" name="type" value="fasta_gapped">multi fasta (gapped)
        <input type="radio" name="type" value="fasta_ungapped">multi fasta
        </td><td align="right"><input type="submit" name='go' value='Go' /></td></tr>
    </table>
   </td></tr></table>
</form>
