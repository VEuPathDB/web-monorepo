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

  <table data-display="${YN ne null or NY ne null or NN ne null}" data-YY="${YY}" data-YN="${YN}" data-NY="${NY}" data-NN="${NN}"> 
  <tr>
  <td style="font-weight:bold">Select transcripts returned by: </td>
  <td>
    <table>
    <tr>
      <td><input name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} /></td>
      <td class="${YY eq null ? 'muted' : ''} aleft">both your previous step and latest search</td>
      <td class="${YY eq null ? 'muted' : ''} aright">${YY eq null ? 0 : YY}</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} /></td>
      <td class="${YN eq null ? 'muted' : ''} aleft">your previous step, but not your latest search</td>
      <td class="${YN eq null ? 'muted' : ''} aright">${YN eq null ? 0 : YN}</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} /></td>
      <td class="${NY eq null ? 'muted' : ''} aleft">your latest search, but not your previous step</td>
      <td class="${NY eq null ? 'muted' : ''} aright">${NY eq null ? 0 : NY}</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} /></td>
      <td class="${NN eq null ? 'muted' : ''} aleft">neither your latest search nor your previous step</td>
      <td class="${NN eq null ? 'muted' : ''} aright">${NN eq null ? 0 : NN}</td>
    </tr>
    </table>
  </td>
  </tr>
  </table>

