<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<imp:pageFrame title="${wdkModel.displayName} :: JBrowse"
               refer="jbrowse"
               banner="JBrowse"
               parentUrl="/home.jsp">

<iframe id="jbrowse_iframe" src="/a/jbrowse/index.html"  width='100%' height='100%' scrolling='no' allowfullscreen='true'></iframe>

<script>
  //https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
  function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == variable) {
              return decodeURIComponent(pair[1]);
          }
      }
  }
  // subscribe to jbrowse movements inside of the iframe and update parent page url
  var datadir = getQueryVariable('data');
  var iframe = document.getElementById('jbrowse_iframe');
  iframe.addEventListener('load', function() {
      var JBrowse = iframe.contentWindow.JBrowse;
      JBrowse.subscribe( '/jbrowse/v1/n/navigate',  function(obj) {
          var shareURL = JBrowse.makeCurrentViewURL();
          var parser = new URL(shareURL);
          window.history.replaceState( {}, "", parser.search );
      });
  });
  // pass the parameters from the parent page into the iframe
  iframe.src = iframe.src + window.location.search;
</script>

</imp:pageFrame>
