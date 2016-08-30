<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:wdk="urn:jsptagdir:/WEB-INF/tags/wdk">

  <jsp:directive.attribute name="title" required="false"
      description="Value to appear as the login pop-up's title"/>

  <wdk:login title="${title}" feature__newProfilePage="${true}"/>

</jsp:root>
