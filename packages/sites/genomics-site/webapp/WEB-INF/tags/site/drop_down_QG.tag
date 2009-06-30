<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCatMap" value="${wdkModel.rootCategoryMap}" />

	<ul>
		<c:forEach items="${rootCatMap}" var="rootCatEntry">
		    <c:set var="recType" value="${rootCatEntry.key}" />
		    <c:set var="rootCat" value="${rootCatEntry.value}" />
		  <c:if test="${recType == 'GeneRecordClasses.GeneRecordClass' || recType == 'SequenceRecordClasses.SequenceRecordClass'  || recType == 'OrfRecordClasses.OrfRecordClass' || recType == 'EstRecordClasses.EstRecordClass' || recType == 'IsolateRecordClasses.IsolateRecordClass' || recType == 'SnpRecordClasses.SnpRecordClass' || recType == 'AssemblyRecordClasses.AssemblyRecordClass' || recType == 'SageTagRecordClasses.SageTagRecordClass' }">
		 <c:choose>
		  <c:when test="${recType=='GeneRecordClasses.GeneRecordClass'}">
			<li><a href="#">Search for Genes</a>
				<ul>
					<c:forEach items="${rootCat.children}" var="catEntry">
					    <c:set var="cat" value="${catEntry.value}" />
						<li>
							<a href="javascript:void(0)">${cat.displayName}</a>
							<ul>
								<c:forEach items="${cat.question}" var="qEntry">
								    <c:set var="q" value="${qEntry.value}" />
									<li><a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}&target=GENE"/>">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</li>
					</c:forEach>
				</ul>
			</li>
		  </c:when>
		  <c:otherwise>
			<c:set var="qByCat" value="${catByRec.value}" />


<%-- SAME CODE AS IN DQG_bubble.tag --%>
<c:set var="recordType" value="${fn:substringBefore(catByRec.key,'Record')}" />
<c:if test="${fn:containsIgnoreCase(recordType, 'Snp') || fn:contains(recordType, 'Est')  || fn:contains(recordType, 'Orf') }">
	<c:set var="recordType" value="${fn:toUpperCase(recordType)}" />
	<c:set var="target" value="${recordType}" />         <%-- target is used for blast to know which target data type option should be clicked --%>
</c:if>
<c:if test="${fn:containsIgnoreCase(recordType, 'SageTag') }">
	<c:set var="recordType" value="SAGE Tag" />
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

			<c:forEach items="${rootCat.children}" var="catEntry">
			    <c:set var="cat" value="${catEntry.value}" />
		<%--	<li><a href="#">${cat.displayName}s</a>  --%>
			<li><a href="#">Search for ${recordType}s</a> 
				<ul>
				<c:forEach items="${cat.question}" var="qEntry">
				    <c:set var="q" value="${qEntry.value}" />
				    <li><a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}&target=${target}"/>">${q.displayName}</a></li>
				</c:forEach>
				</ul>
			</li>
			</c:forEach>
		  </c:otherwise>
		 </c:choose>
		 </c:if>
		</c:forEach>

        <li><a href="<c:url value="/queries_tools.jsp"/>">View all available searches</a></li>
	</ul>
