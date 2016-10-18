<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<fmt:setLocale value="en-US"/>

<%------------------------------------------%>
<div id="menu_lefttop">

  <%--------------  DATA STATS---------------------------------------------%>
  <a class="heading" id='stats'  href="#">Data Summary</a>
  <div class="menu_lefttop_drop" style="text-align:center;">
    <a style="white-space:nowrap;font-size:12pt;font-weight:bold"
      href="${pageContext.servletContext.contextPath}/app/search/dataset/AllDatasets/result">
      <imp:image style="border: 2px solid #666666;" src="images/genomeTable.png" width="190" height="100"/>
    </a>
  </div>

  <%--------------  NEWS ---------------------------------------------%>
  <!-- number of news items to show in sidebar (there is scrollbar) -->
  <c:set var="NewsCount" value="50"/>

  <a class="heading"  href="#">News and Tweets</a>
  <div id="News" class="menu_lefttop_drop">
    <!-- TWITTER WIDGET, code generated in twitter.com, EuPathDB and FungiDB account settings -->
    <a class="twitter-timeline" data-chrome="nofooter" height="50" href="https://twitter.com/${props.TWITTER_ID}">Tweets by ${props.twitter}</a>
    <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
  </div>

  <%--------------  INFO AND HELP ---------------------------------------------%>
  <a class="heading" id='informationAndHelp' href="#">About ${project}</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>

</div>
