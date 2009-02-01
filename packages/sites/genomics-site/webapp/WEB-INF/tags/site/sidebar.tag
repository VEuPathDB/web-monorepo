<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="newsQuestion" value="${xqMap['News']}"/>
<c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>
<c:set var="dateStringPattern" value="dd MMMM yyyy HH:mm"/>

<div id="leftcolumn">
	<div class="innertube">
		<div id="menu_lefttop">
				<img src="/assets/images/TriTrypDB/menu_lft1.png" alt="" width="208" height="12" />
				<a class="heading" href="#">News</a>


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
                          
                          <fmt:parseDate pattern="${dateStringPattern}" 
                                         var="pdate" value="${attrs['date']}"/> 
                          <fmt:formatDate var="fdate" value="${pdate}" pattern="d MMMM yyyy"/>
                    
                          <li><b>${fdate}</b>
                                 <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#newsItem${i}"/>">
                                   ${attrs['headline']}
                                 </a></li>
                        </c:if>
                        <c:set var="i" value="${i+1}"/>
                        </c:forEach>
                        <li>
                          <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>"
                             class="blue">All ${project} News</a>
                        </li>
                        </ul>
                      </c:otherwise>
                    </c:choose>
				</div>

<%--------------  COMMUNITY LINKS ---------------------------------------------%>
				<img src="/assets/images/TriTrypDB/menu_lft1.png" alt="" width="208" height="12" />
				<a class="heading" href="#">Community Links</a>
				<div class="menu_lefttop_drop"><ul>
					<li><a href="http://www.genedb.org/">GeneDB</a></li>
					<li><a href="http://www.EuPathDB.org/">EuPathDB</a></li>
					<li><a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a></li>
					<li><a href="http://www.wellcome.ac.uk/index.htm">The Wellcome Trust</a></li>
					<li><a href="http://www.who.int/trypanosomiasis_african/en/index.html">Human African Trypanosomiasis</a></li>
					<li><a href="http://www.who.int/neglected_diseases/diseases/chagas/en/">Chagas Disease - American Trypanosomiasis</a></li>
					<li><a href="http://www.who.int/leishmaniasis/en/">Leishmaniasis</a></li>
					<li><a href="http://www.who.int/tdr/">WHO/TDR</a></li>
                                        <li><a href="http://www.vsgdb.net/">VSG-DB</a></li>
                                        <li><a href="http://trypanofan.path.cam.ac.uk/trypanofan/main/">TrypanoFAN</a></li>
                                        <li><a href="http://tryps.rockefeller.edu/">TrypsRU</a></li>

					<br><a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;"><b>If you have a link that you think would be useful for the community, please send us a note.</b></a>
				</ul></div>



<%--------------  TUTORIALS ---------------------------------------------%>
				<img src="/assets/images/TriTrypDB/menu_lft1.png" alt="" width="208" height="12" />
				<a class="heading" href="#">Web Tutorials</a>
				<div class="menu_lefttop_drop"><ul>
The TriTrypDB tutorials will be here soon. In the meantime we provide you with access to PlasmoDB and CryptoDB tutorials, websites that offer similar navigation and querying capabilities.<br><br>
						<li>Queries and Tools<br />(<a href="http://apidb.org/tutorials/QueriesAndTools_PlasmoDB_5.3.mov">Quick Time</a>) 
								(<a href="http://apidb.org/tutorials/QueriesAndTools_PlasmoDB_5.3.avi">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/QueriesAndTools_PlasmoDB_5.3.flv&autostart=true">Flash</a>)</li>
						<li>Query History<br />(<a href="http://apidb.org/tutorials/QueryHistory_CryptoDB_3.5.mov">Quick Time</a>) 
								(<a href="http://apidb.org/tutorials/QueryHistory_CryptoDB_3.5.wmv">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/QueryHistory_CryptoDB_3.5.flv&autostart=true">Flash</a>)</li>
						<li>Introduction to the Genome Browser<br />(<a href="http://apidb.org/tutorials/GenomeBrowserIntro_CryptoDB_3.5.mov">Quick Time</a>) 
								(<a href="http://apidb.org/tutorials/GenomeBrowserIntro_CryptoDB_3.5.avi">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/GenomeBrowserIntro_CryptoDB_3.5.flv&autostart=true">Flash</a>)</li>
     						<li>Options to Download Results<br />(<a href="http://apidb.org/tutorials/DownloadResults_PlasmoDB_5.3.mov">Quick Time</a>)
								(<a href="http://apidb.org/tutorials/DownloadResults_PlasmoDB_5.3.avi">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/DownloadResults_PlasmoDB_5.3.flv&autostart=true">Flash</a>)</li>
						<li>List of Gene Identifiers as Query Input<br />(<a href="http://apidb.org/tutorials/ListOfIDs_PlasmoDB_5.3.mov">Quick Time</a>) 
								(<a href="http://apidb.org/tutorials/ListOfIDs_PlasmoDB_5.3.avi">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/ListOfIDs_PlasmoDB_5.3.flv&autostart=true">Flash</a>)</li>
						<li>Query Result Column Management<br />(<a href="http://apidb.org/tutorials/ColumnManagement_PlasmoDB_5.3.mov">Quick Time</a>)
								(<a href="http://apidb.org/tutorials/ColumnManagement_PlasmoDB_5.3.avi">Windows Media</a>) 
								(<a href="http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/ColumnManagement_PlasmoDB_5.3.flv&autostart=true">Flash</a>)</li>
			<%--	<site:tutorials/>   --%>
				</ul></div>



<%--------------  INFO AND HELP ---------------------------------------------%>
				<img src="/assets/images/TriTrypDB/menu_lft1.png" alt="" width="208" height="12" />
				<a class="heading" href="#">Information and Help</a>
				<div class="menu_lefttop_drop"><ul>
						<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>">Glossary of Terms</a></li>
						<li><a href="/awstats/awstats.pl?config=tritrypdb.org">Website Usage Statistics</a></li>
						<li><a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a></li>
				</ul></div>


		</div>
	</div>
</div>
	
