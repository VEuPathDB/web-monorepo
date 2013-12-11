<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>
 
<%-- DEBUGGING
<c:forEach items="${layout.sortedFamilyCountMap}" var="family" >
    <br>---${family.key}----${family.value}----<br>
 </c:forEach>

<c:forEach items="${layout.sortedInstances}" var="instance">
  <c:set var="abbrev" value="${fn:substringBefore(instance.name,'_')}" />
	<c:if test="${abbrev ne 'all' && !fn:contains(instance.name,'distinct')}" >
				<br>${abbrev} -----  ${layout.instanceCountMap[abbrev]} ---- ${instance.name} <br>
  </c:if>
</c:forEach>
--%>


<table>

<!-- ======================== FAMILY TITLE  (all + orthologs +  total family count ) ================ -->
<!-- ================================================= -->

  <tr>
    <th rowspan=3>All<br>Results</th>
    <th rowspan=3>Ortholog<br>Groups</th>

 		<c:forEach items="${layout.sortedFamilyCountMap}" var="family" >
    	<th colspan="${family.value}"><i>${family.key}</i></th>
 		</c:forEach>
  </tr>

<!-- ========================= SPECIES TITLE  (total species count) ================ -->
<!-- ================================================= -->

  <tr>
	<c:forEach items="${layout.sortedInstances}" var="instance">         
    <c:set var="abbrev" value="${fn:substringBefore(instance.name,'_')}" />

	  <c:choose>
		  <c:when test="${layout.instanceCountMap[abbrev] ne '1' && fn:contains(instance.name,'distinct')}" >
        <th colspan="${layout.instanceCountMap[abbrev]}">
          <imp:filterInstance2 strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" 
				 											 instanceName="${instance.name}" 
															 distinct="true"/> 
        </th>
      </c:when>
 	    <c:when test="${layout.instanceCountMap[abbrev] == 1 && !fn:contains(instance.name,'distinct')}" >
        <th>
          <imp:filterInstance2 strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" 
															 instanceName="${instance.name}" 
															 titleSpecies="true"/> 
        </th>
      </c:when>
    </c:choose>
  </c:forEach>
  </tr>

<!-- ========================== STRAIN TITLE (total strain count)  ================ -->
<!-- =================================================== -->

  <tr>
    <c:forEach items="${layout.sortedInstances}" var="instance">         
      <c:set var="abbrev" value="${fn:substringBefore(instance.name,'_')}" />

    	<c:if test="${abbrev ne 'all' && !fn:contains(instance.name,'distinct')}" >
        <th>
          <imp:filterInstance2 strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" 
															 instanceName="${instance.name}" 	
															 titleStrain="true"/> 
        </th>
      </c:if>
    </c:forEach>
  </tr>

<!-- ========================== TRANSCRIPTS COUNTS (all + orthologs+ total strain count)  ================ -->
<!-- =================================================== -->

  <tr>
    <td>
      <imp:filterInstance2 strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_results" />  
    </td>
    <td>
      <imp:filterInstance2 strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_ortholog_groups" />  
    </td>

    <c:forEach items="${layout.sortedInstances}" var="instance">         
      <c:set var="abbrev" value="${fn:substringBefore(instance.name,'_')}" />

	    <c:if test="${abbrev ne 'all' && !fn:contains(instance.name,'distinct')}" >
         <td>
           <imp:filterInstance2 strategyId="${strategyId}" stepId="${stepId}" answerValue="${answerValue}" 
																instanceName="${instance.name}" /> 
         </td>
      </c:if>
    </c:forEach>
  </tr>

</table>
