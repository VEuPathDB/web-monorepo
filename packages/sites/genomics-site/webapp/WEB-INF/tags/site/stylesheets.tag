<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="refer" 
 	      type="java.lang.String"
	      required="true" 
	      description="Page calling this tag"
%>

<jsp:useBean id="websiteRelease" class="org.eupathdb.common.controller.WebsiteReleaseConstants"/>
<c:set var="debug" value="${requestScope.WEBSITE_RELEASE_STAGE eq websiteRelease.development}"/>
<!-- StyleSheets provided by WDK -->
<imp:wdkStylesheets refer="${refer}" debug="${debug}"/> 


<c:set var="base" value="${pageContext.request.contextPath}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<link rel="stylesheet" href="${base}/wdkCustomization/css/superfish/css/superfish.css" type="text/css"/>

<%-- When definitions are in conflict, the next one overrides the previous one  --%>
<link rel="stylesheet" href="/assets/css/AllSites.css"           type="text/css" /> 
<link rel="stylesheet" href="/assets/css/${project}.css"         type="text/css" />

<!-- JQuery library is included by WDK -->

<!-- comment out, since it is commented out below
<c:if test="${project == 'CryptoDB'}">
  <c:set var="gkey" value="AIzaSyBD4YDJLqvZWsXRpPP8u9dJGj3gMFXCg6s" />
</c:if>
-->

<c:if test="${refer == 'summary'}">
    <link rel="stylesheet" href="${base}/wdkCustomization/css/spanlogic.css" type="text/css" />
    <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/genome-view.css"/>
</c:if>

<c:if test="${refer == 'question' || refer == 'summary'}">
  <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/question.css"/>
  <link rel="stylesheet" type="text/css" href="${base}/wdkCustomization/css/fold-change.css"/>
  <link rel="stylesheet" type="text/css" href="${base}/wdkCustomization/css/radio-params.css"/>
</c:if>

<!-- Data source page -->
<c:if test="${refer == 'data-set'}">
  <link rel="StyleSheet" type="text/css" href="${base}/wdkCustomization/css/dataSource.css"/>
</c:if>

<%-- need to review these --%>
<!--[if lte IE 8]>
<style>
  #header_rt {
    width:50%;
   }
</style>
<![endif]-->

<!--[if lt IE 8]>
  <link rel="stylesheet" href="/assets/css/ie7.css" type="text/css" />
<![endif]-->

<!--[if lt IE 7]>
  <link rel="stylesheet" href="/assets/css/ie6.css" type="text/css" />
<![endif]-->
