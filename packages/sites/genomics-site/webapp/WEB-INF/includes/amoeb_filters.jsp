<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>


<!-- display basic filters -->
<table border="1">
  <tr>
    <th align="center">All Results</th>
    <th align="center">Ortholog<br>Groups</th>
    <th align="center"><i>Entamoeba dispar</i></th>
    <th align="center"><i>Entamoeba histolytica</i></th>
    <th align="center"><i>Entamoeba invadens</i></th>
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
                          instanceName="amoeb_distinct_genes" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="edis_genes" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehis_genes" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="einv_genes" />  
    </td>
  </tr>
</table>
