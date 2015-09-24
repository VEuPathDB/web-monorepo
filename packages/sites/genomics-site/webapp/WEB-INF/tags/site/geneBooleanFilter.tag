<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
          xmlns:jsp="http://java.sun.com/JSP/Page"
          xmlns:c="http://java.sun.com/jsp/jstl/core"
          xmlns:fmt="http://java.sun.com/jsp/jstl/fmt"
          xmlns:fn="http://java.sun.com/jsp/jstl/functions"
          xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="summary"
                           type="org.gusdb.wdk.model.filter.FilterSummary"
                           required="true"
                           description="Filter summary value."/>

  <jsp:directive.attribute name="step"
                           type="org.gusdb.wdk.model.jspwrap.StepBean"
                           required="true"
                           description="Step being filtered."/>

  <!-- counts -->
  <c:set var="YY" value="${summary.counts['YY']}"/>
  <c:set var="YN" value="${summary.counts['YN']}"/>
  <c:set var="NY" value="${summary.counts['NY']}"/>
  <c:set var="NN" value="${summary.counts['NN']}"/>

<!--   <table data-display="${YN ne null or NY ne null or NN ne null}"> -->
  <table data-display="${YN ne null or NY ne null}"> 
    <tr class="headerrow">
      <td><!-- checkbox --></td>
      <th>Transcripts included...</th>
      <th>...in top step result</th>
      <th>...in previous step result</th>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YY"/></td>
      <td>${YY eq null ? 0 : YY}</td>
      <td>Y</td>
      <td>Y</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="YN"/></td>
      <td>${YN eq null ? 0 : YN}</td>
      <td>Y</td>
      <td>N</td>
    </tr>
    <tr>
      <td><input name="values" type="checkbox" value="NY"/></td>
      <td>${NY eq null ? 0 : NY}</td>
      <td>N</td>
      <td>Y</td>
    </tr>
<!--
    <tr>
      <td><input name="values" type="checkbox" value="NN"/></td>
      <td>N</td>
      <td>N</td>
      <td>${NN eq null ? 0 : NN}</td>
    </tr>
-->
  </table>

</jsp:root>
