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

<%@ attribute name="step"
              required="true"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
%>

<%@ attribute name="stepType"
              required="true"
              type="java.lang.String"
%>
<c:set var="pMap" value="${question.paramsMap}"/>

<jsp:useBean id="typeMap" class="java.util.HashMap"/>
<c:set target="${typeMap}" property="singular" value="${step.displayType}"/>
<wdk:getPlural pluralMap="${typeMap}"/>
<c:set var="pluralType" value="${typeMap['plural']}"/>

<c:set var="regionOnClick" value="updateRegionParams(this);" />

<div id="group_${groupName}" class="regionParams">

<%--
  <div class="regionHeader">Specify a <span class="region region_${groupName}">region</span> relative to each of the ${step.resultSize} ${pluralType} in Step <span class="${stepType}_num"></span></div>
--%>
 <div class="regionHeader">(${step.resultSize} ${pluralType} in Step <span class="${stepType}_num"></span>)</div>

  <div id="scale_${groupName}" class="regionGraphic"></div>
  <fieldset id="set_${groupName}Fields">
    <ul class="horizontal singeline">
      <li style="padding-bottom:4px"><input type="radio" name="value(region_${groupName})" id="region_${groupName}" value="exact" onclick="${regionOnClick}" checked>Exact</input></li>
      <li>
        <input type="radio" name="value(region_${groupName})" id="region_${groupName}" value="upstream" onclick="${regionOnClick}">Upstream:</input>
        <input type="text" class="regionText" name="upstream_region_${groupName}" value="1000"/>&nbsp;bp
      </li>
      <li>
        <input type="radio" name="value(region_${groupName})" id="region_${groupName}" value="downstream" onclick="${regionOnClick}">Downstream:</input>
        <input type="text" class="regionText" name="downstream_region_${groupName}" value="1000"/>&nbsp;bp
      </li>
    </ul>
    <ul class="horizontal">
      <li><input type="radio" name="value(region_${groupName})" id="region_${groupName}" value="custom" onclick="${regionOnClick}">Custom:</input></li>
      <li>
    <table class="offsetOptions">
      <tr>
        <c:set var="span_begin" value="span_begin_${groupName}"/>
        <td style="text-align:right;padding-bottom:0px;">begin at:</td>
	<td style="padding-bottom:0px;"><wdk:enumParamInput qp="${pMap[span_begin]}"/></td>
        <c:set var="span_begin_direction" value="span_begin_direction_${groupName}"/>
        <td style="padding-bottom:0px;"><wdk:enumParamInput qp="${pMap[span_begin_direction]}"/></td>
        <c:set var="span_begin_offset" value="span_begin_offset_${groupName}"/>
        <td style="padding-bottom:0px;" align="left" valign="top">
          <html:text styleId="${span_begin_offset}" property="value(${span_begin_offset})" styleClass="regionText" />&nbsp;bp
        </td>
      </tr>
      <tr>
        <c:set var="span_end" value="span_end_${groupName}"/>
        <td style="text-align:right;padding-top:0px;">end at:</td>
	<td style="padding-top:0px;"><wdk:enumParamInput qp="${pMap[span_end]}"/></td>
        <c:set var="span_end_direction" value="span_end_direction_${groupName}"/>
        <td style="padding-top:0px;"><wdk:enumParamInput qp="${pMap[span_end_direction]}"/></td>
        <c:set var="span_end_offset" value="span_end_offset_${groupName}"/>
        <td style="padding-top:0px;" align="left" valign="top">
          <html:text styleId="${span_end_offset}" property="value(${span_end_offset})" styleClass="regionText" />&nbsp;bp
        </td>
      </tr>
    </table>
      </li>
    </ul>
  </fieldset>
</div>
       <c:choose>
         <c:when test="${step.displayType eq 'SNP'}">
            <c:set var="featureLength" value="1" />
         </c:when>
         <c:otherwise>
            <c:set var="featureLength" value="2000" />
         </c:otherwise>
       </c:choose>
<script>
           feature_length_${groupName} = ${featureLength};
</script>
