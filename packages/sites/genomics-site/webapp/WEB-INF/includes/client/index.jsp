<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib"%>

<c:set var="model" value="${applicationScope.wdkModel.model}"/>
<c:set var="props" value="${model.properties}"/>
<c:set var="webAppUrl" value="${pageContext.request.contextPath}"/>
<c:set var="gaId" value="${applicationScope.wdkModel.properties['GOOGLE_ANALYTICS_ID']}"/>

<%-- only show information on home page. this jsp never gets loaded on home page --%>
<%-- FIXME Add logic to show information messages on homepage if this gets used for homepage --%>
<c:set var="information" value="[]"/>
<api:messages var="degraded" projectName="${model.projectId}" messageCategory="Degraded"/>
<api:messages var="down" projectName="${model.projectId}" messageCategory="Down"/>

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
      window.__EUPATHDB_ANNOUNCEMENTS__ = {
        information: ${information},
        degraded: ${degraded},
        down: ${down}
      };

      <%-- Initialize google analytics. A pageview event will be sent in the JavaScript code. --%>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', '${gaId}', 'auto');
    </script>
    <imp:stylesheet rel="stylesheet" type="text/css" href="wdk/css/wdk.min.css"/>
    <imp:stylesheet rel="stylesheet" type="text/css" href="wdkCustomization/css/client.css"/>
    <imp:stylesheet rel="stylesheet" type="text/css" href="css/${model.projectId}.css"/>
    <imp:script charset="utf8" src="wdk/js/wdk-client.bundle.js" ></imp:script>
    <imp:script charset="utf8" src="apidb-client.bundle.js" ></imp:script>
  </head>
  <body>
    <div id="wdk-container">Loading...</div>
    <link rel="stylesheet" type="text/css" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"/>
  </body>
</html>
