<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrameFixed refer="betaApp">
  <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/client.css"/>
  <!-- We will pass this to WDK as the root element within which the client will render HTML -->
  <div id="wdk-container"><jsp:text/></div>
</imp:pageFrameFixed>
