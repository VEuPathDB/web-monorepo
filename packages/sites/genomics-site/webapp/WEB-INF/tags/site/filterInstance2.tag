<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

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
              description="if true we need to return titleSpecies and gene count because we are on a species with more than one strain"
%>
<%@ attribute name="titleSpecies"
              required="false"
              description="true if we are on a species with only one strain, we return the Species name"
%>
<%@ attribute name="titleStrain"
              required="false"
              description="true if we are on a species with only one strain, we return the Strain name"
%>
<c:set var="recordClass" value="${answerValue.recordClass}" />
<c:set var="instance" value="${recordClass.filterMap[instanceName]}" />

<c:set var="current">
    <c:set var="currentFilter" value="${answerValue.filter}" />
    <c:choose>
        <c:when test="${currentFilter != null}">${instance.name == currentFilter.name}</c:when>
        <c:otherwise>false</c:otherwise>
    </c:choose>
</c:set>

<!-- reading family and species name from filter instance name -->
<c:set var="instanceNameParts" value="${fn:split(instance.name, '_')}" />
<c:set var="familySpecies" value="${instanceNameParts[0]}" />
<c:set var="speciesNameParts" value="${fn:split(familySpecies, '-')}" />
<c:set var="family" value="${speciesNameParts[0]}" />
<c:set var="species" value="${speciesNameParts[1]}" />

<!-- for species names that have more than one word ("sp. 1") the dataset injector AnnotatedGenomes sets all spaces to '=' because it is used in the filter instance name (as a unique species identifier) and the instance name cannot have spaces (it would break the javascript associated with filters).
Here we 'undo' that process.
-->
<c:set var="species" value="${fn:replace(species, '=', ' ')}" />

<c:choose>

<%-- ================================ SPECIES TITLE  ================= --%>
<c:when test="${titleSpecies eq 'true'}">
<div class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>

<i>${fn:substring(family,0,1)}.${species}</i>
</c:when>

<%-- ================================== SPECIES TITLE WITH GENE COUNT=============== --%>
<c:when test="${distinct eq 'true'}">
<div class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>

		<i>${fn:substring(family,0,1)}.${species}</i>&nbsp;&nbsp; ( nr Genes:

    <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&revise=${stepId}&filter=${instance.name}" />
    <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
    <a id="link-${instance.name}" class="link-url" href="javascript:void(0)" countref="${countUrl}" 
           strId="${strategyId}" stpId="${stpId}" linkUrl="${linkUrl}">

	  	<c:choose>
			  <c:when test="${current}">${answerValue.resultSize}</c:when>
		    <c:otherwise><imp:image class="loading" src="/wdk/images/filterLoading.gif" /></c:otherwise>
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

<!-- still reading strain name form filter instance displayName (popup title) -->
<!-- alternatives to remove this dependency on displayName:
     - pass the strain name from the injector into the instance name, problem is dealing with spaces that cannot be used in css id and other attributes used by javascript
		 - better: define new layout tags to be set with these values (family, species, strain) by injector, so WDK does not have to be parsing.
-->

<c:set var="dispNameOrg1" value="${fn:substringBefore(instance.displayName, 'Results')}" />
<c:set var="dispNameOrg" value="${fn:trim(dispNameOrg1)}" /> 
<c:set var="strain" value="${fn:substringAfter(dispNameOrg, species)}" />
<c:set var="strain" value="${fn:trim(strain)}" /> 
<i>${strain}</i>

</c:when>

<%-- ================================== TRANSCRIPTS COUNT =============== --%>
<c:otherwise>
<div class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>
        <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&revise=${stepId}&filter=${instance.name}" />
        <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />

        <a id="link-${instance.name}" class="link-url" href="javascript:void(0)" countref="${countUrl}" 
           strId="${strategyId}" stpId="${stpId}" linkUrl="${linkUrl}">
		<c:choose>
		<c:when test="${current}">${answerValue.resultSize}</c:when>
		<c:otherwise><imp:image class="loading" src="/wdk/images/filterLoading.gif" /></c:otherwise>
		</c:choose>

	</a>

</c:otherwise>
</c:choose>

        <div class="instance-detail" style="display: none;">
            <div class="display">${instance.displayName}</div>
         <!--   <div class="description">${instance.description}</div> -->
        </div>
    </div>
</div>
