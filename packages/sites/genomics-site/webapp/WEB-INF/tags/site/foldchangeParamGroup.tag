<?xml version="1.0" encoding="UTF-8"?>

<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="paramGroup" type="java.util.Map" required="true"/>

  <c:set var="profileset_genericParam" value="${paramGroup['profileset_generic']}"/>
  <c:set var="regulated_dirParam" value="${paramGroup['regulated_dir']}"/>
  <c:set var="fold_changeParam" value="${paramGroup['fold_change']}"/>

  <c:set var="samples_fc_ref_genericParam" value="${paramGroup['samples_fc_ref_generic']}"/>
  <c:set var="min_max_avg_refParam" value="${paramGroup['min_max_avg_ref']}"/>
  <c:set var="samples_fc_comp_genericParam" value="${paramGroup['samples_fc_comp_generic']}"/>
  <c:set var="min_max_avg_compParam" value="${paramGroup['min_max_avg_comp']}"/>

  <c:set var="protein_coding_onlyParam" value="${paramGroup['protein_coding_only']}"/>

  <div id="profileset_genericaaa" class="param-line">
    <span class="text">For the
      <span class="prompt">Experiment</span></span>
    <imp:enumParamInput qp="${profileset_genericParam}"/>
    <img class="help-link"
      style="cursor:pointer"
      title="${fn:escapeXml(profileset_genericParam.help)}"
      src="${pageContext.request.contextPath}/wdk/images/question.png" />
  </div>

  <div class="param-line">
    <span class="text">return
      <imp:enumParamInput qp="${protein_coding_onlyParam}"/>
      <img class="help-link"
        style="cursor:pointer"
        title="${fn:escapeXml(protein_coding_onlyParam.help)}"
        src="${pageContext.request.contextPath}/wdk/images/question.png" />
      <span class="prompt">Genes</span>
    </span>
  </div>
  <div id="regulated_diraaa" class="param-line">
    <span class="text">that are</span>
    <imp:enumParamInput qp="${regulated_dirParam}"/>
    <img class="help-link"
      style="cursor:pointer"
      title="${fn:escapeXml(regulated_dirParam.help)}"
      src="${pageContext.request.contextPath}/wdk/images/question.png" />
  </div>

  <div class="param-line">
    <span class="text">with a
      <span class="prompt">Fold change</span> &amp;gt;=</span>
    <imp:stringParamInput qp="${fold_changeParam}"/>
    <img class="help-link"
      style="cursor:pointer"
      title="${fn:escapeXml(fold_changeParam.help)}"
      src="${pageContext.request.contextPath}/wdk/images/question.png" />
  </div>

  <div class="samples ui-helper-clearfix">
    <div class="param-line" style="margin-top: 4px">
      <span class="text">between
        <span class="reference-label">Reference Samples</span>
        <jsp:text> </jsp:text>
        <img class="help-link"
          style="cursor:pointer"
          title="${fn:escapeXml(samples_fc_ref_genericParam.help)}"
          src="${pageContext.request.contextPath}/wdk/images/question.png" />
      </span>
    </div>

    <div class="reference">
      <div id="samples_fc_ref_genericaaa">
        <imp:enumParamInput qp="${samples_fc_ref_genericParam}"/>
      </div>
      <div id="min_max_avg_refaaa" class="param-line">
        <span class="text">Calculate the fold change using the</span>
        <imp:enumParamInput qp="${min_max_avg_refParam}"/>
        <img class="help-link"
          style="cursor:pointer"
          title="${fn:escapeXml(min_max_avg_refParam.help)}"
          src="${pageContext.request.contextPath}/wdk/images/question.png" />
        <span class="text">
          <span class="prompt">expression value</span>
          of my chosen reference samples.</span>
      </div>
    </div>

    <div class="param-line" style="margin-top: 1em">
      <span class="text">and
        <span class="comparison-label">Comparison Samples</span>
        <jsp:text> </jsp:text>
        <img class="help-link"
          style="cursor:pointer"
          title="${fn:escapeXml(samples_fc_comp_genericParam.help)}"
          src="${pageContext.request.contextPath}/wdk/images/question.png" />
      </span>
    </div>

    <div class="comparison">
      <div id="samples_fc_comp_genericaaa">
        <imp:enumParamInput qp="${samples_fc_comp_genericParam}"/>
      </div>
      <div id="min_max_avg_compaaa" class="param-line">
        <span class="text">Calculate the fold change using the</span>
        <imp:enumParamInput qp="${min_max_avg_compParam}"/>
        <img class="help-link"
          style="cursor:pointer"
          title="${fn:escapeXml(min_max_avg_compParam.help)}"
          src="${pageContext.request.contextPath}/wdk/images/question.png" />
        <span class="text">
          <span class="prompt">expression value</span>
          of my chosen comparison samples.</span>
      </div>
    </div>
  </div>

</jsp:root>
