<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="tblName"
              required="true"
              description="name of table attribute"
%>

<%@ attribute name="isOpen"
              required="true"
              description="Is show/hide block initially open, by default?"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tblName]}" var="tbl"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="project" value="${wdkModel.displayName}"/>
<c:if test="${suppressDisplayName == null || !suppressDisplayName}">
  <c:set value="${tbl.tableField.displayName}" var="tableDisplayName"/>
</c:if>
  
<c:set var="noData" value="false"/>

<c:set var="tableClassName">
  <c:choose>
    <c:when test="${dataTable eq true}">recordTable wdk-data-table</c:when>
    <c:otherwise>recordTable</c:otherwise>
  </c:choose>
</c:set>

<%-- ================================ --%>
<c:set var="tblContent">

<div class="table-description">${tbl.tableField.description}</div>


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

<%@ attribute name="inputContig"
              description="boolean, use text box to get contig if true"
%>

<%@ attribute name="revCompOn"
              description="boolean"
%>


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

<form action="${cgiUrl}/${cgiScript}" onSubmit="popupform(this, ${cgiScript})">

  <input name='project_id' value='${projectId}' type='hidden' />
<%--
  <c:if test="${inputContig == null}">
    <input name='contig' value='${contigId}' type='hidden' /> 
  </c:if>
--%>
 <table> 
<%--     <c:if test="${inputContig != null}"> --%>
      <tr>
        <td align="left"><b>Contig ID:</b>
          <input type="text" name="contig" value="${contigId}">
        </td>
      </tr>
<%--     </c:if>  --%>
        
    <tr><td><b>Nucleotide positions:</b>
        <input type="text" name="start" value="${start}" maxlength="10" size="10"/>
     to <input type="text" name="stop" value="${end}" maxlength="10" size="10"/>

     &nbsp;&nbsp;&nbsp;&nbsp;
         <input type="checkbox" name="revComp" ${initialCheckBox}>Reverse & Complement
         </td>
      </tr>

   <tr>
     <td align="left"><b>Genomes to Align:</b>
     </td>
  </tr>

  <tr>
   <td style="padding:0">

  <form name="checkHandleForm-mercator" method="post" action="/dosomething.jsp" onsubmit="return false;">

<table >
<c:forEach var="row" items="${tbl}">
  <c:set var="i" value="${i+1}"/>
  <c:if test="${i % 4 == 1}">
     <tr>
  </c:if>
  <c:forEach var="rColEntry" items="${row}">
    <c:set var="attributeValue" value="${rColEntry.value}"/>
    <c:if test="${attributeValue.attributeField.internal == false}"> 
      <td nobr style="padding:2px"><imp:wdkAttribute attributeValue="${attributeValue}" truncate="false" /></td>
     </c:if> 
    </c:forEach>
  <c:if test="${i % 4 == 0}">
    </tr>
  </c:if>
</c:forEach>
</table>

  <table width="100%">
  <tr>
    <td align=center>
      <input type="button" name="CheckAll" value="Check All"  onClick="wdk.api.checkboxAll(jQuery('input:checkbox[name=genomes]'))">
      <input type="button" name="UnCheckAll" value="Uncheck All" onClick="wdk.api.checkboxNone(jQuery('input:checkbox[name=genomes]'))">
    </td>
  </tr> 
  </table>

 </form>

  </td>
  </tr>


    <tr><td align="left"><b>Select output:</b>&nbsp;&nbsp;</td></tr>
    <tr><td align="left"><input type="radio" name="type" value="clustal" checked>Multiple sequence alignment (clustal)
      <span style="font-size:90%;">&nbsp;&nbsp;&nbsp;(Alignments made with <a href="http://www.biostat.wisc.edu/~cdewey/mercator/">Mercator</a>)</span>
      </td></tr>
    <tr><td align="left"><input type="radio" name="type" value="fasta_ungapped">Multi-FASTA</td></tr>
    <tr><td align="left"><input type="submit" name='go' value='Submit' /></td></tr>
  </table>
</form>



</c:set>

<c:if test="${tableError != null}">
    <c:set var="exception" value="${tableError}" scope="request"/>
        <c:set var="tblContent" value="<i>Error. Data is temporarily unavailable</i>"/>
</c:if>

<imp:toggle name="${tblName}" displayName="${tableDisplayName}"
             content="${tblContent}" isOpen="${isOpen}" noData="${noData}" />
