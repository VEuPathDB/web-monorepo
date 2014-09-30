<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>
<c:set var="qForm" value="${requestScope.questionForm}"/>

<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordName" value="${wdkQuestion.recordClass.displayName}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%-- parameters -------%>
<c:set var="qParams" value="${wdkQuestion.paramsMap}"/>

<c:set var="profilePattern" value="${qParams['profile_pattern']}"/>
<c:set var="profilePatternName" value="${profilePattern.name}"/>

<c:set var="includedSpecies" value="${qParams['included_species']}"/>
<c:set var="includedSpeciesName" value="${includedSpecies.name}"/>

<c:set var="excludedSpecies" value="${qParams['excluded_species']}"/>
<c:set var="excludedSpeciesName" value="${excludedSpecies.name}"/>

<c:set var="resultSpecies" value="${qParams['organism']}"/>
<c:set var="resultSpeciesName" value="${resultSpecies.name}"/>
<c:set var="ind" value="${qParams['phyletic_indent_map']}"/>
<c:set var="trm" value="${qParams['phyletic_term_map']}"/>

<c:set var="indentMap" value="${ind.vocabMap}"/>
<c:set var="termMap" value="${trm.vocabMap}"/>
<c:set var="taxaCount" value="${fn:length(ind.vocab)+1}"/>

<c:set var="indentMapJSON">
  { <c:forEach var='indent' varStatus="loop" items='${indentMap}'> "${indent.key}" : "${indent.value}" <c:if test="${loop.last eq false}">,</c:if> </c:forEach> }
