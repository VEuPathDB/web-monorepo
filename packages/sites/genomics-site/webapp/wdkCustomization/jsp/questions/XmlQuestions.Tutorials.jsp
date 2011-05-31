<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="banner" value="${wdkModel.displayName} ${xmlAnswer.question.displayName}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="tutAnswer" value="${requestScope.wdkXmlAnswer}"/>


<site:header title="${wdkModel.displayName} : Tutorials"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Tutorials"
                 division="tutorials"
                 headElement="${headElement}" />



       <c:choose>
                      <c:when test="${tutAnswer.resultSize < 1}">
                        No tutorials.
                      </c:when>
                      <c:otherwise>

	<ul>

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
                          		 	(<a href="${urlPdf}">pdf</a>)
                             		</c:if>
				</li>

			</c:if>
			</c:forEach> 
		</c:forEach>
	<br />
 	</c:forEach>
	</ul>

                      </c:otherwise>
	</c:choose>



<site:footer/>
