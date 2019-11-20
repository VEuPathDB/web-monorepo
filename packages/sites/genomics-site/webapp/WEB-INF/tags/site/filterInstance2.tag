<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%-- THIS FILE IS USED FOR GENE ORGANISM FILTER 3 bottom ROWS CONTAINING:
      SPECIES ROW (sometimes with distinct filter count), (GENUS row in Fungi)
      STRAINS ROW                                         (SPECIES STRAIN in Fungi)
      COUNTS ROW --%>

<%@ attribute name="strategyId"
    required="true"
    description="The current strategy id"
    %>
<%@ attribute name="stepId"
    required="true"
    description="The current stepId"
    %>
<%@ attribute name="answerValue"
    type="org.gusdb.wdk.model.jspwrap.AnswerValueBean"
    required="true"
    description="The current answer value"
    %>
<%@ attribute name="instanceName"
    required="true"
    description="the name of the filter instance"
    %>

<%@ attribute name="distinct"
    required="false"
    description="if true we need to write titleSpecies and gene count because we are on a species with more than one strain"
    %>
<%@ attribute name="titleSpecies"
    required="false"
    description="true if we are on a species with only one strain OR if we are on a species with more than one strain but we do not have a reference strain defined in classes.xml (therefore no distinct filter generated in model), we write the Species name"
    %>
<%@ attribute name="missRefStrain"
    required="false"
    description="true if we are on a species with more than one strain but no distinct filter has been generated, no reference strain defined-- it affects the popup"
    %>
<%@ attribute name="titleStrain"
    required="false"
    description="true if we are on a species with only one strain, we write the Strain name"
    %>
<%-- =========================================================================== --%>

<c:set var="recordClass" value="${answerValue.recordClass}" />
<c:set var="instance" value="${recordClass.filterMap[instanceName]}" />

<c:set var="current">
  <c:set var="currentFilter" value="${answerValue.filter}" />
  <c:choose>
    <c:when test="${currentFilter != null}">${instance.name == currentFilter.name}</c:when>
    <c:otherwise>false</c:otherwise>
  </c:choose>
</c:set>

<!-- in trunk we were setting step filter to "all_results" in database at creation time...
     now we dont.. so we probably should highlight all_results when no filter is applied -->
<c:if test="${empty currentFilter && instance.name == 'all_results'}">
   <c:set var="current" value="true" />
</c:if>


<!-- All this painful string manipulation to extract the (1) phylum, (2) family (genus), (3) species and (4) strain names 
    for a given organism is due to the fact that we do not have those distinct values as part of the genome information, 
    *anywhere* in our system. 
-->
<!-- Reading phylum (if exists), family (aka genus) and species from filter name -->
<!--    the use of _ (underscore) to separate parts of the filter name is set in the geneFilterTemplate.dst -->
<!--    the use of - (dash) to separate family - species (in familySpecies) is set in injector AnnotatedGenome.java -->

<c:set var="instanceNameParts" value="${fn:split(instance.name, '_')}" />
<c:set var="familySpecies" value="${instanceNameParts[0]}" />
<c:set var="speciesNameParts" value="${fn:split(familySpecies, '-')}" />

<%-- DEBUG
<br>
${familySpecies}        <!--   Fungi filters       rest -->
<br><br>
${speciesNameParts[0]}  <!--    KINGDOM           PHYLUM  -->
<br><br>
${speciesNameParts[1]}  <!--   PHYLUM              GENUS   -->
<br><br>
${speciesNameParts[2]}  <!--    GENUS             SPECIES   -->
<br><br>
${speciesNameParts[3]}  <!--    SPECIES             empty   -->
<br><br><br>
--%>

<c:choose>
<c:when test="${fn:length(speciesNameParts[2]) > 0}" >
  <c:set var="phylum" value="${speciesNameParts[0]}" />
  <c:set var="family" value="${speciesNameParts[1]}" />
  <c:set var="species" value="${speciesNameParts[2]}" />
  <c:set var="realspecies" value="${speciesNameParts[3]}" />

</c:when>
<c:otherwise>  <%-- when we introduce a new Genus and forget to add it in the Phylum map in the injector --%>
  <c:set var="family" value="${speciesNameParts[0]}" />
  <c:set var="species" value="${speciesNameParts[1]}" />
</c:otherwise>
</c:choose>

<%--
<br>_____<br>
${phylum}   <!--  Fungi            Apicomplexa  -->
<br>
${family}   <!--  Eurotiomycetes   Plasmodium   -->
<br>
${species}  <!--  Aspergillus      knowlesi     -->
<br>_____<br>
--%>


<!--    = was used to escape forbidden chars like space, dash and underscore inside the species name 
          (eg: "sp. 1" becomes "sp.=1") in the injector AnnotatedGenome.java    
-->

