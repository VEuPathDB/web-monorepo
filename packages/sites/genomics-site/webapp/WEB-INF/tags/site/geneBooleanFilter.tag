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
<c:set var="YY" value="${summary.counts['YY']}"/> <!-- empty string when 0 -->
<c:set var="YN" value="${summary.counts['YN']}"/>
<c:set var="NY" value="${summary.counts['NY']}"/>
<c:set var="NN" value="${summary.counts['NN']}"/>

<c:set var="option" value="${step.filterOptions.filterOptions['gene_boolean_filter_array']}"/>
<c:set var="values" value="${option.value}"/>
<%-- ${values}  contains default checkboxes or what was stored in the step, eg:  {"values":["YY","YN","NY"]} 
--%>

<c:set var="YYchecked" value="${fn:contains(values,'YY') ? 'checked' : 'unchecked'}" />
<c:set var="YNchecked" value="${fn:contains(values,'YN') ? 'checked' : 'unchecked'}" />
<c:set var="NYchecked" value="${fn:contains(values,'NY') ? 'checked' : 'unchecked'}" />
<c:set var="NNchecked" value="${fn:contains(values,'NN') ? 'checked' : 'unchecked'}" />
<c:set var="YYdisabled" value="${YY eq null ? 'disabled' : ''}" />
<c:set var="YNdisabled" value="${YN eq null ? 'disabled' : ''}" />
<c:set var="NYdisabled" value="${NY eq null ? 'disabled' : ''}" />
<c:set var="NNdisabled" value="${NN eq null ? 'disabled' : ''}" />


<style>
  table#booleanFilter td#prompt{
    font-weight:bold;
  }
  table#booleanFilter table img  {
    width:80px;
  }
</style>


<!-- VERTICAL layout

<style>
/* bigger font, checkboxes and button */
  div.gene-boolean-filter-controls button {
    margin-top:10px;
    transform:scale(1.2);
  }
  table#booleanFilter {
    font-size:120%;
  }
  table#booleanFilter table input {
    transform:scale(1.2);
  }

/* other */
  table#booleanFilter table td{
    padding:1px;
  }
  table#booleanFilter table img  {
    vertical-align: text-bottom; 
    margin-left:10px;
  }
</style>

<table id="booleanFilter" data-display="${YN ne null or NY ne null or NN ne null}" data-YY="${YY}" data-YN="${YN}" data-NY="${NY}" data-NN="${NN}"> 
<tr>
  <td id="prompt">Include Transcripts returned by: </td>
  <td>
    <table>
    <tr>
      <td><input name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} /></td>
      <td><imp:image  src="images/YY.png" /></td>
      <td class="${YY eq null ? 'muted' : ''} aleft">both searches</td>
      <td class="${YY eq null ? 'muted' : ''} aright">( ${YY eq null ? 0 : YY} transcripts )</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} /></td>
      <td><imp:image src="images/YN.png" /></td>
      <td class="${YN eq null ? 'muted' : ''} aleft">just your previous search</td>
      <td class="${YN eq null ? 'muted' : ''} aright">( ${YN eq null ? 0 : YN} transcripts )</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} /></td>
      <td><imp:image src="images/NY.png" /></td>
      <td class="${NY eq null ? 'muted' : ''} aleft">just your latest search</td>
      <td class="${NY eq null ? 'muted' : ''} aright">( ${NY eq null ? 0 : NY} transcripts )</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} /></td>
      <td><imp:image  src="images/NN.png" /></td>
      <td class="${NN eq null ? 'muted' : ''} aleft">neither search</td>
      <td class="${NN eq null ? 'muted' : ''} aright">( ${NN eq null ? 0 : NN} transcripts )</td>
    </tr>
    </table>
  </td>
</tr>
</table>

-->

<!-- HORIZONTAL layout -->

<style>
 table#booleanFilter table td {
    border-right:1px solid grey;
    padding-right:60px;
  }
  table#booleanFilter table td:last-child {
    border-right:0;
    padding-right:0;
  }
</style>


<table id="booleanFilter" data-display="${YN ne null or NY ne null or NN ne null}" data-YY="${YY}" data-YN="${YN}" data-NY="${NY}" data-NN="${NN}"> 
  <tr>
    <td id="prompt" class="acenter"><br>Include Transcripts returned by: </td>
  </tr>
  <tr>
    <td>
    <table>
    <tr>
      <td class="${YY eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} /> both searches</td>
      <td class="${YN eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} /> just your previous search</td>
      <td class="${NY eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} /> just your latest search</td>
      <td class="${NN eq null ? 'muted' : ''}"><input name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} /> neither search</td>
    </tr>
    <tr>
      <td><imp:image src="images/YY.png" /></td>
      <td><imp:image src="images/YN.png" /></td>
      <td><imp:image src="images/NY.png" /></td>
      <td><imp:image src="images/NN.png" /></td>
    </tr>
    <tr>
      <td class="center ${YY eq null ? 'muted' : ''}"><b>${YY eq null ? 0 : YY}</b> transcripts</td>
      <td class="center ${YN eq null ? 'muted' : ''}"><b>${YN eq null ? 0 : YN}</b> transcripts</td>
      <td class="center ${NY eq null ? 'muted' : ''}"><b>${NY eq null ? 0 : NY}</b> transcripts</td>
      <td class="center ${NN eq null ? 'muted' : ''}"><b>${NN eq null ? 0 : NN}</b> transcripts</td>
    </tr>
    </table>
    </td>
  </tr>
</table>


