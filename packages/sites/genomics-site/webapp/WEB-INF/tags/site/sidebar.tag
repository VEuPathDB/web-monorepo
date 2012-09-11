<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="wir" uri="http://crashingdaily.com/taglib/wheninrome" %>

<%-- This variable gets used to limit the number of items that appear in the sidebar menus.  Change the value here to change the length of tehse menus --%>
<c:set var="SidebarLimit" value="7" />

<fmt:setLocale value="en-US"/>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<c:if test="${project == 'EuPathDB'}">
<c:catch var="e">
	<api:configurations var="config" configfile="/WEB-INF/wdk-model/config/apifed-config.xml" />
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

<c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>
<c:set var="tutAnswer" value="${tutQuestion.fullAnswer}"/>
<c:catch var="extlAnswer_exception">
    <c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
</c:catch>

<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>

<div id="leftcolumn">
  <div class="innertube3">
    <div id="menu_lefttop">


<%-- for testing: add more sites as they are being indexed
<c:if test="${project == 'AmoebaDB' || project == 'TriTrypDB' || project == 'ToxoDB'}">
--------------  SITE SEARCH  ---------------------------------------------
	<img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='stats'  href="#">Site Search</a>
        <div class="menu_lefttop_drop" style="text-align:center;">
		<imp:freefind_form searchSite="${project}"/>
 	</div>
</c:if>
--%>
<%--------------  EUPATHDB DATA STATS---------------------------------------------%>
	<img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='stats'  href="#">Data Summary</a>

        <div class="menu_lefttop_drop" style="text-align:center;">
<table width="90%" style="text-align:center;margin-left: auto;margin-right: auto;">
<tr><td style="padding:0;">
	<a style="white-space:nowrap;font-size:12pt;font-weight:bold" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">
	<img style="border: 2px solid #666666;" src="/assets/images/genomeTable.png" width="190" height="100"></a>
</td><tr>
<tr><td style="text-align:left;">
	<a class="small"  href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">
		Also check our Gene Metrics >>></a>
</td>
 </tr></table>
	</div>

<%--------------  NEWS ---------------------------------------------%>
<!-- number of news items to show in sidebar (there is scrollbar) -->
<c:set var="newsCount" value="50"/>

        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading"  href="#">News</a>

   <div class="menu_lefttop_drop" id="News">
      <c:choose>
        <c:when test="${newsAnswer.resultSize < 1}">
          No news now, please check back later.<br>
        </c:when>
        <c:otherwise>

<c:if test="${project == 'EuPathDB'}">
	<c:set var="rss_Url">
		http://${pageContext.request.serverName}/a/showXmlDataContent.do?name=XmlQuestions.NewsRss
	</c:set>
	<c:forEach items="${config}" var="s">
  		<c:set var="rss_Url">
  			${rss_Url} 
  			${fn:substringBefore(s.value,'services')}showXmlDataContent.do?name=XmlQuestions.NewsRss
  		</c:set>
	</c:forEach>
<%-- 
 wir:feed returns a SyndFeed object which has a Bean interface for 
iteration and getting SyndEntry objects and their attributes. 
See the Rome API for SyndEntry attributes you can get.
http://www.jarvana.com/jarvana/view/rome/rome/0.9/rome-0.9-javadoc.jar!/index.html
--%>
	<c:catch var="feedex">
 	<wir:feed feed="allFeeds" timeout="7000">
     		${rss_Url}
	</wir:feed>
	<wir:sort feed="allFeeds" direction="desc" value="date"/>

	<ul id="news">       <!-- newsCount was 6 when we did not have a scrollbar -->
	    <c:forEach items="${allFeeds.entries}" var="e" begin="0" end="${newsCount}" >
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

</c:if>

<c:if test="${project != 'EuPathDB'}">
    	<c:catch var="newsErr">
          <c:set var="i" value="1"/>
          <ul id="news">
          <c:forEach items="${newsAnswer.recordInstances}" var="record">

          <c:if test="${i <= newsCount }">   <!-- was 4 when we did not have a scrollbar -->

            <c:set var="attrs" value="${record.attributesMap}"/>

            <c:set var='tmp' value="${attrs['tag']}"/>
            <c:set var='shorttag' value=''/>
            <c:forEach var="k" begin="0" end="${fn:length(tmp)}" step='3'>
               <c:set var='shorttag'>${shorttag}${fn:substring(tmp, k, k+1)}</c:set>
            </c:forEach>
            
            <fmt:parseDate pattern="${dateStringPattern}" 
                           var="pdate" value="${attrs['date']}"/> 
            <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>
      
            <li id="n-${shorttag}"><b>${fdate}</b>
                   <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#${attrs['tag']}"/>">
                     ${attrs['headline']}
                   </a></li>
          </c:if>
          <c:set var="i" value="${i+1}"/>
          </c:forEach>
          </ul>
        </c:catch>
    	<c:if test="${newsErr != null}">
		<i>News temporarily unavailable<br></i>
	</c:if>
	<br>
	<a class="small" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>">All ${project} News >>></a>

