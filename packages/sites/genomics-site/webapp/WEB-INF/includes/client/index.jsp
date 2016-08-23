<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="model" value="${applicationScope.wdkModel.model}"/>
<c:set var="props" value="${model.properties}"/>
<c:set var="webAppUrl" value="${pageContext.request.contextPath}"/>

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <link href="${webAppUrl}/images/PlasmoDB/favicon.ico" type="image/x-icon" rel="shortcut icon"/>
    <script>
      // used to measure time to reach a goal
      window.__perf__ = { start: performance.now() };
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
    <link rel="stylesheet" type="text/css" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"/>
    <link rel="stylesheet" type="text/css" href="${webAppUrl}/wdk/css/wdk.min.css"/>
    <link rel="stylesheet" type="text/css" href="${webAppUrl}/css/${model.projectId}.css"/>
    <link rel="stylesheet" type="text/css" href="${webAppUrl}/wdkCustomization/css/client.css"/>
    <script charset="utf8" src="${webAppUrl}/wdk/js/wdk-client.bundle.js" ><jsp:text/></script>
    <script charset="utf8" src="${webAppUrl}/apidb-client.bundle.js" ><jsp:text/></script>
  </head>
  <body>
    <div id="wdk-container">Loading...</div>
  </body>
</html>
