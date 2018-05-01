<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step bean we are looking at" %>
<%@ attribute name="excludeBasketColumn"
              type="java.lang.String"
              required="false"
              description="if true, the basket column will not be included" %>

<c:set var="wdkAnswer" value="${step.answerValue}"/>
<div data-controller="wdk.dataRestriction.restrictionController" data-record-class="${wdkAnswer.question.recordClass.fullName}">
  <wdk:resultTable step="${step}" excludeBasketColumn="${excludeBasketColumn}"/>
</div>