<c:set var="species" value="${fn:replace(species, '===', '_')}" />
<c:set var="species" value="${fn:replace(species, '==', '-')}" />
<c:set var="species" value="${fn:replace(species, '=', ' ')}" />
<c:set var="realspecies" value="${fn:replace(realspecies, '===', '_')}" />
<c:set var="realspecies" value="${fn:replace(realspecies, '==', '-')}" />
<c:set var="realspecies" value="${fn:replace(realspecies, '=', ' ')}" />

<c:choose>

  <%-- ================================ SPECIES TITLE  ================= --%>
  <c:when test="${titleSpecies eq 'true'}">
    <div class="filter-instance">
      <c:choose>
        <c:when test="${current}"><div class="current"></c:when>
        <c:otherwise><div></c:otherwise>
      </c:choose>
      <c:choose>
        <c:when test="${phylum eq 'Fungi'}"> <i>${species} ${realspecies}</i></c:when>
        <c:otherwise> <i>${fn:substring(family,0,1)}.${species}</i></c:otherwise>
      </c:choose>
  </c:when>

  <%-- ================================== SPECIES TITLE WITH GENE COUNT=============== --%>
  <c:when test="${distinct eq 'true'}">
    <div class="filter-instance">
      <c:choose>
        <c:when test="${current}"><div class="current"></c:when>
        <c:otherwise><div></c:otherwise>
      </c:choose>

      <c:choose>
        <c:when test="${phylum eq 'Fungi'}"> <i>${species} ${realspecies}</i></c:when>
        <c:otherwise> <i>${fn:substring(family,0,1)}.${species}</i></c:otherwise>
      </c:choose>

      &nbsp;&nbsp; (

      <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&step=${stepId}&filter=${instance.name}" />
      <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
      <a id="link-${instance.name}" data-filter="${instance.name}" class="link-url" href="javascript:void(0)" countref="${countUrl}" 
         strId="${strategyId}" stpId="${stepId}" linkUrl="${linkUrl}">

        <c:choose>
          <c:when test="${current}">${answerValue.resultSize}</c:when>
          <c:otherwise><imp:image class="loading" src="wdk/images/filterLoading.gif" /></c:otherwise>
        </c:choose>
      </a>
      )
  </c:when>

  <%-- =============================== STRAIN TITLE ================== --%>
  <c:when test="${titleStrain eq 'true'}">
    <div class="filter-instance">
      <c:choose>
        <c:when test="${current}"><div class="current"></c:when>
        <c:otherwise><div></c:otherwise>
      </c:choose>

      <!-- reading strain name from filter instance displayName (popup title) -->
      <c:set var="dispNameOrg1" value="${fn:substringBefore(instance.displayName, 'Results')}" />
      <c:set var="dispNameOrg" value="${fn:trim(dispNameOrg1)}" /> 

      <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&step=${stepId}&filter=${instance.name}" />
      <c:choose>
        <c:when test="${phylum eq 'Fungi'}">
          <c:set var="strain" value="${fn:substringAfter(dispNameOrg, realspecies )}" />
        </c:when>
        <c:otherwise>
           <c:set var="strain" value="${fn:substringAfter(dispNameOrg, species )}" />
        </c:otherwise>
      </c:choose>
      <c:set var="strain" value="${fn:trim(strain)}" /> 
      <a  class="link-url2" href="javascript:void(0)" strId="${strategyId}" stpId="${stepId}" linkUrl2="${linkUrl}">${strain}</a>

  </c:when>

  <%-- ================================== TRANSCRIPTS COUNT =============== --%>
  <c:otherwise>
    <div class="filter-instance">
      <c:choose>
        <c:when test="${current}"><div class="current"></c:when>
        <c:otherwise><div></c:otherwise>
      </c:choose>
      <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&step=${stepId}&filter=${instance.name}" />
<%--  unused, we run showResultSize.do once to return map with all filter sizes, wdk/js/controllers/filter.js will set the count below.
       <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
--%>

      <a id="link-${instance.name}" data-filter="${instance.name}" class="link-url" href="javascript:void(0)" countref="${countUrl}" 
         strId="${strategyId}" stpId="${stepId}" linkUrl="${linkUrl}">
        <c:choose>
          <c:when test="${current}"></c:when>
          <c:otherwise><imp:image class="loading" src="wdk/images/filterLoading.gif" /></c:otherwise>
        </c:choose>

      </a>

  </c:otherwise>
</c:choose>

<%-- ===============================  POPUPS TEXT  ================== --%>
<div class="instance-detail" style="display: none;">
  <c:choose>
    <c:when test="${not empty distinct}">
      <div class="display">${instance.displayName}</div>
      <div class="description">${instance.description}</div> 
    </c:when>
    <c:when test="${empty distinct && empty missRefStrain}">
      <div class="display">${instance.displayName}</div>
    </c:when>
    <c:otherwise>
      <div class="display"><i>${family} ${species}</i> Results</div> 
    </c:otherwise>
  </c:choose>
</div>

</div>
</div>
