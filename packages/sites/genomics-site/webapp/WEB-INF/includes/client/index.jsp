<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrameFixed refer="betaApp">

  <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/client.css"/>

  <!-- We will pass this to WDK as the root element within which the client will render HTML -->
  <div id="wdk-container"><jsp:text/></div>

  <!-- `getApiClientConfig` is created in the global scope, so we can call this
       from other JavaScript code where we initialize the WDK client
       (see wdkCustomization/js/client/main.js) -->
  <script>
    function getApiClientConfig() {
      return {
        rootUrl: "${pageContext.request.contextPath}/app/",
        endpoint: "${pageContext.request.contextPath}/service",
        rootElement: document.getElementById("wdk-container"),
        // Use an immediately-invoked function expression in case ${model} is empty
        // to prevent a syntax error.
        initialData: (function(initialData) { return initialData; }(${model}))
      };
    }
  </script>
  <imp:script src="wdkCustomization/js/client.js"/>
</imp:pageFrameFixed>
