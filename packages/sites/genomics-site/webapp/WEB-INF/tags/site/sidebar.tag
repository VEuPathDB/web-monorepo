<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>

<%-- JSP constants --%>
<jsp:useBean id="constants" class="org.eupathdb.common.model.JspConstants"/>

<%-- Limit the number of items that appear in the sidebar menus.
     Change the value here to change the length of these menus. --%>
<c:set var="SidebarLimit" value="7" />

<c:set var="project" value="${applicationScope.wdkModel.name}" />
<fmt:setLocale value="en-US"/>

<c:if test="${project == 'EuPathDB'}">
  <c:catch var="e">
    <api:configurations var="config" configfile="/WEB-INF/wdk-model/config/projects.xml" />
  </c:catch>
  <c:if test="${e!=null}">
    <font size="-1" color="#CC0033">News not available for the component Sites</font>
  </c:if>
</c:if>

<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>

<c:set var="newsQuestion" value="${xqMap['News']}"/>
<c:set var="tutQuestion" value="${xqMap['Tutorials']}"/>
<c:set var="extlQuestion" value="${xqMap['ExternalLinks']}"/>

<c:catch var="newsErr2">
  <c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>
</c:catch>


<c:set var="tutAnswer" value="${tutQuestion.fullAnswer}"/>
<c:catch var="extlAnswer_exception">
  <c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
</c:catch>

<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>

