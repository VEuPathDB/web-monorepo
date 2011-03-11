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
    <th align="center">All<br>Results</th>
    <th align="center">Ortholog<br>Groups</th>
    <th align="center"><i>Babesia bovis</i></th>
    <th align="center"><i>Theileria annulata</i></th>
    <th align="center"><i>Theileria parva</i></th>
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
                          instanceName="piro_distinct_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="bbov_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tparva_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tannu_genes" />  
    </td>
  </tr>
</table>
