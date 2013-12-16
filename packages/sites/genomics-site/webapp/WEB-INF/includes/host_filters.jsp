<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>

<table border="1">
  <tr>
    <th align="center">All<br>Results</th>
    <th align="center">Ortholog<br>Groups</th>
    <th align="center"><i>H. sapiens</i></th>
    <th align="center"><i>M. Musculus</i></th>
  </tr>
  <tr align="center">
    <td rowspan=2 >
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_results" />  
    </td>
    <td rowspan=2 >
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_ortholog_groups" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="hsap_gene_instances" />  genes
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mmus_gene_instances" />  genes
    </td>
    </tr>
    <tr align="center">
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="hsapREF_transcript_instances" />  transcripts
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mmusC57BL6J_transcript_instances" />  transcripts
    </td>
  </tr>
</table>
