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
  table#booleanFilter img  {
    vertical-align: text-bottom; 
    margin-left:10px;
    width:80px;
  }

</style>

  <table data-display="${YN ne null or NY ne null or NN ne null}" data-YY="${YY}" data-YN="${YN}" data-NY="${NY}" data-NN="${NN}"> 
  <tr>
  <td style="font-weight:bold">Include Transcripts returned by: </td>
  <td>
    <table id="booleanFilter"  style="margin-left:10px;padding:0 10px 10px">
    <tr>
      <td><input name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} /></td>
      <td class="${YY eq null ? 'muted' : ''} aleft">both searches</td>
      <td class="${YY eq null ? 'muted' : ''} aright">${YY eq null ? 0 : YY}</td>
      <td><imp:image  src="wdk/images/YY.png" /></td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} /></td>
      <td class="${YN eq null ? 'muted' : ''} aleft">just your previous search</td>
      <td class="${YN eq null ? 'muted' : ''} aright">${YN eq null ? 0 : YN}</td>
      <td><imp:image src="wdk/images/YN.png" /></td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} /></td>
      <td class="${NY eq null ? 'muted' : ''} aleft">just your latest search</td>
      <td class="${NY eq null ? 'muted' : ''} aright">${NY eq null ? 0 : NY}</td>
      <td><imp:image src="wdk/images/NY.png" /></td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} /></td>
      <td class="${NN eq null ? 'muted' : ''} aleft">neither search</td>
      <td class="${NN eq null ? 'muted' : ''} aright">${NN eq null ? 0 : NN}</td>
      <td><imp:image  src="wdk/images/NN.png" /></td>
    </tr>
    </table>


<!--
    <table style="font-size:120%;margin-left:10px;padding:0 10px 10px">
    <tr>
      <td colspan=2 style="padding:4px 40px"><imp:image style="margin-left:10px;width:100px" src="wdk/images/YY.png" /></td>
      <td colspan=2 style="padding:4px 40px"><imp:image style="margin-left:10px;width:100px" src="wdk/images/YN.png" /></td>
      <td colspan=2 style="padding:4px 40px"><imp:image style="margin-left:10px;width:100px" src="wdk/images/NY.png" /></td>
      <td colspan=2 style="padding:4px 40px"><imp:image style="margin-left:10px;width:100px" src="wdk/images/NN.png" /></td>
    </tr>
    <tr>
      <td class="aright"><input style="transform:scale(1.2)" name="values" type="checkbox" value="YY" ${YYdisabled} ${YYchecked} /></td>
      <td class="${YY eq null ? 'muted' : ''} aleft">both searches</td>
      <td class="aright"><input style="transform:scale(1.2)" name="values" type="checkbox" value="YN" ${YNdisabled} ${YNchecked} /></td>
      <td class="${YN eq null ? 'muted' : ''} aleft">just your previous search</td>
      <td class="aright"><input style="transform:scale(1.2)" name="values" type="checkbox" value="NY" ${NYdisabled} ${NYchecked} /></td>
      <td class="${NY eq null ? 'muted' : ''} aleft">just your latest search</td>
      <td class="aright"><input style="transform:scale(1.2)" name="values" type="checkbox" value="NN" ${NNdisabled} ${NNchecked} /></td>
      <td class="${NN eq null ? 'muted' : ''} aleft">neither search</td>
    </tr>
    <tr>
      <td id="center"  colspan=2 class="${YY eq null ? 'muted' : ''}">(${YY eq null ? 0 : YY})</td>
      <td id="center"  colspan=2 class="${YN eq null ? 'muted' : ''}">(${YN eq null ? 0 : YN})</td>
      <td id="center"  colspan=2 class="${NY eq null ? 'muted' : ''}">(${NY eq null ? 0 : NY})</td>
      <td id="center"  colspan=2 class="${NN eq null ? 'muted' : ''}">(${NN eq null ? 0 : NN})</td>
    </tr>

    </table>
-->


  </td>
  </tr>
  </table>

