<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fmt="http://java.sun.com/jsp/jstl/fmt"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="title" required="false"
              description="Value to appear in page's title"/>

  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>

  <jsp:directive.attribute name="banner" required="false"
              description="Value to appear at top of page if there is no title provided"/>

  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}"/>

  <!-- jsp:output tag for doctype no longer supports simple HTML5 declaration -->
  <jsp:text>&lt;!DOCTYPE html&gt;</jsp:text>
  <html lang="en">


    <!-- Contains HTML head tag, meta, and includes for all sites -->
    <imp:head refer="${refer}" title="${title}" banner="${banner}"/>

    <body class="${refer}">
      <imp:header refer="${refer}" title= "${title}" />
      <jsp:doBody/>
      <!-- `getApiClientConfig` is created in the global scope, so we can call this
           from other JavaScript code where we initialize the WDK client
           (see wdkCustomization/js/client/main.js) -->
      <script>
        function getApiClientConfig() {
          return {
            rootUrl: "${pageContext.request.contextPath}/app/",
            endpoint: "${pageContext.request.contextPath}/service",
            rootElement: document.getElementById("wdk-container"),
            renderView: true
          };
        }
      </script>
      <imp:script src="wdkCustomization/js/client.js"/>

      <imp:IEWarning version="8"/>
      <imp:dialogs/>
    </body>
  </html>
</jsp:root>