</c:if>

        </c:otherwise>
      </c:choose>
   </div>


<%--------------  COMMUNITY RESOURCES ---------------------------------------------%>
    <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
    <a  class="heading" id='community' href="#">Community Resources</a>

    <div class="menu_lefttop_drop">

<a style="line-height:24px" href="javascript:gotoTwitter()">
	<img style="margin-left:17px;float:left;vertical-align:middle" title="Follow us on Twitter!" src="/assets/images/twitter.gif" width="25">
	<span style="vertical-align:sub">&nbsp;&nbsp;&nbsp;Follow us on Twitter!</span>
</a>
<br>
<a href="javascript:gotoFacebook()">
	<img style="margin-left:19px;float:left;vertical-align:middle" title="Follow us on Facebook!" src="/assets/images/facebook-icon.png" width="22">
	<span style="vertical-align:sub">&nbsp;&nbsp;&nbsp;Follow us on Facebook!</span>

</a>
<br><br>
<hr>

<c:if test="${project != 'EuPathDB'}" >
<!--  ACCESS TO COMMUNITY FILES -->
     <b>Community Files</b>
<ul>
    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
</ul>
     <hr>
</c:if>

<!--  EVENTS -->
    <b>Upcoming Events</b>
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
		<%--	   <c:if test="${count < SidebarLimit}">   --%>
               		<li id='rs-${uid}'><a href="${url}">${row[0].value}</a></li>
			   		<c:set var="count" value="${count + 1}" />
		<%--	   </c:if>   --%>
            </c:forEach>
          </c:forEach>
        </c:forEach> 
        </ul>
	<!-- not needed since now we have a window and scrollbar to see all 
		<c:if test="${count >= SidebarLimit}">
			<a style="margin-left: 0px" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Full Links Page</a><br>
		</c:if>
	-->
      </c:otherwise>
    </c:choose>

    <br><span style="font-size:8pt;font-style:italic">(If you have a link that you think would be useful for the community, 
    please <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">send us a note.)</a></span>
    </div>

<%--------------  TUTORIALS ---------------------------------------------%>
        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='tutorials' href="#">Education and Tutorials</a>
        <div class="menu_lefttop_drop">

 	<ul id="education">
	    <li id='edu-1'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>">Web Tutorials</a> (video and pdf)</a></li>
            <li id='edu-2'><a href="http://workshop.eupathdb.org/current/">EuPathDB Workshop</a></li>
            <li id='edu-3-1'><a href="http://workshop.eupathdb.org/current/index.php?page=schedule">Exercises from our most recent Workshop</a> (English)</li>
            <li id='edu-3-2'><a href="http://workshop.eupathdb.org/2011/index.php?page=schedule">Exercises from 2011 Workshop</a> (English and Spanish)</li>
	    <li id='edu-4'><a href="http://www.genome.gov/Glossary/">NCBI's Glossary of Terms</a></li>
	    <li id='edu-5'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Our Glossary</a></li>
	   
            <li id='edu-6'><a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a></li>
        </ul>

<%-- OLD
          <c:choose>
                      <c:when test="${tutAnswer.resultSize < 1}">
                        No tutorials.
                      </c:when>
                      <c:otherwise>

	<ul>
	<c:set var="count" value="0" />

	<c:forEach items="${tutAnswer.recordInstances}" var="record">
        	<c:set var="attrs" value="${record.attributesMap}"/>
		<c:forEach items="${record.tables}" var="table">
          		<c:forEach items="${table.rows}" var="row">
          		<c:set var="projects" value="${row[0].value}"/>
          		<c:if test="${fn:containsIgnoreCase(projects, project)}"> 

                          	<c:set var="urlMov" value="${row[1].value}"/>
                          	<c:if test="${urlMov != 'unavailable' && ! fn:startsWith(urlMov, 'http://')}">
                            		<c:set var="urlMov">http://eupathdb.org/tutorials/${urlMov}</c:set>
                          	</c:if>
                          	<c:set var="urlAvi" value="${row[2].value}"/>
                          	<c:if test="${urlAvi != 'unavailable' &&  ! fn:startsWith(urlAvi, 'http://')}">
                            		<c:set var="urlAvi">http://eupathdb.org/tutorials/${urlAvi}</c:set>
                          	</c:if>
                          	<c:set var="urlFlv" value="${row[3].value}"/>
                          	<c:choose>
                          	<c:when test="${ ! fn:endsWith(urlFlv, 'flv')}">
                            		<c:set var="urlFlv">http://eupathdb.org/tutorials/${urlFlv}</c:set>
                          	</c:when>
                          	<c:when test="${urlFlv != 'unavailable' &&  ! fn:startsWith(urlFlv, 'http://')}">
                            		<c:set var="urlFlv">http://eupathdb.org/flv_player/flvplayer.swf?file=/tutorials/${urlFlv}&autostart=true</c:set>
                          	</c:when>
                          	</c:choose>
				<c:set var="urlPdf" value="${row[4].value}"/>
                          	<c:if test="${urlPdf != 'unavailable' &&  ! fn:startsWith(urlPdf, 'http://')}">
                            		<c:set var="urlPdf">http://eupathdb.org/tutorials/${urlPdf}</c:set>
                          	</c:if>

                          	<c:set var="duration" value="${row[5].value}"/>
                          	<c:set var="size" value="${row[6].value}"/>

				<c:if test="${count < SidebarLimit}">	
					<c:set var="count" value="${count + 1}" />
					<li id='t-${attrs['uid']}'>${attrs['title']}<br />
                             			<c:if test="${urlMov != 'unavailable'}">
                          		 		(<a href="${urlMov}">Quick Time</a>)
                             			</c:if>
                             			<c:if test="${urlAvi != 'unavailable'}">
                          		 		(<a href="${urlAvi}">Windows media</a>)
                             			</c:if>
                             			<c:if test="${urlFlv != 'unavailable'}">
                          		 		(<a href="${urlFlv}">Flash</a>, ${row[5].value})
                             			</c:if>
						<c:if test="${urlPdf != 'unavailable'}">
                          		 		(<a href="${urlPdf}">PDF</a>)
                             			</c:if>
					  </li>
				</c:if>
			</c:if>
			</c:forEach> 
		</c:forEach>
 	</c:forEach>
	</ul>

	<c:if test="${count >= SidebarLimit}">
		<a style="margin-left:0px" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>">All Tutorials</a>
	</c:if>

                      </c:otherwise>
	</c:choose>
--%>
        </div>


<%--------------  INFO AND HELP ---------------------------------------------%>
        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='informationAndHelp' href="#">Other Information</a>
        <div class="menu_lefttop_drop">
        <ul id="information">
 		<li id='h-1'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">How to Cite us</a></li>
<c:if test="${project != 'EuPathDB'}">
		<li id='h-2'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citingproviders"/>">Citing Data Providers</a></li>
</c:if>
            	<li id='h-3'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">Organisms in ${project}</a></li>

  <li id='h-31'><a href="/EuPathDB_datasubm_SOP.pdf">EuPathDB Data Submission & Release Policies</a></li>

            	<li id='h-4'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">EuPathDB Data Summary</a></li>
            	<li id='h-5'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">EuPathDB Gene Metrics</a></li>

	<c:if test="${project == 'CryptoDB'}">
		<li id='h-61'><a href="http://cryptodb.org/static/SOP/">SOPs for <i>C.parvum</i> Annotation</a></li>
	</c:if>
        <c:if test="${project == 'ToxoDB'}">
            	<li id='h-61'><a href="/common/cosmid-BAC-tutorial/CosmidandBAC-Tutorial.html"/>Viewing Cosmid and BAC Alignments</a></li>
            	<li id='h-62'><a href="/common/array-tutorial/Array-Tutorial.html"/>Viewing Microarray Probes</a></li>
         </c:if>

            

            	<li id='h-9'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs"/>">EuPathDB Publications</a></li>
		<li id='h-91'><a href="http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en">Publications that Cite Us</a></li>
            	<li id='h-10'><a href="<c:url value="http://eupathdb.org/tutorials/eupathdbFlyer.pdf"/>">EuPathDB Brochure</a></li>
            	<li id='h-11'><a href="/proxystats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>


        </ul></div>


    </div>
  </div>
</div>
  

