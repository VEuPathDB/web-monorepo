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
    <th align="center"><i>Entamoeba histolytica HM-1:IMSS</i></th>
    <th align="center"><i>Entamoeba histolytica HM-1:IMSS-A</i></th>
    <th align="center"><i>Entamoeba histolytica HM-1:IMSS-B</i></th>
    <th align="center"><i>Entamoeba histolytica HM-3:IMSS</i></th>
    <th align="center"><i>Entamoeba histolytica KU27</i></th>
    <th align="center"><i>Entamoeba invadens</i></th>
    <th align="center"><i>Entamoeba moshkovskii</i></th>
    <th align="center"><i>Entamoeba nuttalli</i></th>
    <th align="center"><i>Acanthamoeba castellanii</i></th>

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
                          instanceName="edis_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehis_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehisa_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehisb_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehis3_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ehisk_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="einv_instances" />  
    </td> 
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="emos_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="enut_instances" />  
    </td>
    <td>
      <imp:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="acas_instances" />  
    </td> 

  </tr>
</table>
