<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="banner" 
 			  type="java.lang.String"
			  required="true" 
			  description="Image to be displayed as the title of the bubble"
%>

<%@ attribute name="alt_banner" 
 			  type="java.lang.String"
			  required="true" 
			  description="String to be displayed as the title of the bubble"
%>

<%@ attribute name="recordClasses" 
 			  type="java.lang.String"
			  required="false" 
			  description="Class of queries to be displayed in the bubble"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCats" value="${wdkModel.websiteRootCategories}" />

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<c:choose>
<c:when test="${wdkUser.stepCount == null}">
<c:set var="count" value="0"/>
</c:when>
<c:otherwise>
<c:set var="count" value="${wdkUser.strategyCount}"/>
</c:otherwise>
</c:choose>

<div class="threecolumndiv">
<img class="threecolumndivimg" src="/assets/images/${project}/${banner}" alt="${alt_banner}" width="247" height="46" />
<c:choose>

<%---------------------------------   TOOLS  -------------------------%>
	<c:when test="${recordClasses == null}">
		<site:DQG_tools />
	</c:when>

<%---------------------------------   RECORDCLASSSES OTHER THAN GENES  -------------------------%>
	<c:when test="${recordClasses == 'others'}">
		<div id="info">
			<p class="small" align="center"><a href="true">Expand All</a> | <a href="false">Collapse All</a></p>
			<ul class="heading_list">
				<c:forEach items="${rootCats}" var="rootCatEntry">
				    <c:if test="${rootCatEntry.key != 'GeneRecordClasses.GeneRecordClass'}">
				      <c:set var="rootCat" value="${rootCatEntry.value}" />
				      <c:forEach items="${rootCat.websiteChildren}" var="catEntry">
				          <c:set var="cat" value="${catEntry.value}" />
				          <c:if test="${fn:length(cat.websiteQuestions) > 0}">
<%-- SAME CODE AS IN drop_down_QG.tag --%>
<%-- fixing plural and uppercase --%>

                                        <c:set var="display" value="${fn:substring(cat.displayName, 11, -1)}" />
					<li>
                                            <img class="plus-minus plus" src="/assets/images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;
                                            <a class="heading" href="javascript:void(0)">&nbsp;${display}</a>
						 <c:if test="${rootCatEntry.key != 'DynSpanRecordClasses.DynSpanRecordClass'}">
							<a class="detail_link small" href="categoryPage.jsp?record=${rootCat.name}&category=${cat.name}">details</a>
						 </c:if>
						<div class="sub_list">
							<ul>
								<c:forEach items="${cat.websiteQuestions}" var="q">
									<li><a href="showQuestion.do?questionFullName=${q.fullName}">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</div>
					</li>
                                        </c:if>
				      </c:forEach>
				    </c:if>
				</c:forEach>	
			</ul>
		</div>
		<div id="infobottom">
 		<%--	<div id="mysearchhist">
				<a href="<c:url value="/showApplication.do?showHistory=true"/>">My Searches: ${count}</a>
			</div>  --%>
		</div>
	</c:when>

<%---------------------------------   GENES  -------------------------%>
	<c:otherwise>
		<div id="info">
			<p class="small" align="center"><a href="true">Expand All</a> | <a href="false">Collapse All</a></p>
			<ul class="heading_list">
				
				<c:set var="rootCat" value="${rootCats['GeneRecordClasses.GeneRecordClass']}" />
				<c:forEach items="${rootCat.websiteChildren}" var="catEntry">
				    <c:set var="cat" value="${catEntry.value}" />
                                    <c:if test="${fn:length(cat.websiteQuestions) > 0}">
					<li>
						<img class="plus-minus plus" src="/assets/images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;
						<a class="heading" href="javascript:void(0)">${cat.displayName}</a>
						<a class="detail_link small" href="categoryPage.jsp?record=GeneRecordClasses.GeneRecordClass&category=${cat.name}">details</a>
						<div class="sub_list">
							<ul>
								<c:forEach items="${cat.websiteQuestions}" var="q">
									<li><a href="showQuestion.do?questionFullName=${q.fullName}">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</div>
					</li>
                                    </c:if>
				</c:forEach>
			</ul>	
		</div>
		<div id="infobottom">
		<%--	<div id="mysearchhist">
				<a href="<c:url value="/showApplication.do?showHistory=true"/>">My Searches: ${count}</a>
			</div> --%>
    	</div>
	</c:otherwise>
</c:choose>	

<!--<img src="/assets/images/bubble_bottom.png" alt="" width="247" height="35" />-->
</div>
