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
 <c:set var="headerFiller" value="<i>${contigId}</i> and"/>
</c:if>


<form action="${cgiUrl}/mavidAlign" onSubmit="popupform(this, 'mavidAlign')">
 <table border="0" cellpadding="${cellPadding}" cellspacing="1">
  <tr class="${bkgClass}"><td>
   <table border="0" cellpadding="${cellPadding}">
    <tr><td colspan="2"><h3>Retrieve the Multiple Alignment for ${headerFiller} All Available Genomes</h3>
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
        <input type="text" name="start" value="${start}" maxlength="7" size="8"/>
     to <input type="text" name="stop" value="${end}" maxlength="7" size="8"/>
     &nbsp;&nbsp;&nbsp;&nbsp;
         <input type="checkbox" name="revComp">Reverse & Complement</td></tr>
    <tr><td align="left"><b>Output Format:</b>&nbsp;&nbsp;
        <input type="radio" name="type" value="clustal" checked>clustal
        <input type="radio" name="type" value="fasta_gapped">multi fasta (gapped)
        <input type="radio" name="type" value="fasta_ungapped">multi fasta
     </td></tr>
    <tr><td align="left"><input type="submit" name='go' value='Get Sequences' /></td></tr>
    </table>
   </td></tr></table>
</form>
