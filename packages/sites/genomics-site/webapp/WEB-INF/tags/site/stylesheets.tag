<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="common" tagdir="/WEB-INF/tags/site-common" %>

<%@ attribute name="refer" 
 	      type="java.lang.String"
	      required="true" 
	      description="Page calling this tag"
%>

<common:stylesheets refer="${refer}"/>

<c:set var="base" value="${pageContext.request.contextPath}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:if test="${refer == 'summary'}">
    <imp:stylesheet rel="stylesheet" href="wdkCustomization/css/spanlogic.css" type="text/css" />
    <imp:stylesheet rel="StyleSheet" type="text/css" href="wdkCustomization/css/genome-view.css"/>
</c:if>

<c:if test="${refer == 'question' || refer == 'summary'}">
  <imp:stylesheet rel="styleSheet" type="text/css" href="wdkCustomization/css/question.css"/>
  <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/fold-change.css"/>
  <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/radio-params.css"/>
</c:if>

<!-- step analysis -->
<c:if test="${refer == 'summary'}">
  <imp:stylesheet rel="styleSheet" type="text/css" href="wdkCustomization/css/analysis/enrichment.css"/>
</c:if>
