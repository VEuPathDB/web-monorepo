<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>

  <!-- header includes menubar and announcements tags -->
  <!-- refer is used to determine what css and javascript to load, and which announcements are shown -->
  <imp:pageFrame refer="home">
    <imp:welcomeContent/>
  </imp:pageFrame>
</jsp:root>
