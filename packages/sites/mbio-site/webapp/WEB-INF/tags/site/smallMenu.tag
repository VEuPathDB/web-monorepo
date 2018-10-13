<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>
  <c:set var="siteName" value="${applicationScope.wdkModel.name}"/>
  <c:set var="version" value="${applicationScope.wdkModel.version}"/>
  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>


  <!--*********** Small Menu Options on Header ***********-->

  <!-- functions to be called when page loads -->
  <span class="onload-function" data-function="wdk.setUpNavDropDowns"><jsp:text/></span>

  <div id="nav-top-div">
    <ul id="nav-top">

      <!-- ABOUT -->
      <li>
        <a href="${pageContext.request.contextPath}/about.jsp">About ${siteName}</a>
        <ul>
          <imp:aboutLinks/>
        </ul>
      </li>

      <!-- HELP -->
      <li>
        <a href="javascript:void()">Help</a>
        <ul>
          <c:if test="${refer eq 'summary'}">
            <li><a href="javascript:void(0)" onclick="wdk.dyk.dykOpen()">Did You Know...</a></li>
          </c:if>
          <li><a title="Login first to keep your work." href="${baseUrl}/resetSession.jsp">Reset ${project} Session</a></li>
          <li class="empty-divider"><a href="${pageContext.request.contextPath}/app/contact-us" class="new-window" data-name="contact_us">Contact Us</a></li>
        </ul>
      </li>

      <!-- LOGIN/REGISTER/PROFILE/LOGOUT -->
      <imp:login/>

      <!-- CONTACT US -->
      <li class="empty-divider"><a href="${pageContext.request.contextPath}/app/contact-us" class="new-window" data-name="contact_us">Contact Us</a></li>

      <imp:socialMedia small="true" />

    </ul>
  </div>

</jsp:root>
