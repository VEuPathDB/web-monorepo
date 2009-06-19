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
<c:set var="catMap" value="${wdkModel.questionsByCategory}" />

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
				<c:forEach items="${catMap}" var="catByRec">
				    <c:if test="${catByRec.key != 'GeneRecordClasses.GeneRecordClass'}">
				      <c:set var="qByCat" value="${catByRec.value}" />
				      <c:forEach items="${qByCat}" var="cat">

<%-- SAME CODE AS IN drop_down_QG.tag --%>
<%-- fixing plural and uppercase and setting target for BLAST--%>
<%-- target is used for blast to know which target data type option should be clicked --%>

  <%--  <c:set var="recordType" value="${cat.key}" />  --%>
  <c:set var="recordType" value="${fn:substringBefore(catByRec.key,'Record')}" />

  <c:if test="${fn:containsIgnoreCase(recordType, 'Snp') || fn:containsIgnoreCase(recordType, 'Est')  || fn:containsIgnoreCase(recordType, 'Orf') }">
	<c:set var="recordType" value="${fn:toUpperCase(recordType)}" />
	<c:set var="target" value="${recordType}" />        
  </c:if>
  <c:if test="${fn:contains(recordType, 'Assem') }">
	<c:set var="recordType" value="Assemblie" />
	<c:set var="target" value="ASSEMBLIES" />
  </c:if>
  <c:if test="${fn:contains(recordType, 'Sequence') }">
        <c:set var="target" value="SEQ" />
  </c:if>
  <c:if test="${fn:contains(recordType, 'Isolate') }">
        <c:set var="target" value="ISOLATE" />
  </c:if>

					<li><img class="plus-minus plus" src="/assets/images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;<a class="heading" href="javascript:void(0)">&nbsp;${recordType}s</a><a class="detail_link small" href="categoryPage.jsp?record=${catByRec.key}&category=${cat.key}">details</a>

						<div class="sub_list">
							<ul>
								<c:forEach items="${cat.value}" var="q">
									<li><a href="showQuestion.do?questionFullName=${q.fullName}&target=${target}">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</div>
					</li>
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
				
				<c:set var="qByCat" value="${catMap['GeneRecordClasses.GeneRecordClass']}" />

				<c:forEach items="${qByCat}" var="cat">
					<li>
						<img class="plus-minus plus" src="/assets/images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;
						<a class="heading" href="javascript:void(0)">${cat.key}</a>
						<a class="detail_link small" href="categoryPage.jsp?record=GeneRecordClasses.GeneRecordClass&category=${cat.key}">details</a>
						<div class="sub_list">
							<ul>
								<c:forEach items="${cat.value}" var="q">
									<li><a href="showQuestion.do?questionFullName=${q.fullName}&target=GENE">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</div>
					</li>
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
