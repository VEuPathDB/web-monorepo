<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="summary"
              type="org.gusdb.wdk.model.filter.FilterSummary"
              required="true"
              description="Filter summary value."
%>
<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step being filtered."
%>
  
<!-- transcript counts -->
<c:set var="Y" value="${summary.counts['Y']}"/> <!-- empty string when 0 -->
<c:set var="N" value="${summary.counts['N']}"/>

<c:set var="option" value="${step.filterOptions.filterOptions['gene_leaf_filter_array']}"/>
<c:set var="values" value="${option.value}"/>
<%-- ${values}  contains default checkboxes or what was stored in the step, eg:  {"values":["Y"]} 
--%>

<c:set var="Ychecked" value="${fn:contains(values,'Y') ? 'checked' : 'unchecked'}" />
<c:set var="Nchecked" value="${fn:contains(values,'N') ? 'checked' : 'unchecked'}" />
<c:set var="Ydisabled" value="${Y eq null ? 'disabled' : ''}" />
<c:set var="Ndisabled" value="${N eq null ? 'disabled' : ''}" />


<style>
  table#leafFilter td#prompt{
    font-weight:bold;
  }
  table#leafFilter table img  {
    width:80px;
  }
</style>


<!-- HORIZONTAL layout   (vertical layout table is below commented out)  -->

<style>
 table#leafFilter table td {
    padding-right:60px;
  }
  table#leafFilter table td:last-child {
    border-right:0;
    padding-right:0;
  }
</style>


<table id="leafFilter" data-display="${N ne null}" data-Y="${Y}" data-N="${N}"> 
  <tr>
    <td id="prompt" class="acenter"><br>Include Transcripts returned and/or not returned? </td>
  </tr>
  <tr>
    <td>
    <table>
    <tr>
      <td class="${Y eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="Y" ${Ydisabled} ${Ychecked} /> Y </td>
      <td class="${N eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="N" ${Ndisabled} ${Nchecked} /> N </td>
    </tr>
    <tr>
      <td class="center ${Y eq null ? 'muted' : ''}"><b>${Y eq null ? 0 : Y}</b> transcripts</td>
      <td class="center ${N eq null ? 'muted' : ''}"><b>${N eq null ? 0 : N}</b> transcripts</td>
    </tr>
    </table>
    </td>
  </tr>
</table>




<!-- VERTICAL layout

<style>
/* bigger font, checkboxes and button */
  div.gene-leaf-filter-controls button {
    margin-top:10px;
    transform:scale(1.2);
  }
  table#leafFilter {
    font-size:120%;
  }
  table#leafFilter table input {
    transform:scale(1.2);
  }

/* other */
  table#leafFilter table td{
    padding:1px;
  }
  table#leafFilter table img  {
    vertical-align: text-bottom; 
    margin-left:10px;
  }
</style>

<table id="leafFilter" data-display="${N ne null}" data-Y="${Y}" data-N="${N}"> 
<tr>
  <td id="prompt">Include Transcripts returned and/or not returned? </td>
  <td>
    <table>
    <tr>
      <td><input name="values" type="checkbox" value="Y" ${Ydisabled} ${Ychecked} /></td>
      <td class="${Y eq null ? 'muted' : ''} aleft">Y</td>
      <td class="${Y eq null ? 'muted' : ''} aright">( ${Y eq null ? 0 : Y} transcripts )</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="N" ${Ndisabled} ${Nchecked} /></td>
      <td><imp:image  src="images/NN.png" /></td>
      <td class="${N eq null ? 'muted' : ''} aleft">N</td>
      <td class="${N eq null ? 'muted' : ''} aright">( ${N eq null ? 0 : N} transcripts )</td>
    </tr>
    </table>
  </td>
</tr>
</table>

-->
