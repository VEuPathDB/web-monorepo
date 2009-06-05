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
    <th align="center">Tg<br>Results</th>
    <th align="center">Tg<br>Genes</th>
    <th align="center">Nc<br>Genes</th>
    <th colspan=2 align="center">GT1</th>
    <th colspan=2 align="center">ME49</th>
    <th colspan=2 align="center">VEG</th>
    <th align="center">All Tg<br>Strains</th>
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
                          instanceName="all_tg_results" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="toxo_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="neospora_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_instances" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="me49_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="me49_instances" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="veg_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="veg_instances" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="each_tg_instance" />  
    </td>

  </tr>
</table>

