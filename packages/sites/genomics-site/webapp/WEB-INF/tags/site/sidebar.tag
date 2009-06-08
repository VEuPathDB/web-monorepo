<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%-- This variable gets used to limit the number of items that appear in the sidebar menus.  Change the value here to change the length of tehse menus --%>
<c:set var="SidebarLimit" value="7" />

<fmt:setLocale value="en-US"/>

<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="newsQuestion" value="${xqMap['News']}"/>



<c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>
<c:set var="tutQuestion" value="${xqMap['Tutorials']}"/>
<c:set var="tutAnswer" value="${tutQuestion.fullAnswer}"/>
<c:set var="extlQuestion" value="${xqMap['ExternalLinks']}"/>
<c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>
 



<div id="leftcolumn">
  <div class="innertube">
    <div id="menu_lefttop">
        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='news' href="#">News</a>


<%--------------  NEWS ---------------------------------------------%>


   <div class="menu_lefttop_drop">
      <c:choose>
        <c:when test="${newsAnswer.resultSize < 1}">
          No news now, please check back later.<br>
        </c:when>
        <c:otherwise>
          <c:set var="i" value="1"/>
          <ul>
          <c:forEach items="${newsAnswer.recordInstances}" var="record">

          <c:if test="${i <= 4}">

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
                   <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#newsItem${i}"/>">
                     ${attrs['headline']}
                   </a></li>
          </c:if>
          <c:set var="i" value="${i+1}"/>
          </c:forEach>
         <%-- <li style='list-style:circle;'>
            <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>"
               class="blue">All ${project} News</a>
          </li>--%>
          </ul>

		  <a style="margin-left: 0px" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>">All ${project} News</a>

        </c:otherwise>
      </c:choose>
   </div>



<%--------------  COMMUNITY LINKS ---------------------------------------------%>
    <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
    <a  class="heading" id='community' href="#">Community Resources</a>
    <div class="menu_lefttop_drop">
    Upcoming Events
    <site:communityEventListing/>
    
    <hr>
    Related Sites
    <c:choose>
      <c:when test="${extlAnswer.resultSize < 1}">
        No links.
      </c:when>
      <c:otherwise>
        <ul>
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
			   <c:if test="${count < SidebarLimit}">
               		<li id='rs-${uid}'><a href="${url}">${row[0].value}</a></li>
			   		<c:set var="count" value="${count + 1}" />
			   </c:if>
            </c:forEach>
          </c:forEach>
        </c:forEach> 
        </ul>
		<c:if test="${count >= SidebarLimit}">
			<a style="margin-left: 0px" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Full Links Page</a><hr>
		</c:if>
      </c:otherwise>
    </c:choose>

    <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">
    <b>If you have a link that you think would be useful for the community, 
    please send us a note.</b></a>
    </div>



<%--------------  TUTORIALS ---------------------------------------------%>
        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='tutorials' href="#">Web Tutorials</a>
        <div class="menu_lefttop_drop">

          <c:choose>
                      <c:when test="${tutAnswer.resultSize < 1}">
                        No tutorials.
                      </c:when>
                      <c:otherwise>
<c:if test="${project == 'TriTrypDB'}">
The TriTrypDB tutorials will be here soon. In the meantime we provide you with 
access to PlasmoDB.org and CryptoDB.org tutorials, websites that offer the same 
navigation and querying capabilities as in TriTrypDB.org.<br>
</c:if>
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
                          <c:set var="duration" value="${row[4].value}"/>
                          <c:set var="size" value="${row[5].value}"/>
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
                          		 (<a href="${urlFlv}">Flash</a>)
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

        </div>


<%--------------  INFO AND HELP ---------------------------------------------%>
        <img src="/assets/images/${project}/menu_lft1.png" alt="" width="208" height="12" />
        <a class="heading" id='informationAndHelp' href="#">Information and Help</a>
        <div class="menu_lefttop_drop">
        <ul id=information>
            <li id='h-3'><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Glossary of Terms</a></li>
            <li id='h-2'><a href="/awstats/awstats.pl?config=${fn:toLowerCase(project)}.org">Website Usage Statistics</a></li>
            <li id='h-1'><a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a></li>
        </ul></div>


    </div>
  </div>
</div>
  
<%-- what s this for?
<script type="text/javascript">
</script>
--%>
