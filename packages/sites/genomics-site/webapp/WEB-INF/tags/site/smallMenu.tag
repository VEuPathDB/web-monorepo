<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>

  <jsp:useBean id="constants" class="org.eupathdb.common.model.JspConstants"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>
  <c:set var="siteName" value="${applicationScope.wdkModel.name}"/>
  <c:set var="version" value="${applicationScope.wdkModel.version}"/>
  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>
 
  <span class="onload-function" data-function="wdk.setUpNavDropDowns"><jsp:text/></span>
  <span class="onload-function" data-function="eupath.setup.setUpContactUsLogic"><jsp:text/></span>
  
  <!--*********** Small Menu Options on Header ***********-->

  <div id="nav-top-div">
	  <ul id="nav-top">
	
	    <!-- ABOUT -->
	    <li>
	      <a href="javascript:void()">About ${siteName}</a>
	      <ul>
          <imp:aboutMenu/>
	      </ul>
	    </li>
	   
	    <!-- HELP -->
	    <li>
	      <a href="javascript:void()">Help</a>
	      <ul>
	        <c:if test="${refer eq 'summary'}">
	          <li><a href="javascript:void(0)" onclick="wdk.dyk.dykOpen()">Did You Know...</a></li>
	        </c:if>
	        <li><a href="${constants.youtubeUrl}">YouTube Tutorials Channel</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Tutorials">Web Tutorials</a></li>
	        <li><a href="http://workshop.eupathdb.org/current/">EuPathDB Workshop</a></li>
	        <li><a href="http://workshop.eupathdb.org/current/index.php?page=schedule">Exercises from Workshop</a></li>
	        <li><a href="http://www.genome.gov/Glossary/">NCBI's Glossary of Terms</a></li>
	        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Glossary">Our Glossary</a></li>
          <li class="empty-divider"><a href="${pageContext.request.contextPath}/contact.do" class="open-window-contact-us">Contact Us</a></li>
	      </ul>
	    </li>
	     
	    <!-- LOGIN/REGISTER/PROFILE/LOGOUT -->
	    <imp:login/>
	  
	    <!-- CONTACT US -->
      <li class="empty-divider"><a href="${pageContext.request.contextPath}/contact.do" class="open-window-contact-us">Contact Us</a></li>
	  
	    <!-- TWITTER/FACEBOOK -->
	    <imp:socialMedia small="true"/>
	
	  </ul>
  </div>
  
</jsp:root>
