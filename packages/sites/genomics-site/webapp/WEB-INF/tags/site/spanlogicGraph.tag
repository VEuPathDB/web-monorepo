<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="groupName"
              required="true"
              type="java.lang.String"
%>

<%@ attribute name="question"
              required="true"
              type="org.gusdb.wdk.model.jspwrap.QuestionBean"
%>

<c:set var="pMap" value="${question.paramsMap}"/>

<div id="group_${fn:toLowerCase(groupName)}">
  <div id="scale${groupName}"></div>
  <fieldset id="set${groupName}Fields">
    <div id="offsetOptions">
      <div id="default">
        <input type="radio" name="span_region" value="exact" checked />Exact &nbsp;&ndbsp;
        <input type="radio" name="span_region" value="upstream" />Upstream
        <input type="text" name="span_region_upstream" size="6" value="1000" />bp &nbsp;&ndbsp;
        <input type="radio" name="span_region" value="downstream" />Downstream
        <input type="text" name="span_region_downstream" size="6" value="1000" />bp &nbsp;&ndbsp;
      </div>
      <div style="float:left">
        <input type="radio" name="span_region" value="custom" checked /> Custom &nbsp;&ndbsp;
      </div>
      <table id="custom" cellpadding="2">
        <tr>
          <c:set var="span_begin" value="span_begin_${fn:toLowerCase(groupName)}"/>
          <td style="text-align:right">begin at:</td><td><wdk:enumParamInput qp="${pMap[span_begin]}"/></td>
          <c:set var="span_begin_direction" value="span_begin_direction_${fn:toLowerCase(groupName)}"/>
          <td><wdk:enumParamInput qp="${pMap[span_begin_direction]}"/></td>
          <c:set var="span_begin_offset" value="span_begin_offset_${fn:toLowerCase(groupName)}"/>
          <td align="left" valign="top">
            <html:text styleId="${span_begin_offset}" property="value(${span_begin_offset})" size="6" />
          </td>
        </tr>
        <tr>
          <c:set var="span_end" value="span_end_${fn:toLowerCase(groupName)}"/>
          <td style="text-align:right">end at:</td><td><wdk:enumParamInput qp="${pMap[span_end]}"/></td>
          <c:set var="span_end_direction" value="span_end_direction_${fn:toLowerCase(groupName)}"/>
          <td><wdk:enumParamInput qp="${pMap[span_end_direction]}"/></td>
          <c:set var="span_end_offset" value="span_end_offset_${fn:toLowerCase(groupName)}"/>
          <td align="left" valign="top">
            <html:text styleId="${span_end_offset}" property="value(${span_end_offset})" size="6" />
          </td>
        </tr>
      </table>
    </div>
  </fieldset>
</div>
