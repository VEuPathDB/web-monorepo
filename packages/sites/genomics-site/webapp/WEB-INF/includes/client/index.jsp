<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<c:set var="model" value="${applicationScope.wdkModel.model}"/>
<c:set var="props" value="${model.properties}"/>
<c:set var="webAppUrl" value="${pageContext.request.contextPath}"/>

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <imp:stylesheet href="images/${model.projectId}/favicon.ico" type="image/x-icon" rel="shortcut icon"/>
    <script>
      // used by apidb to initialize wdk
      window.__WDK_CONFIG__ = {
        rootElement: "#wdk-container",
        rootUrl: "${webAppUrl}${pageContext.request.servletPath}",
        endpoint: "${webAppUrl}/service",
        projectId: "${model.projectId}",
        buildNumber: "${model.buildNumber}",
        releaseDate: "${model.releaseDate}",
        webAppUrl: "${webAppUrl}",
        facebookId: "${props.FACEBOOK_ID}",
        twitterId: "${props.TWITTER_ID}"
      };
    </script>
    <imp:stylesheet rel="stylesheet" type="text/css" href="wdk/css/wdk.min.css"/>
    <imp:stylesheet rel="stylesheet" type="text/css" href="css/${model.projectId}.css"/>
    <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/client.css"/>
    <imp:script charset="utf8" src="wdk/js/wdk-client.bundle.js" ></imp:script>
    <imp:script charset="utf8" src="apidb-client.bundle.js" ></imp:script>
  </head>
  <body>
    <div id="wdk-container">Loading...</div>
    <link rel="stylesheet" type="text/css" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"/>
  </body>
</html>
