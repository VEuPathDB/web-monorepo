<?xml version="1.0" encoding="UTF-8"?>

<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="paramGroup" type="java.util.Map" required="true"/>

  <c:set var="profilesetParam" value="${paramGroup['profileset']}"/>
  <c:set var="samples_fc_ref_genericParam" value="${paramGroup['samples_fc_ref_generic']}"/>
  <c:set var="preferred_compoundsParam" value="${paramGroup['preferred_compounds']}"/>
  <c:set var="percentile_any_allParam" value="${paramGroup['percentile_any_all']}"/>
  <c:set var="lower_percentileParam" value="${paramGroup['lower_percentile']}"/>
  <c:set var="upper_percentileParam" value="${paramGroup['upper_percentile']}"/>

  <div class="fold-change ui-helper-clearfix" data-controller="eupathdb.percentile.init"> <!-- What is this? -->

	<div class="fold-change-params">
	  <div id="profilesetaaa" class="param-line">
        <span class="text">For the 
          <span class="prompt">Experiment</span></span>
        <imp:enumParamInput qp="${profilesetParam}"/>
        <imp:helpIcon helpContent="${profilesetParam.help}" />
      </div>

      <div id="lowerpercentile" class="param-line">
        <span class="text">return compounds that are between</span>
        <imp:enumParamInput qp="${lower_percentileParam}"/>
        <imp:helpIcon helpContent="${lower_percentileParam.help}" />
      </div>

      <div id="upperpercentile" class="param-line">
        <span class="text">and</span>
        <imp:enumParamInput qp="${upper_percentileParam}"/>
        <imp:helpIcon helpContent="${upper_percentileParam.help}" />
      </div>

      <div id="preferred_compoundsaaa" class="param-line">
        <span class="text">and that are</span>
        <imp:enumParamInput qp="${preferred_compoundsParam}"/>
        <imp:helpIcon helpContent="${preferred_compoundsParam.help}" />
      </div>

      <div class="param-line" style="padding-bottom:0">
          <span class="text">
            in the following <span class="samples-tab reference">Reference Samples</span>
            <jsp:text> </jsp:text>
            <imp:helpIcon helpContent="${samples_fc_ref_genericParam.help}" />
          </span>
      </div>

    </div>
  </div>

  </jsp:root>
