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

  <table data-display="${YN ne null or NY ne null}"> 
  <tr>
  <td style="font-weight:bold">Select transcripts returned by: </td>
  <td>
    <table>
    <c:if test="${YY ne null}">
    <tr>
      <td><input name="values" type="checkbox" value="YY"/></td>
      <td>both your previous step and latest search (${YY eq null ? 0 : YY})</td>
    </tr>
    </c:if>
    <c:if test="${YN ne null}">
    <tr>
      <td><input name="values" type="checkbox" value="YN"/></td>
      <td>your previous step, but not your latest search (${YN eq null ? 0 : YN})</td>
    </tr>
    </c:if>
    <c:if test="${NY ne null}">
    <tr>
      <td><input name="values" type="checkbox" value="NY"/></td>
      <td>your latest search, but not your previous step (${NY eq null ? 0 : NY})</td>
    </tr>
    </c:if>
    </table>
  </td>
  </tr>
  </table>

</jsp:root>
