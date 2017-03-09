<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

  <common:menubar refer="${refer}">
    <li><a href="${baseUrl}/app/search/dataset/AllDatasets/result">Data Sets</a></li>
  </common:menubar>
</jsp:root>