<%------------------------------------------%>
<div id="menu_lefttop">
  <%-- for testing SITE SEARCH : add more sites as they are being indexed
  <c:if test="${project == 'AmoebaDB' || project == 'TriTrypDB' || project == 'ToxoDB'}">
    --------------  SITE SEARCH  ---------------------------------------------
    <a class="heading" id='stats'  href="#">Site Search</a>
    <div class="menu_lefttop_drop" style="text-align:center;">
      <imp:freefind_form searchSite="${project}"/>
    </div>
  </c:if>
  --%>

  <%--------------  EUPATHDB DATA STATS---------------------------------------------%>
  <a class="heading" id='stats'  href="#">Data Summary</a>

  <c:choose>
    <c:when test="${project == 'TrichDB'}">
      <c:set var="linkToDataSummary" value="/eupathGenomeTable.jsp" />
      <c:set var="linkToGeneMetrics" value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics" />
    </c:when>
    <c:otherwise>
      <c:set var="linkToDataSummary" value="/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes" />
      <c:set var="linkToGeneMetrics" value="/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics" />
    </c:otherwise>
  </c:choose>

  <div class="menu_lefttop_drop" style="text-align:center;">
    <table width="90%" style="text-align:center;margin-left: auto;margin-right: auto;">
      <tr>
        <td style="padding:0;">
          <a style="white-space:nowrap;font-size:12pt;font-weight:bold" href="<c:url value="${linkToDataSummary}"/>">
            <imp:image style="border: 2px solid #666666;" src="images/genomeTable.png" width="190" height="100"/></a>
        </td>
      </tr>
      <tr>
        <td style="text-align:left;">
          <a class="small"  href="<c:url value="${linkToGeneMetrics}"/>">
            Also check our Gene Metrics &gt;&gt;&gt;</a>
        </td>
      </tr>
    </table>
  </div>

  <%--------------  NEWS ---------------------------------------------%>
  <!-- number of news items to show in sidebar (there is scrollbar) -->
  <c:set var="NewsCount" value="50"/>

  <a class="heading"  href="#">News and Tweets</a>
  <div class="menu_lefttop_drop" id="News">
    <c:choose>
      <c:when test="${newsErr2 != null}">
        <i>News temporarily unavailable</i>
      </c:when>
      <c:when test="${newsAnswer.resultSize < 1}">
        No news now, please check back later.<br>
      </c:when>
      <c:otherwise>
        <c:if test="${project == 'EuPathDB'}">
          <c:set var="rss_Url">
            http://${pageContext.request.serverName}/a/showXmlDataContent.do?name=XmlQuestions.NewsRss
          </c:set>
          <c:forEach items="${config}" var="s">
            <c:set var="rss_base_url">
              <%--
                s.value should be like
                  http://microsporidiadb.org/micro/services/WsfService
                rss_base_url should then be computed as
                  http://microsporidiadb.org/micro/
              --%>
              ${fn:substringBefore(s.value,'services')}
            </c:set>
            <c:if test="${fn:startsWith(rss_base_url, 'http')}">
              <c:set var="rss_Url">
                ${rss_Url}
                ${rss_base_url}showXmlDataContent.do?name=XmlQuestions.NewsRss
              </c:set>
            </c:if>
          </c:forEach>
          <%--
           wir:feed returns a SyndFeed object which has a Bean interface for
          iteration and getting SyndEntry objects and their attributes.
          See the Rome API for SyndEntry attributes you can get
          http://www.jarvana.com/jarvana/view/rome/rome/0.9/rome-0.9-javadoc.jar!/index.html
          --%>
          <c:catch var="feedex">
            <wir:feed feed="allFeeds" timeout="7000">
              ${rss_Url}
            </wir:feed>
            <wir:sort feed="allFeeds" direction="desc" value="date"/>
            <ul id="news">
              <c:forEach items="${allFeeds.entries}" var="e" begin="0" end="${NewsCount}" >
                <fmt:formatDate var="fdate" value="${e.publishedDate}" pattern="d MMMM yyyy"/>
                <c:if test="${fdate != null && e.author != null}">
                  <li id="n-${shorttag}">
                    <b>${fdate}</b>
                    <a href='${e.link}'>${e.title}</a>
                  </li>
                </c:if>
              </c:forEach>
            </ul>
          </c:catch>

          <c:if test="${feedex != null}">
            <i>Specific-Organism Site News temporarily unavailable</i><br>
          </c:if>
          <br>
          <a class="small" href="<c:url value="/aggregateNews.jsp"/>">All ${project} News >>></a>
        </c:if> <%-- project is EuPathDB --%>

        <c:if test="${project != 'EuPathDB'}">
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
        </c:if>  <%-- project is NOT  EuPathDB --%>
        <br>
      </c:otherwise>
    </c:choose>

    <!-- TWITTER WIDGET, code generated in twitter.com, EuPathDB and FungiDB account settings -->
    <c:set var="props" value="${applicationScope.wdkModel.properties}" />
    <a class="twitter-timeline" data-chrome="nofooter"  height="50"  href="https://twitter.com/${props['TWITTER_ID']}" data-widget-id="${props['TWITTER_WIDGET_ID']}"></a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

    <c:if test="${project == 'FungiDB'}">
      <a class="twitter-timeline" data-chrome="nofooter"  height="50"  href="https://twitter.com/eupathdb" data-widget-id="344817818073714691"></a>
      <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
    </c:if>

  </div>  <%-- section that opens and closes --%>


  <%--------------  COMMUNITY RESOURCES ---------------------------------------------%>
  <a  class="heading" id='community' href="#">Community Resources</a>
  <div class="menu_lefttop_drop">
    <ul><imp:socialMedia label="true"/></ul>
    <hr>

    <c:if test="${project != 'EuPathDB'}" >
      <!--  ACCESS TO COMMUNITY FILES -->
      <b>Community Files</b>
      <ul>
        <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
        <li><a href="<c:url value="/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
      </ul>
      <hr>
    </c:if>

    <!--  EVENTS -->
    <b>Upcoming Events with EuPathDB presence</b>
    <imp:communityEventListing/>
    <br><br>
    <hr>

    <!--  LINKS to interesting sites -->
    <b>Related Sites</b>
    <c:choose>
      <c:when test="${extlAnswer_exception != null}">
        <br><font size="-1" color="#CC0033"><i>Error. related sites temporarily unavailable</i></font><br>
      </c:when>
      <c:when test="${extlAnswer.resultSize < 1}">
        No links.
      </c:when>
      <c:otherwise>
        <ul class="related-sites">
          <c:set var="count" value="0" />
          <c:forEach items="${extlAnswer.recordInstances}" var="record">
            <c:forEach items="${record.tables}" var="table">
              <c:forEach items="${table.rows}" var="row">
                <c:set var='url' value='${row[1].value}'/>
                <c:set var='tmp' value='${fn:replace(url, "http://", "")}'/>
                <c:set var='tmp' value='${fn:replace(tmp, ".", "")}'/>
                <c:set var='uid' value=''/>
                <c:forEach var="i" begin="0" end="${fn:length(tmp)}" step='3'>
                  <c:set var='uid'>${uid}${fn:substring(tmp, i, i+1)}</c:set>
                </c:forEach>
                <li id='rs-${uid}'><a href="${url}">${row[0].value}</a></li>
                <c:set var="count" value="${count + 1}" />
              </c:forEach>
            </c:forEach>
          </c:forEach>
        </ul>
      </c:otherwise>
    </c:choose>
    <br><span style="font-size:8pt;font-style:italic">(If you have a link that you think would be useful for the community,
    please <a href="<c:url value="/contact.do"/>" class="new-window" data-name="contact_us">send us a note.)</a></span>
  </div>

  <%--------------  TUTORIALS ---------------------------------------------%>
  <a class="heading" id='tutorials' href="#">Education and Tutorials</a>
  <div class="menu_lefttop_drop">
    <ul id="education">
      <li id='edu-05'>
        <a target="_blank" href="${constants.youtubeUrl}">
          YouTube Tutorials Channel
          <imp:image style="width:20px;display:inline;vertical-align:middle;" src="images/youtube_32x32.png"/>
        </a>
      </li>
      <li id='edu-1'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>">Web Tutorials</a> (video and pdf)</li>
      <li id='edu-1'><a href="http://maps.google.com/maps/ms?vps=2&ie=UTF8&hl=en&oe=UTF8&msa=0&msid=208351045565585105018.000490de33b177c1f9068">Global view of EuPathDB training</a></li>
      <li id='edu-2'><a href="http://workshop.eupathdb.org">EuPathDB Workshops</a></li>
      <!--  <li id='edu-3-1'><a href="http://workshop.eupathdb.org/most_recent/index.php?page=schedule">Exercises from our most recent Workshop at UGA</a> (English)</li> -->
      <li id='edu-3-2'><a href="http://workshop.eupathdb.org/athens/2011/index.php?page=schedule">Exercises from 2011 Workshop at UGA</a> (English and Spanish)</li>
      <li id='edu-4'><a href="http://www.genome.gov/Glossary/">NCBI's Glossary of Terms</a></li>
      <li id='edu-5'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Our Glossary</a></li>
      <li id='edu-6'><a href="${pageContext.request.contextPath}/contact.do" class="new-window" data-name="contact_us">Contact Us</a></li>
    </ul>
  </div>


  <%--------------  INFO AND HELP ---------------------------------------------%>
  <a class="heading" id='informationAndHelp' href="#">About ${project}</a>
  <div class="menu_lefttop_drop">
    <ul id="information">
      <imp:aboutMenu/>
    </ul>
  </div>

</div>
