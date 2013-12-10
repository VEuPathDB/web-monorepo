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

<c:choose>

<%-- ================================ SPECIES TITLE ================= --%>
<c:when test="${titleSpecies eq 'true'}">
<div style="height:100%" class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>

<c:set var="dispNameOrg1" value="${fn:substringBefore(instance.displayName, 'Results')}" />
<c:set var="dispNameOrg" value="${fn:trim(dispNameOrg1)}" /> 
<c:set var="dispNameParts" value="${fn:split(dispNameOrg, ' ')}" />
<c:set var="Family" value="${dispNameParts[0]}" />
<c:set var="Species" value="${dispNameParts[1]}" />

<i>${fn:substring(Family,3,4)}.${Species}</i>

        <div class="instance-detail" style="display: none;">
            <div class="display">${instance.displayName}</div>
            <div class="description">${instance.description}</div>
        </div>
    </div>
</div>
</c:when>
<%-- =============================== STRAIN TITLE ================== --%>
<c:when test="${titleStrain eq 'true'}">
<div style="height:100%" class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>

<c:set var="dispNameOrg1" value="${fn:substringBefore(instance.displayName, 'Results')}" />
<c:set var="dispNameOrg" value="${fn:trim(dispNameOrg1)}" /> 
<c:set var="dispNameParts" value="${fn:split(dispNameOrg, ' ')}" />
<c:set var="Family" value="${dispNameParts[0]}" />
<c:set var="Species" value="${dispNameParts[1]}" />
<c:set var="Family_Species" value="${Family} ${Species}" />
<c:set var="Strain" value="${fn:substringAfter(dispNameOrg, Family_Species)}" />

<i>${Strain}</i>

        <div class="instance-detail" style="display: none;">
            <div class="display">${instance.displayName}</div>
            <div class="description">${instance.description}</div>
        </div>
    </div>
</div>
</c:when>
<%-- ================================== SPECIES TITLE WITH GENE COUNT=============== --%>
<c:when test="${distinct eq 'true'}">
<div style="height:100%" class="filter-instance">
    <c:choose>
      <c:when test="${current}"><div class="current"></c:when>
      <c:otherwise><div></c:otherwise>
    </c:choose>

<c:set var="dispNameParts" value="${fn:split(instance.displayName, ' ')}" />
<i>${fn:substring(dispNameParts[1],0,1)}.${dispNameParts[2]}</i>&nbsp;&nbsp;Genes:

        <c:url var="linkUrl" value="/processFilter.do?strategy=${strategyId}&revise=${stepId}&filter=${instance.name}" />
        <c:url var="countUrl" value="/showResultSize.do?step=${stepId}&answer=${answerValue.checksum}&filter=${instance.name}" />
        <a id="link-${instance.name}" class="link-url" href="javascript:void(0)" countref="${countUrl}" 
           strId="${strategyId}" stpId="${stpId}" linkUrl="${linkUrl}">

					 <c:choose>
								<c:when test="${current}">${answerValue.resultSize}</c:when>
		  					<c:otherwise><imp:image class="loading" src="/wdk/images/filterLoading.gif" /></c:otherwise>
					 </c:choose>

	      </a>
        <div class="instance-detail" style="display: none;">
            <div class="display">${instance.displayName}</div>
            <div class="description">${instance.description}</div>
        </div>
      </div>
</div>
</c:when>
<%-- ================================== TRANSCRIPTS COUNT =============== --%>
<c:otherwise>
<div style="height:100%" class="filter-instance">
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
        <div class="instance-detail" style="display: none;">
            <div class="display">${instance.displayName}</div>
            <div class="description">${instance.description}</div>
        </div>
    </div>
</div>
</c:otherwise>
</c:choose>
