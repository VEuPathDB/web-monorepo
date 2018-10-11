<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>
  <c:set var="siteName" value="${applicationScope.wdkModel.name}"/>
  <c:set var="version" value="${applicationScope.wdkModel.version}"/>
  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>


   <span class="onload-function" data-function="eupath.setup.configureMenuBar"><jsp:text/></span>
 
  <div id="menu" class="ui-helper-clearfix">
    <ul class="sf-menu">
      <imp:wdkMenu />

      <li><a href="${baseUrl}/app/search/dataset/AllDatasets/result">Data Sets</a></li> 

   <!-- LOGIN/REGISTER/PROFILE/LOGOUT -->
      <imp:login/>

      <!-- CONTACT US -->
      <li class="empty-divider"><a href="${pageContext.request.contextPath}/app/contact-us" class="new-window" data-name="contact_us">Contact Us</a></li>

   <!--     <imp:socialMedia small="true" /> -->

      <jsp:doBody/>
    </ul>
  </div>

</jsp:root>
