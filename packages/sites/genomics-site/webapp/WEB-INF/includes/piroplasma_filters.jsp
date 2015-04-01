<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>

<!-- display basic filters -->
<table border="1">
  <tr>
    <th rowspan=2 align="center">All<br>Results</th>
    <th rowspan=2 align="center">Ortholog<br>Groups</th>
    <th colspan=2 align="center"><i>Babesia</i></th>
    <th colspan=4 align="center"><i>Theileria</i></th>
  </tr>
  <tr> 
    <th align="center"><i>bovis</i></th>
    <th align="center"><i>microti</i></th>
    <th align="center"><i>annulata</i></th>
    <th align="center"><i>equi</i></th>
    <th align="center"><i>orientalis</i></th>
    <th align="center"><i>parva</i></th>
  </tr>
  <tr align="center">
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_results" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_ortholog_groups" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="bbov_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="bmicroti_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tannu_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tequ_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tori_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="tparva_instances" />  
    </td>
  </tr>
</table>
