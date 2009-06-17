<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set var="answerValue" value="${requestScope.answer_value}"/>
<c:set var="strategyId" value="${requestScope.strategy_id}"/>
<c:set var="stepId" value="${requestScope.step_id}"/>
<c:set var="layout" value="${requestScope.filter_layout}"/>


<table>
 <tr>
  <td>
   <div class="vennFilter">
      <table cellpadding="5" border="0">
        <tr>
          <th>Tg genes minus GT1</th>

          <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_min_gt1" />  
          </td>
        </tr>
        <tr>
          <th>Tg genes minus ME49</th>
          <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_min_me49" />  
          </td>
        </tr>
        <tr>
          <th>Tg genes minus VEG</th>
          <td>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="all_min_veg" />  
          </td>
        </tr>
      </table>
   </div>


   <div class="vennFilter vennLabels">
     <ul>
       <li class="top_label">GT1</li>
       <li class="bottom_label">ME49</li>
     </ul>
   </div>

   <c:set var="currentFilter" value="" />
   <c:if test="${answerValue.filter != null}">
     <c:set var="currentFilter" value="${answerValue.filter.name}"/>
   </c:if>

   <c:choose>
     <c:when test="${currentFilter eq 'gt1_min_me49'}">
       <div class="vennFilter vennDiagram topSelected">
     </c:when>
     <c:when test="${currentFilter eq 'gt1_int_me49'}">
       <div class="vennFilter vennDiagram midSelected">
     </c:when>
     <c:when test="${currentFilter eq 'me49_min_gt1'}">
       <div class="vennFilter vennDiagram btmSelected">
     </c:when>
     <c:otherwise>
       <div class="vennFilter vennDiagram">
     </c:otherwise>
   </c:choose>
     <ul>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_min_me49" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_int_me49" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="me49_min_gt1" />  
         </li>
     </ul>
   </div>

   <div class="vennFilter vennLabels">
     <ul>
       <li class="top_label">GT1</li>
       <li class="bottom_label">VEG</li>
     </ul>
   </div>

   <c:choose>
     <c:when test="${currentFilter eq 'gt1_min_veg'}">
       <div class="vennFilter vennDiagram topSelected">
     </c:when>
     <c:when test="${currentFilter eq 'gt1_int_veg'}">
       <div class="vennFilter vennDiagram midSelected">
     </c:when>
     <c:when test="${currentFilter eq 'veg_min_gt1'}">
       <div class="vennFilter vennDiagram btmSelected">
     </c:when>
     <c:otherwise>
       <div class="vennFilter vennDiagram">
     </c:otherwise>
   </c:choose>
     <ul>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_min_veg" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="gt1_int_veg" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="veg_min_gt1" />  
         </li>
     </ul>
   </div>

   <div class="vennFilter vennLabels">
     <ul>
       <li class="top_label">ME49</li>
       <li class="bottom_label">VEG</li>
     </ul>
   </div>

   <c:choose>
     <c:when test="${currentFilter eq 'me49_min_veg'}">
       <div class="vennFilter vennDiagram topSelected">
     </c:when>
     <c:when test="${currentFilter eq 'me49_int_veg'}">
       <div class="vennFilter vennDiagram midSelected">
     </c:when>
     <c:when test="${currentFilter eq 'veg_min_me49'}">
       <div class="vennFilter vennDiagram btmSelected">
     </c:when>
     <c:otherwise>
       <div class="vennFilter vennDiagram">
     </c:otherwise>
   </c:choose>
     <ul>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="me49_min_veg" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="me49_int_veg" />  
         </li>
         <li>
      <wdk:filterInstance strategyId="${strategyId}" 
                          stepId="${stepId}" 
                          answerValue="${answerValue}" 
                          instanceName="veg_min_me49" />  
         </li>
     </ul>
   </div>

  </td>
 </tr>
</table>
