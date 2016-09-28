<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>


<c:set var="project" value="${applicationScope.wdkModel.name}" />
<fmt:setLocale value="en-US"/>

<%------------------------------------------%>
<div id="menu_lefttop">

  <%--------------  DATA STATS---------------------------------------------%>
  <a class="heading" id='stats'  href="#">Data Summary</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>

  <%--------------  NEWS ---------------------------------------------%>
  <!-- number of news items to show in sidebar (there is scrollbar) -->
  <c:set var="NewsCount" value="50"/>

  <a class="heading"  href="#">News and Tweets</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>


  <%--------------  COMMUNITY RESOURCES ---------------------------------------------%>
  <a  class="heading" id='community' href="#">Community Resources</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>

  <%--------------  TUTORIALS ---------------------------------------------%>
  <a class="heading" id='tutorials' href="#">Education and Tutorials</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>


  <%--------------  INFO AND HELP ---------------------------------------------%>
  <a class="heading" id='informationAndHelp' href="#">About ${project}</a>
  <div class="menu_lefttop_drop">
    TODO
  </div>

</div>
