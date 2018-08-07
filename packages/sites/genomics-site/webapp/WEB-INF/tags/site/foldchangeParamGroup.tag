<?xml version="1.0" encoding="UTF-8"?>

<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:html="http://struts.apache.org/tags-html"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="paramGroup" type="java.util.Map" required="true"/>

  <c:set var="profileset_genericParam" value="${paramGroup['profileset_generic']}"/>
  <c:set var="regulated_dirParam" value="${paramGroup['regulated_dir']}"/>
  <c:set var="fold_changeParam" value="${paramGroup['fold_change']}"/>
  <c:set var="hard_floorParam" value="${paramGroup['hard_floor']}"/>

  <c:set var="samples_fc_ref_genericParam" value="${paramGroup['samples_fc_ref_generic']}"/>
  <c:set var="min_max_avg_refParam" value="${paramGroup['min_max_avg_ref']}"/>
  <c:set var="samples_fc_comp_genericParam" value="${paramGroup['samples_fc_comp_generic']}"/>
  <c:set var="min_max_avg_compParam" value="${paramGroup['min_max_avg_comp']}"/>

  <c:set var="protein_coding_onlyParam" value="${paramGroup['protein_coding_only']}"/>

  <div class="fold-change ui-helper-clearfix" data-controller="eupathdb.foldChange.init">

    <div class="fold-change-params">
      <div id="profileset_genericaaa" class="param-line">
        <span class="text">For the
          <span class="prompt">Experiment</span></span>
        <imp:enumParamInput qp="${profileset_genericParam}"/>
        <imp:helpIcon helpContent="${profileset_genericParam.help}"/>
      </div>

      <c:if test="${protein_coding_onlyParam ne null}">
        <div class="param-line">
          <span class="text">return
            <imp:enumParamInput qp="${protein_coding_onlyParam}"/>
            <imp:helpIcon helpContent="${protein_coding_onlyParam.help}" />
            <span class="prompt"> Genes </span>
          </span>
        </div>
      </c:if>

      <div id="regulated_diraaa" class="param-line">
        <c:if test="${protein_coding_onlyParam eq null}">
          return genes
        </c:if>
        <span class="text">that are</span>
        <imp:enumParamInput qp="${regulated_dirParam}"/>
        <imp:helpIcon helpContent="${regulated_dirParam.help}" />
      </div>

      <div class="param-line">
        <span class="text">with a
          <span class="prompt">Fold change</span> &amp;gt;=</span>
        <imp:stringParamInput qp="${fold_changeParam}"/>
        <imp:helpIcon helpContent="${fold_changeParam.help}" />
      </div>

      <div class="samples ui-helper-clearfix">
        <div id="min_max_avg_refaaa" class="param-line">
          between each gene's
          <imp:enumParamInput qp="${min_max_avg_refParam}"/>
          <span class="text prompt"> expression value </span>
          <imp:helpIcon helpContent="${min_max_avg_refParam.help}" />
        </div>
        <div class="param-line" style="padding-bottom:0">
          <span class="text">
            in the following <span class="samples-tab reference">Reference Samples</span>
            <jsp:text> </jsp:text>
            <imp:helpIcon helpContent="${samples_fc_ref_genericParam.help}" />
          </span>
        </div>

        <div class="reference">
          <div id="samples_fc_ref_genericaaa">
            <imp:enumParamInput qp="${samples_fc_ref_genericParam}"/>
          </div>
          <!--
          <div id="min_max_avg_refaaa" class="param-line">
            <span class="text">Calculate each gene's fold change using its</span>
            <imp:enumParamInput qp="${min_max_avg_refParam}"/>
            <imp:helpIcon helpContent="${min_max_avg_refParam.help}" />
            <span class="text">
              <span class="prompt">expression value</span>
              in my chosen reference samples.</span>
          </div>
          -->
        </div>

        <div id="min_max_avg_compaaa" class="param-line">
          and its
          <imp:enumParamInput qp="${min_max_avg_compParam}"/>
          <span class="text prompt"> expression value </span>
          <imp:helpIcon helpContent="${min_max_avg_compParam.help}" />
        </div>
        <div class="param-line" style="padding-bottom:0">
          <span class="text">
            in the following <span class="samples-tab comparison">Comparison Samples</span>
            <jsp:text> </jsp:text>
            <imp:helpIcon helpContent="${samples_fc_comp_genericParam.help}" />
          </span>
        </div>

        <div class="comparison">
          <div id="samples_fc_comp_genericaaa">
            <imp:enumParamInput qp="${samples_fc_comp_genericParam}"/>
          </div>
          <!--
          <div id="min_max_avg_compaaa" class="param-line">
            <span class="text">Calculate each gene's fold change using its</span>
            <imp:enumParamInput qp="${min_max_avg_compParam}"/>
            <imp:helpIcon helpContent="${min_max_avg_compParam.help}" />
            <span class="text">
              <span class="prompt">expression value</span>
              in my chosen comparison samples.</span>
          </div>
          -->
        </div>
      </div>

      <c:choose>                                                                     
	<c:when test="${hard_floorParam.isVisible}">                                    
	  <div id="hard_flooraaa" class="param-line">                                
	    <span class="text">using a                                               
            <span class="prompt">FPKM Floor</span> of</span>                            
	    <imp:enumParamInput qp="${hard_floorParam}"/>
	    <imp:helpIcon helpContent="${hard_floorParam.help}" />
	    <span class="text">  </span>
	    <imp:image alt="New feature icon" title="This is a new parameter!" src="wdk/images/new-feature.png" />
	    <p>NEW PARAMETER FOR RELEASE 39: All FPKM values less than the floor are raised to the floor because such low values are considered unreliable. The default floor is preferred and is calculated based on (a) the amount of sequencing for each dataset and (b) the average transcript size in the organism. In release 38 and earlier (before August 20, 2018), 1 FPKM was the floor for all RNA-seq datasets. If you want to achieve results that are consistent with your previous work at our website, choose a floor of 1. For more help, hover over the ? icon or see the <a href='/assets/Fold_Change_Help.pdf' target='_blank'>detailed help for this search</a>.</p>
	  </div>                           
	</c:when>                                                                     
	<c:otherwise>                                                                 
	  <html:hidden property="value(${hard_floorParam.name})" />                     
	</c:otherwise>
      </c:choose> 

    </div> <!-- .fold-change-params -->

    <div class="fold-change-graphic">
      <div class="title">Example showing one gene that would meet search criteria</div>
      <div class="subtitle">(Dots represent this gene's expression values for selected samples)</div>
      <div class="fold-change-img"><jsp:text/></div>
      <div class="caption">A maximum of four samples are shown when more than
          four are selected.</div>
      <div class="fold-change-help static-help">
        <p>This graphic will help you visualize the parameter
        choices you make at the left.
        It will begin to display when you choose a <b>Reference Sample</b> or a
         <b>Comparison Sample</b>.</p>
      </div>
      <div class="fold-change-help dynamic-help"><jsp:text/></div>
      <div class="fold-change-help detailed-help">
        <p>See the <a href='/assets/Fold_Change_Help.pdf'
         target='_blank'>detailed help for this search</a>.</p>
      </div>
    </div>

    <script id="formula-partial" type="text/x-jst">
    <![CDATA[
      <div class="formula">
        <div class="left-hand-side"><%= leftHandSide %></div>
        <div class="right-hand-side">
          <div class="division">
            <div class="numerator"><%= numerator %></div>
            <div class="denominator"><%= denominator %></div>
          </div>
        </div>
      </div>
    ]]>
    </script>

    <script id="help-template" type="text/x-jst">
    <![CDATA[
      <p>You are searching for genes that are <b><%= direction %></b> between
        <% if (multipleRef) { %>
          at least two <b>reference samples</b>
        <% } else { %>
          one <b>reference sample</b>
        <% } %>
        and
        <% if (multipleComp) { %>
          at least two <b>comparison samples</b>.
        <% } else { %>
          one <b>comparison sample</b>.
        <% } %>
      </p>
      <br/>
      <p>For each gene, the search calculates:</p>
      <%= _.map(formulas, formulaPartial).join('') %>
      <p>and returns genes when <%= criteria %>.

        <% if (narrowest) { %>
          This calculation creates the <b>narrowest</b> window of expression values in
          which to look for genes that meet your fold change cutoff.
        <% } %>

        <% if (broadest) { %>
          This calculation creates the <b>broadest</b> window of expression values in
          which to look for genes that meet your fold change cutoff.
        <% } %>

        <% if (toNarrow) { %>
        To narrow the window, use the <%= toNarrow %>.
          <% } %>

        <% if (toBroaden) { %>
          To broaden the window, use the <%= toBroaden %>.
        <% } %>
      </p>
    ]]>
    </script>

    <script id="samples-partial" type="text/x-jst">
    <![CDATA[
      <div class="samples <%= type %>-samples">
        <div class="sample-operation <%= operationLabel %>">
          <div class="operation-line"></div>
          <%= operationLabel %>

          <% _.map(samples, function(sample) { %>
            <div class="sample" style="top: <%- sample.top %>%"></div>
          <% }).join(''); %>

        </div>
        <div class="samples-label">
          <%= samplesLabel %> <br/> Samples
        </div>
      </div>
    ]]>
    </script>

    <script id="foldChange-partial" type="text/x-jst">
    <![CDATA[
      <% if (foldChange > 0) { %>
        <div class="fold-change-label">
          <div class="up-arrow"></div>
          <div class="label"><%= foldChange %> fold</div>
          <div class="down-arrow"></div>
        </div>
      <% } %>
    ]]>
    </script>

    <script id="one-direction-template" type="text/x-jst">
    <![CDATA[
    <div class="<%= direction %>">
      <div class="title"><%= title %></div>
      <%= foldChangePartial({ foldChange: foldChange }) %>
      <%= _.map(sampleGroups, samplesPartial).join('') %>
      </div>
    ]]>
    </script>

    <script id="two-direction-template" type="text/x-jst">
    <![CDATA[
      <div class="up-or-down-regulated">
        <div class="title"><%= title %></div>
        <div class="left-samples">
          <%= foldChangePartial({ foldChange: foldChange }) %>
          <%= _.map(leftSampleGroups, samplesPartial).join('') %>
        </div>
        <div class="right-samples">
          <%= foldChangePartial({ foldChange: foldChange }) %>
          <%= _.map(rightSampleGroups, samplesPartial).join('') %>
        </div>
      </div>
    ]]>
    </script>

  </div> <!-- .fold-change -->

</jsp:root>
