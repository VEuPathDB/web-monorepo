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

<c:set var="colTooltip" value="Click on 'Add Columns' to select search specific columns that will show if a transcript matched the previous and/or the latest search." />

<!-- VERTICAL layout -->

<table id="booleanFilter" data-display="${YN ne null or NY ne null or NN ne null}" data-YY="${YY}" data-YN="${YN}" data-NY="${NY}" data-NN="${NN}">
<tr>
  <td id="prompt">Include Transcripts returned by: </td>
  <td>
    <table>
    <tr>
      <td><input name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} amount="${YY eq null ? 0 : YY}"/></td>
      <td class="${YY eq null ? 'muted' : ''} aleft">both searches</td>
      <td title="${colTooltip}"><imp:image  src="images/YY.png" /></td>
      <td class="${YY eq null ? 'muted' : ''} aright"><b>${YY eq null ? 0 : YY}</b> transcripts</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} amount="${YN eq null ? 0 : YN}"/></td>
      <td class="${YN eq null ? 'muted' : ''} aleft">just your previous search</td>
      <td title="${colTooltip}"><imp:image src="images/YN.png" /></td>
      <td class="${YN eq null ? 'muted' : ''} aright"><b>${YN eq null ? 0 : YN}</b> transcripts</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} amount="${NY eq null ? 0 : NY}"/></td>
      <td class="${NY eq null ? 'muted' : ''} aleft">just your latest search</td>
      <td title="${colTooltip}"><imp:image src="images/NY.png" /></td>
      <td class="${NY eq null ? 'muted' : ''} aright"><b>${NY eq null ? 0 : NY}</b> transcripts</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} amount="${NN eq null ? 0 : NN}"/></td>
      <td class="${NN eq null ? 'muted' : ''} aleft">neither search</td>
      <td title="${colTooltip}"><imp:image  src="images/NN.png" /></td>
      <td class="${NN eq null ? 'muted' : ''} aright"><b>${NN eq null ? 0 : NN}</b> transcripts</td>
    </tr>
    </table>
  </td>
</tr>
</table>

