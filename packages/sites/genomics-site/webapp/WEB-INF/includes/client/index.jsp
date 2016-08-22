<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="model" value="${applicationScope.wdkModel.model}"/>
<c:set var="props" value="${model.properties}"/>

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <link href="/plasmo.dfalke/images/PlasmoDB/favicon.ico" type="image/x-icon" rel="shortcut icon"/>
    <script>
      // used to measure time to reach a goal
      window.__perf__ = { start: performance.now() };
      // used by apidb to initialize wdk
      window.__WDK_CONFIG__ = {
        rootElement: "#wdk-container",
        rootUrl: "${pageContext.request.contextPath}${pageContext.request.servletPath}",
        endpoint: "${pageContext.request.contextPath}/service",
        projectId: "${model.projectId}",
        buildNumber: "${model.buildNumber}",
        releaseDate: "${model.releaseDate}",
        webAppUrl: "${pageContext.request.contextPath}",
        facebookId: "${props.FACEBOOK_ID}",
        twitterId: "${props.TWITTER_ID}"
      };
    </script>
    <link rel="stylesheet" type="text/css" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"/>
    <link rel="stylesheet" type="text/css" href="/plasmo.dfalke/wdk/css/wdk.min.css"/>
    <link rel="stylesheet" type="text/css" href="/plasmo.dfalke/css/${model.projectId}.css"/>
    <link rel="stylesheet" type="text/css" href="/plasmo.dfalke/wdkCustomization/css/client.css"/>
    <script charset="utf8" src="/plasmo.dfalke/wdk/js/wdk-client.bundle.js" ><jsp:text/></script>
    <script charset="utf8" src="/plasmo.dfalke/apidb-client.bundle.js" ><jsp:text/></script>
  </head>
  <body>
    <div id="wdk-container">Loading...</div>
  </body>
</html>
