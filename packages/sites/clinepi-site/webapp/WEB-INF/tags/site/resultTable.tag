<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="step"
              type="org.gusdb.wdk.model.jspwrap.StepBean"
              required="true"
              description="Step bean we are looking at" %>
<%@ attribute name="excludeBasketColumn"
              type="java.lang.String"
              required="false"
              description="if true, the basket column will not be included" %>
<%@ attribute name="feature__newDownloadPage"
              type="java.lang.Boolean"
              required="false"
              description="if true, use the new download page" %>

<c:set var="wdkAnswer" value="${step.answerValue}"/>
<div data-controller="wdk.dataRestriction.restrictionController" data-record-class="${wdkAnswer.question.recordClass.fullName}">
  <wdk:resultTable
    step="${step}"
    excludeBasketColumn="${excludeBasketColumn}"
    feature__newDownloadPage="${feature__newDownloadPage}"
  />
</div>
