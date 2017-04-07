<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://eupathdb.org/taglib" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<fmt:setLocale value="en-US"/>

  <span class="onload-function" data-function="eupath.setup.configureSidebar"><jsp:text/></span>

<%------------------------------------------%>
<div id="sidebar" data-default-open-index="2">

  <%--------------  INFO AND HELP ---------------------------------------------%>
  <h3>
    <a href="#" class="heading" id='informationAndHelp'>About ${project}</a>
  </h3>
  <div id="Help" class="menu_lefttop_drop">
    <ul style="padding-left: 1em;">
      <imp:aboutLinks/>
    </ul>
  </div>

  <%--------------  DATA STATS---------------------------------------------%>
  <h3>
    <a href="#" class="heading" id='stats'>Data Sets</a>
  </h3>
  <div class="menu_lefttop_drop" style="text-align:center;">
    <a style="white-space:nowrap;font-size:12pt;font-weight:bold"
      href="${pageContext.servletContext.contextPath}/app/search/dataset/AllDatasets/result">
      <imp:image style="border: 2px solid #666666;" src="images/genomeTable.png" width="190" height="100"/>
    </a>
  </div>

  <%--------------  NEWS AND TWITTER ---------------------------------------------%>
  <!-- number of news items to show in sidebar (there is scrollbar) -->
  <c:set var="NewsCount" value="50"/>

  <h3>
    <a href="#" class="heading">News and Tweets</a>
  </h3>
  <div id="News" class="menu_lefttop_drop">
    <!-- TWITTER WIDGET, code generated in twitter.com, EuPathDB and FungiDB account settings -->
  <!--  <a class="twitter-timeline" data-chrome="nofooter" height="50" href="https://twitter.com/${props.TWITTER_WIDGET_ID}">Tweets by ${props.project_id}</a>
    <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
-->
<a class="twitter-timeline" href="https://twitter.com/microbiomeDB">Tweets by microbiomeDB</a> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script> 
 </div>

</div>
