<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<fmt:setLocale value="en-US"/>


<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="newsQuestion" value="${xqMap['News']}"/>
<c:catch var="newsErr2">
  <c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>
</c:catch>
<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>



<%------------------------------------------%>
<div id="sidebar" data-controller="eupath.setup.configureSidebar" data-default-open-index="2">

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

  <c:choose>
    <c:when test="${newsErr2 != null}">
        <i>News temporarily unavailable</i>
    </c:when>
    <c:when test="${newsAnswer.resultSize < 1}">
        No news now, please check back later.<br>
    </c:when>
    <c:otherwise>
      <c:catch var="newsErr">
            <c:set var="i" value="1"/>
            <ul id="news">
              <c:forEach items="${newsAnswer.recordInstances}" var="record">
                <c:if test="${i <= NewsCount }">
                  <c:set var="attrs" value="${record.attributesMap}"/>
                  <c:set var='tmp' value="${attrs['tag']}"/>
                  <c:set var='shorttag' value=''/>
                  <c:forEach var="k" begin="0" end="${fn:length(tmp)}" step='3'>
                    <c:set var='shorttag'>${shorttag}${fn:substring(tmp, k, k+1)}</c:set>
                  </c:forEach>
                  <fmt:parseDate pattern="${dateStringPattern}" var="pdate" value="${attrs['date']}"/>
                  <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>
                  <li id="n-${shorttag}"><b>${fdate}</b>
                    <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#${attrs['tag']}"/>">
                      ${attrs['headline']}
                    </a>
                  </li>
                </c:if>
                <c:set var="i" value="${i+1}"/>
              </c:forEach>
            </ul>
          </c:catch>
          <c:if test="${newsErr != null}">
            <i>News temporarily unavailable<br></i>
          </c:if>
          <a class="small" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>">All ${project} News >>></a>
        <br>
      </c:otherwise>
    </c:choose>







    <!-- TWITTER WIDGET, code generated in twitter.com, EuPathDB and FungiDB account settings -->
  <!--  <a class="twitter-timeline" data-chrome="nofooter" height="50" href="https://twitter.com/${props.TWITTER_WIDGET_ID}">Tweets by ${props.project_id}</a>
    <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
-->
<a class="twitter-timeline" href="https://twitter.com/microbiomeDB">Tweets by microbiomeDB</a> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script> 
 </div>

</div>