</c:set>

  <%-- The following is done in orthologpattern.js now
  <!-- js values used in orthologpatern.js -->
  <!-- I think this script is only needed to build question page when adding/editing a step -->
  <script>
  <!-- //
  (function() {
   'use strict';

    var parents = new Array();
    parents.push(0);
    <c:set var="idx" value="1" />
    <c:set var="lastindent" value="0" />
    <c:forEach var="sp" items="${ind.vocab}">
      <c:set var="indent" value="${indentMap[sp]}" />
      <c:choose>
        <c:when test="${indent > lastindent}">
          parents.push(${idx-1});
        </c:when>
        <c:when test="${indent < lastindent}">
          <c:forEach var="i" begin="${indent}" end="${lastindent-1}" step="1">
            parents.pop();
          </c:forEach>
        </c:when>
        <c:otherwise>
        </c:otherwise>
      </c:choose>  
      parent[${idx}] = parents[parents.length-1];

      <c:set var="idx" value="${idx+1}" />
      <c:set var="lastindent" value="${indent}" />
    </c:forEach>

    // fill the children array
    for (var i = 0 ; i < parent.length ; i++) {
      if (parent[i] != null) {
        var parentidx = parent[i];
        children[parentidx][children[parentidx].length] = i;
      } 
    }

  }());
  // -->
  </script>
  --%>
  <noscript>
  Ack, this form won't work at all without JavaScript support!
  </noscript>

  <!-- show error messages, if any -->
  <div class='usererror'><api:errors/></div>

  <%--  PARAMS DIV --%>
  <div class="params" data-controller="wdk.parameterHandlers.init">
    <input name="questionFullName" value="GeneQuestions.GenesByOrthologPattern" type="hidden"/>    
    <input name="array(phyletic_term_map)" value="rnor" type="hidden"/>
    <input name="array(phyletic_indent_map)" value="ARCH" type="hidden"/>

    <div class="param-group content-pane">
      <div class="group-detail">

        <div class="param-item">
          <label>
            <span style="font-weight:bold">Find genes in these organisms</span>
            <imp:image title="Find genes in these organisms that belong to an ortholog group with the profile you select below" 
               class="help-link"
               src="wdk/images/question.png" 
               style="cursor:pointer" 
               aria-describedby="ui-tooltip-2"/>
          </label>
          <div class="param-control"><imp:enumParamInput qp="${resultSpecies}" /></div>
        </div>

        <div class="param-item"
          data-controller="eupathdb.orthologPattern.init"
          data-included-species-name="${includedSpeciesName}"
          data-excluded-species-name="${excludedSpeciesName}"
          data-profile-pattern-name="${profilePatternName}"
          data-taxa-count="${taxaCount}"
          data-abbrev='["All Organisms" <c:forEach var='sp' items='${ind.vocab}'>, "${sp}"</c:forEach>]'
          data-indent-map='${indentMapJSON}'
        >
          <label>
            <span style="font-weight:bold">Select orthology profile</span>
            <imp:image title="If you do not force the inclusion of any organism you will get back all genes, since each gene is in a group by itself." 
                class="help-link" 
                src="wdk/images/question.png" 
                style="cursor:pointer" 
                aria-describedby="ui-tooltip-2"/>
          </label>

          <div class="param-control">
            <div>Click on <imp:image src="images/dc.gif"/> to determine which organisms to
                include or exclude in the orthology profile.<br>
              <i style="font-size:95%">(<imp:image src="images/dc.gif"/>=no constraints |
              <imp:image src="images/yes.gif"/>=must be in group |
              <imp:image src="images/no.gif"/>=must not be in group |
              <imp:image src="images/unk.gif"/>=mixture of constraints)</i>
            </div>

            <c:set var="idx" value="1"/>

  <%-- I don't think we need this - dmf
  <tr style="display:none;" class="showhide">
      <td width="250px"  style="text-align:right">&nbsp;</td>
      <td>
            <div class="filter-button"><html:submit property="questionSubmit" value="Get Answer"/></div>
      </td>
  </tr>
  --%>

            <div style="padding-top:1em"> <%-- start WRAPPER --%>
              <a href="javascript:void(0)" onclick="eupathdb.orthologPattern.toggle(0)">
                <imp:image border="0" id="img0" src="images/dc.gif"/>
              </a>
              &nbsp;<b>All Organisms</b>
              &nbsp;<a style="font-size:90%" href="javascript:void(0)" onclick="myshowTree()">expand all</a>
              &nbsp;|&nbsp;<a style="font-size:90%" href="javascript:void(0)" onclick="myhideTree()">collapse all</a>

              <%--  TREE CONSTRUCTION LOOP  -----------------%>
              <div id="orthology-profile-tree" style="display:none">

                <c:set var="indent" value="0"/>
                <c:forEach var="sp" items="${ind.vocab}">
                  <c:set var="spDisp" value="${termMap[sp]}"/>
                  <c:set var="category" value="0"/>
                  <c:if test="${spDisp == null}">
                    <c:set var="spDisp" value="${sp}"/> 
                    <c:set var="category" value="1"/>
                  </c:if>

                  <%-- determine if we should nest our list, remain the same, or unnest --%>
                  <c:set var="nest" value="${indentMap[sp] - indent}"/>
                  <c:set var="indent" value="${indentMap[sp]}"/>

                  <c:choose>
                    <c:when test="${nest eq 0}">
                      </li>
                    </c:when>
                    <c:when test="${nest lt 0}">
                      <c:forEach begin="1" end="${nest * -1}" step="1">
                        </li></ul>
                      </c:forEach>
                      </li>
                    </c:when>
                    <c:otherwise>
                      <c:forEach begin="1" end="${nest}" step="1">
                        <ul>
                      </c:forEach>
                    </c:otherwise>
                  </c:choose>

                  <li id="${sp}-node">
                    <!-- ${sp} -->
                    <a href="javascript:void(0)" onclick="eupathdb.orthologPattern.toggle(${idx})"><imp:image alt=""
                        border="0" id="img${idx}" src="images/dc.gif"/></a>&nbsp;
                    <span>
                    <c:choose>
                      <c:when test="${category == 1}"><b><i>${spDisp}</i></b></c:when>
                      <c:otherwise><i>${spDisp}</i></c:otherwise>
                    </c:choose>
                    <c:if test="${sp != spDisp}">&nbsp;(<code>${sp}</code>)</c:if>
                    </span>

                  <c:set var="idx" value="${idx+1}"/>	

                </c:forEach>
                <c:forEach begin="1" end="${indent}" step="1">
                  </li></ul>
                </c:forEach>

            </div> <%-- end TREE --%>

            <html:hidden property="value(${includedSpeciesName})" />
            <html:hidden property="value(${excludedSpeciesName})" />
            <html:hidden property="value(${profilePatternName})"  value="%"/>
          </div> <%-- end WRAPPER --%>

        </div> <%-- end param-item --%>
      </div> <%-- end group-detail --%>
    </div> <%-- end param-group --%>
  </div><%-- END OF PARAMS DIV --%>

  <script>

    function myshowTree(){
      $("#orthology-profile-tree").jstree("open_all", true);
    }

    function myhideTree(){
      $("#orthology-profile-tree").jstree("close_all", true);
    }

  </script>
