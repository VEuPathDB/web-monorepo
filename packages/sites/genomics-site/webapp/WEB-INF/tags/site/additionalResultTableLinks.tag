<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step bean we are looking at"
%>

<%-- Galaxy URL --%>
<c:if test="${!empty sessionScope.GALAXY_URL}">
  <c:set var="summaryViewName" value="${empty requestScope.wdkView.name ? '_default' : requestScope.wdkView.name}"/>
  <c:url var="downloadLink" value="app/step/${step.stepId}/download?summaryView=${summaryViewName}&format=tabular"/>
  <a class="step-download-link" style="padding-right: 1em;" href="${downloadLink}">
    <b class="galaxy">SEND TO GALAXY</b>
  </a>
</c:if>
