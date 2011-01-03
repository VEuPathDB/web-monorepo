<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>

<!-- display basic filters -->
<table border="1">
  <tr>
    <th rowspan=2 align="center">All<br>Results</th>
    <th rowspan=2 align="center">Ortholog<br>Groups</th>
    <th colspan=4 align="center"><i>Leishmania </i></th>
    <th colspan=3 align="center"><i>Trypanosoma brucei</i></th>
    <th rowspan=2 align="center"><i>Trypanosoma<br>congolense</i></th>
    <th colspan=4 align="center"><i>Trypanosoma cruzi</i></th>
    <th rowspan=2 align="center"><i>Trypanosoma<br>vivax</i></th>
  </tr>
  <tr>
    <th><i>braziliensis</i></th>
    <th><i>infantum</i></th>
    <th><i>major</i></th>
    <th><i>mexicana</i></th>
    <th><i>strain 427</i></th>
    <th><i>TREU927</i></th>
    <th><i>gambiense</i></th>
    <th>Distinct genes</th>
    <th>esmeraldo</th>
    <th>non-esmeraldo</th>
    <th>unassigned</th>
  </tr>
  <tr align="center">
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_results" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tritryp_distinct_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="lbr_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="lin_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="lma_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="lme_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tbr427_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tbr927_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tbrgamb_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tcongolense_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tc_distinct_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tce_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tcne_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tcu_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tvivax_genes" />  
    </td>
  </tr>
</table>
