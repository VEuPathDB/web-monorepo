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
    <th colspan=8 align="center"><i>Eurotiomycetes</i></th>
    <th colspan=5 align="center"><i>Sordariomycetes</i></th>
    <th colspan=2 align="center"><i>Saccharomycotina</i></th>
    <th colspan=2 align="center"><i>Basidiomycota</i></th>
    <th rowspan=2 align="center"><i>Rhizopus<br>oryzae</i></th>
  </tr>
  <tr>
    <th><i>A.cla</i></th>
    <th><i>A.fla</i></th>
    <th><i>A.fum</i></th>
    <th><i>A.nid</i></th>
    <th><i>A.nig</i></th>
    <th><i>A.ter</i></th>
    <th><i>C.imm</i> H538.4</th>
    <th><i>C.imm</i> RS</th>
    <th><i>F.gra</i></th>
    <th><i>F.oxy</i></th>
    <th><i>G.mon</i></th>
    <th><i>M.ory</i></th>
    <th><i>N.cra</i></th>
    <th><i>C.alb</i></th>
    <th><i>S.cer</i></th>
    <th><i>C.neo</i></th>
    <th><i>P.gra</i></th>
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
                          instanceName="fungidb_distinct_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="acla_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="afla_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="afum_genes" />  
    </td>
   <td>
      <wdk:filterInstance strategyId="${strategyId}"
                          stepId="${stepId}"
                          answerValue="${answerValue}"
                          instanceName="anid_genes" />
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="anig_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ater_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}"
                          stepId="${stepId}"
                          answerValue="${answerValue}"
                          instanceName="cimmh5_genes" />
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cimmrs_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="fgra_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="foxy_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gmon_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="mory_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="ncra_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="calb_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="scer_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="cneo_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="pgra_genes" />  
    </td>
    <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="rory_genes" />  
    </td>
  </tr>
</table>
